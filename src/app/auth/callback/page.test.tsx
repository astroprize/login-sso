import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import CallbackPage from "./page";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockGetSession = vi.fn();
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ auth: { getSession: mockGetSession } }),
}));

const sessionStorageMock = {
  getItem: vi.fn(() => null),
  removeItem: vi.fn(),
  setItem: vi.fn(),
};

beforeEach(() => {
  mockReplace.mockReset();
  mockGetSession.mockReset();
  sessionStorageMock.getItem.mockReturnValue(null);
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
    writable: true,
  });
});

describe("CallbackPage", () => {
  it("redirects to /sign-in when no session", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<CallbackPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/sign-in");
    }, { timeout: 3000 });
  });

  it("redirects to apps.dparmar.com when next is missing", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "eyJ.test.sig", expires_at: 9999999999 } },
      error: null,
    });
    render(<CallbackPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("https://apps.dparmar.com");
    });
  });

  it("redirects to trusted next URL from sessionStorage", async () => {
    sessionStorageMock.getItem.mockReturnValue("https://socal.dparmar.com");
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "eyJ.test.sig", expires_at: 9999999999 } },
      error: null,
    });
    render(<CallbackPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("https://socal.dparmar.com");
    });
  });

  it("falls back to apps.dparmar.com for untrusted next", async () => {
    sessionStorageMock.getItem.mockReturnValue("https://evil.com");
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "eyJ.test.sig", expires_at: 9999999999 } },
      error: null,
    });
    render(<CallbackPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("https://apps.dparmar.com");
    });
  });
});
