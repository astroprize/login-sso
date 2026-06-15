import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignInPage from "./page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null }),
}));

const mockSignInWithOtp = vi.fn();
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ auth: { signInWithOtp: mockSignInWithOtp } }),
}));

describe("SignInPage", () => {
  beforeEach(() => {
    mockSignInWithOtp.mockReset();
    vi.stubGlobal("sessionStorage", { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() });
  });

  it("renders email form", () => {
    render(<SignInPage />);
    expect(screen.getByRole("textbox", { name: /email/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /send magic link/i })).toBeTruthy();
  });

  it("shows 'Check your inbox' after successful OTP request", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    render(<SignInPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeTruthy();
    });
  });

  it("shows error message on OTP failure", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: { message: "Rate limit exceeded" } });
    render(<SignInPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => {
      expect(screen.getByText(/rate limit exceeded/i)).toBeTruthy();
    });
  });
});
