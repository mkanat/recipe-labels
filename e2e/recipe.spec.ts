import { test, expect } from "@playwright/test";
import { STORAGE_STATE_PATH, TEST_USER_ID } from "./global-setup";

// Use the seeded authenticated session for all tests in this file
test.use({ storageState: STORAGE_STATE_PATH });

async function cleanUserRecipes(baseURL: string) {
  const response = await fetch(`${baseURL}/api/test-cleanup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: TEST_USER_ID }),
  });
  if (!response.ok) {
    throw new Error(`test-cleanup failed: ${response.status} ${await response.text()}`);
  }
}

test.describe.configure({ mode: "serial" });

test.describe("Recipe Management", () => {
  test.beforeAll(async ({ baseURL }) => {
    await cleanUserRecipes(baseURL ?? "http://localhost:3000");
  });

  test.beforeEach(async ({ baseURL }) => {
    await cleanUserRecipes(baseURL ?? "http://localhost:3000");
  });

  test("unauthorized users cannot create recipes", async ({ request }) => {
    const response = await request.post("/api/auth/session");
    expect(response.ok()).toBeFalsy();
  });

  test("user sees recipe list after login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByText("No recipes found.")).toBeVisible();
  });

  test("user can add a recipe and it appears in the list", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /add recipe/i }).click();

    await page.getByLabel(/temperature/i).fill("375");
    await page.getByLabel(/time/i).fill("20");
    await page.getByLabel(/instructions/i).fill("Bake until golden brown.");

    await page
      .getByRole("button", { name: /add recipe/i })
      .last()
      .click();

    await expect(page.getByText("Bake until golden brown.")).toBeVisible();
    await expect(page.getByText(/375°F/).first()).toBeVisible();
    await expect(page.getByText(/20 min/).first()).toBeVisible();
  });

  test("user can delete a recipe and it disappears", async ({ page }) => {
    await page.goto("/");

    // Add a recipe first
    await page.getByRole("button", { name: /add recipe/i }).click();
    await page.getByLabel(/temperature/i).fill("400");
    await page.getByLabel(/time/i).fill("30");
    await page.getByLabel(/instructions/i).fill("Roast at high heat.");
    await page
      .getByRole("button", { name: /add recipe/i })
      .last()
      .click();
    await expect(page.getByText("Roast at high heat.")).toBeVisible();

    // Swipe right to delete using real mouse drag (Framer Motion requires real pointer events)
    const recipeItem = page.locator("li").filter({ hasText: "Roast at high heat." });
    const motionDiv = recipeItem.locator(".touch-pan-y");
    const box = await motionDiv.boundingBox();
    if (!box) throw new Error("Could not find motion div bounding box");
    const startX = box.x + 20;
    const startY = box.y + box.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 1; i <= 20; i++) {
      await page.mouse.move(startX + i * 10, startY);
    }
    await page.mouse.up();

    await expect(recipeItem).not.toBeVisible({ timeout: 5000 });
  });

  test("user can undo deletion and recipe reappears", async ({ page }) => {
    await page.goto("/");

    // Add a recipe
    await page.getByRole("button", { name: /add recipe/i }).click();
    await page.getByLabel(/temperature/i).fill("325");
    await page.getByLabel(/time/i).fill("45");
    await page.getByLabel(/instructions/i).fill("Slow roast with herbs.");
    await page
      .getByRole("button", { name: /add recipe/i })
      .last()
      .click();
    await expect(page.getByText("Slow roast with herbs.")).toBeVisible();

    // Delete via swipe using real mouse drag
    const recipeItem = page.locator("li").filter({ hasText: "Slow roast with herbs." });
    const motionDiv = recipeItem.locator(".touch-pan-y");
    const box = await motionDiv.boundingBox();
    if (!box) throw new Error("Could not find motion div bounding box");
    const startX = box.x + 20;
    const startY = box.y + box.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 1; i <= 20; i++) {
      await page.mouse.move(startX + i * 10, startY);
    }
    await page.mouse.up();

    // Wait for the undo toast and click Undo
    await expect(page.getByRole("button", { name: /undo/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /undo/i }).click();

    // Recipe should reappear after router.refresh()
    await expect(page.getByText("Slow roast with herbs.")).toBeVisible({ timeout: 10000 });
  });

  test("user can trigger print/generate labels", async ({ page }) => {
    await page.goto("/");

    // Add a recipe to print
    await page.getByRole("button", { name: /add recipe/i }).click();
    await page.getByLabel(/temperature/i).fill("450");
    await page.getByLabel(/time/i).fill("10");
    await page.getByLabel(/instructions/i).fill("Broil on high.");
    await page
      .getByRole("button", { name: /add recipe/i })
      .last()
      .click();
    await expect(page.getByText("Broil on high.")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Switch to Print Labels tab
    await page.getByRole("button", { name: /print labels/i }).click();
    await expect(page.getByText("Broil on high.")).toBeVisible();

    // Increment copies for the recipe
    await page.getByRole("button", { name: "+" }).first().click();
    await expect(page.locator("span.font-mono").first()).toHaveText("1");

    // Click Generate Labels — it opens a new tab; intercept the popup
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: /generate labels/i }).click(),
    ]);

    // The popup should open (blob URL)
    expect(popup).toBeTruthy();
    await popup.close();
  });
});
