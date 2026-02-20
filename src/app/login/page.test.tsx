import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "./page";
import { signIn } from "@/lib/auth-client";

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    social: vi.fn(),
  },
}));

describe("Login Page", () => {
  it("renders the login button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /Sign in with Google/i })).toBeInTheDocument();
  });

  it("calls signIn.social when the login button is clicked", () => {
    render(<LoginPage />);

    const loginButton = screen.getByRole("button", { name: /Sign in with Google/i });
    fireEvent.click(loginButton);

    expect(signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/dashboard",
    });
  });
});
