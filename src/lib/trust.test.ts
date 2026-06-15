import { describe, it, expect } from "vitest";
import { isTrustedNext } from "./trust";

describe("isTrustedNext", () => {
  it("accepts apps.dparmar.com", () => {
    expect(isTrustedNext("https://apps.dparmar.com")).toBe(true);
  });

  it("accepts any *.dparmar.com subdomain", () => {
    expect(isTrustedNext("https://socal.dparmar.com")).toBe(true);
    expect(isTrustedNext("https://pods.dparmar.com/dashboard")).toBe(true);
    expect(isTrustedNext("https://login.dparmar.com/sign-in")).toBe(true);
  });

  it("rejects external domains", () => {
    expect(isTrustedNext("https://evil.com")).toBe(false);
    expect(isTrustedNext("https://dparmar.com.evil.com")).toBe(false);
    expect(isTrustedNext("https://notdparmar.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isTrustedNext("")).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(isTrustedNext("not-a-url")).toBe(false);
    expect(isTrustedNext("javascript:alert(1)")).toBe(false);
  });
});
