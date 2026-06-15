export interface SessionInfo {
  access_token: string;
  expires_at: number; // unix timestamp in seconds
}

export function buildCookieString(session: SessionInfo): string {
  const expires = new Date(session.expires_at * 1000).toUTCString();
  return `sb-access-token=${session.access_token}; domain=.dparmar.com; path=/; expires=${expires}; Secure; SameSite=Lax`;
}

export function clearCookieString(): string {
  return "sb-access-token=; domain=.dparmar.com; path=/; Max-Age=0; Secure; SameSite=Lax";
}
