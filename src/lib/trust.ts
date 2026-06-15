export function isTrustedNext(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "apps.dparmar.com" || host.endsWith(".dparmar.com");
  } catch {
    return false;
  }
}
