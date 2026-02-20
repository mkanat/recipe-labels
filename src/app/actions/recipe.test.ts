import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRecipe, updateRecipe, restoreRecipe } from "./recipe";
import { db } from "@/db";

// Mock dependencies
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockReturnThis(),
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

// Mock auth session
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        session: { userId: "test-user-123" },
        user: { id: "test-user-123" },
      }),
    },
  },
}));

describe("Recipe Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects recipe creation if instructions exceed 200 characters", async () => {
    const longInstructions = "a".repeat(201);
    const result = await createRecipe({
      temperature: 350,
      time: 15,
      instructions: longInstructions,
    });

    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/Instructions must be 200 characters or less/i);
  });

  it("accepts valid recipe creation", async () => {
    const validInstructions = "Bake at 350 for 15 minutes.";
    const result = await createRecipe({
      temperature: 350,
      time: 15,
      instructions: validInstructions,
    });

    expect(result.success).toBe(true);
    // Should return the new recipe id
    expect(result.recipeId).toBeDefined();
  });

  it("creates a history snapshot upon updating a recipe", async () => {
    const result = await updateRecipe("recipe-123", { temperature: 400 });

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled(); // Should insert into recipeHistory
  });

  it("restores a recipe from a snapshot", async () => {
    const result = await restoreRecipe("history-123");

    expect(result.success).toBe(true);
    expect(db.update).toHaveBeenCalled(); // Should update the recipe
  });
});
