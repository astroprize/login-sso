import { describe, it, expect } from "vitest";
import { buildCookieString, clearCookieString } from "./cookie";

const FAKE_JWT = "eyJhbGciOiJIUzI1NiJ9.test.sig";

describe("buildCookieString", () => {
  it("includes the access token", () => {
    const result = buildCookieString({ access_token: FAKE_JWT, expires_at: 9999999999 });
    expect(result).toContain(`sb-access-token=${FAKE_JWT}`);
  });

  it("sets domain=.dparmar.com", () => {
    const result = buildCookieString({ access_token: FAKE_JWT, expires_at: 9999999999 });
    expect(result).toContain("domain=.dparmar.com");
  });

  it("sets Secure and SameSite=Lax", () => {
    const result = buildCookieString({ access_token: FAKE_JWT, expires_at: 9999999999 });
    expect(result).toContain("Secure");
    expect(result).toContain("SameSite=Lax");
  });

  it("sets path=/", () => {
    const result = buildCookieString({ access_token: FAKE_JWT, expires_at: 9999999999 });
    expect(result).toContain("path=/");
  });

  it("uses expires_at to set cookie expiry", () => {
    const expiresAt = 2000000000; // ~2033
    const result = buildCookieString({ access_token: FAKE_JWT, expires_at: expiresAt });
    const expected = new Date(expiresAt * 1000).toUTCString();
    expect(result).toContain(expected);
  });
});

describe("clearCookieString", () => {
  it("clears the cookie with Max-Age=0", () => {
    const result = clearCookieString();
    expect(result).toContain("sb-access-token=;");
    expect(result).toContain("Max-Age=0");
    expect(result).toContain("domain=.dparmar.com");
  });
});
