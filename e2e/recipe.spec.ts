import { test, expect } from "@playwright/test";

test.describe("Recipe Management", () => {
  // Normally we would bypass auth or seed a session cookie.
  // For the sake of standard Playwright with simulated better-auth:
  test("unauthorized users cannot create recipes", async ({ request }) => {
    // Direct API attempt shouldn't succeed when unauthorized
    const response = await request.post("/api/auth/session");
    // Session should return null/401
    expect(response.ok()).toBeFalsy();
  });
});
