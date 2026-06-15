import { test, expect } from "@playwright/test";

const INBUCKET_URL = "http://localhost:54324";

async function getLatestMagicLink(email: string): Promise<string> {
  const res = await fetch(`${INBUCKET_URL}/api/v1/mailbox/${email.split("@")[0]}`);
  const messages = await res.json();
  const latest = messages[messages.length - 1];
  const msgRes = await fetch(`${INBUCKET_URL}/api/v1/mailbox/${email.split("@")[0]}/${latest.id}`);
  const msg = await msgRes.json();
  const match = msg.body.text.match(/https?:\/\/[^\s]+/);
  if (!match) throw new Error("No link found in email");
  return match[0];
}

test.describe("Magic link auth flow", () => {
  const TEST_EMAIL = "testuser@dparmar.com";

  test("full sign-in flow redirects to trusted next", async ({ page }) => {
    await page.goto("/sign-in?next=https://socal.dparmar.com");

    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/check your inbox/i)).toBeVisible();

    const magicLink = await getLatestMagicLink(TEST_EMAIL);
    await page.goto(magicLink);

    await page.waitForURL("https://socal.dparmar.com**", { timeout: 10_000 });
    const cookies = await page.context().cookies("https://socal.dparmar.com");
    const authCookie = cookies.find((c) => c.name === "sb-access-token");
    expect(authCookie).toBeDefined();
    expect(authCookie?.domain).toBe(".dparmar.com");
  });

  test("untrusted next falls back to apps.dparmar.com", async ({ page }) => {
    await page.goto("/sign-in?next=https://evil.com");

    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');

    const magicLink = await getLatestMagicLink(TEST_EMAIL);
    await page.goto(magicLink);

    await page.waitForURL("https://apps.dparmar.com**", { timeout: 10_000 });
  });

  test("sign-out clears cookie and lands on /sign-in", async ({ page, context }) => {
    await context.addCookies([{
      name: "sb-access-token",
      value: "fake-jwt",
      domain: ".dparmar.com",
      path: "/",
      secure: true,
      sameSite: "Lax",
    }]);

    await page.goto("/sign-out");
    await page.waitForURL("**/sign-in");

    const cookies = await context.cookies("http://localhost:3000");
    const authCookie = cookies.find((c) => c.name === "sb-access-token");
    expect(!authCookie || authCookie.value === "").toBe(true);
  });

  test("direct /auth/callback with no session redirects to /sign-in", async ({ page }) => {
    await page.goto("/auth/callback");
    await page.waitForURL("**/sign-in", { timeout: 5_000 });
  });
});
