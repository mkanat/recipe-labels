import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    // Attempt to access dashboard
    await page.goto("/");

    // Expect redirect to login
    await expect(page).toHaveURL(/.*login/);

    // Verify login page renders correctly
    await expect(page.locator("h1")).toContainText("Recipe Labels");
    await expect(page.locator("button", { hasText: "Sign in with Google" })).toBeVisible();
  });
});
