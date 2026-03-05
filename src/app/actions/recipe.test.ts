import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRecipe, updateRecipe, deleteRecipe, restoreRecipe, getRecipes } from "./recipe";
import { db } from "@/db";
import { auth } from "@/lib/auth";

const mockHistoryRecord = {
  id: "history-123",
  recipeId: "recipe-abc",
  changeType: "UPDATE" as const,
  snapshot: {
    id: "recipe-abc",
    temperature: 375,
    time: 20,
    instructions: "Bake well.",
    isDeleted: false,
  },
  createdAt: new Date(),
};

// Mock dependencies
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
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
    vi.mocked(db.select).mockReturnThis();
    vi.mocked(db.from).mockReturnThis();
    vi.mocked(db.where).mockResolvedValueOnce([
      {
        id: "recipe-123",
        temperature: 350,
        time: 15,
        instructions: "Test instructions.",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await updateRecipe("recipe-123", { temperature: 400 });

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled(); // Should insert into recipeHistory
  });

  it("restores a recipe from a snapshot", async () => {
    vi.mocked(db.select).mockReturnThis();
    vi.mocked(db.from).mockReturnThis();
    vi.mocked(db.where).mockResolvedValueOnce([mockHistoryRecord]);

    const result = await restoreRecipe("history-123");

    expect(result.success).toBe(true);
    expect(db.select).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });

  it("restores the correct recipe using snapshot fields", async () => {
    vi.mocked(db.select).mockReturnThis();
    vi.mocked(db.from).mockReturnThis();
    vi.mocked(db.where).mockResolvedValueOnce([mockHistoryRecord]);

    await restoreRecipe("history-123");

    expect(db.set).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: mockHistoryRecord.snapshot.temperature,
        time: mockHistoryRecord.snapshot.time,
        instructions: mockHistoryRecord.snapshot.instructions,
        isDeleted: mockHistoryRecord.snapshot.isDeleted,
      })
    );
  });

  it("returns error when history record not found", async () => {
    vi.mocked(db.select).mockReturnThis();
    vi.mocked(db.from).mockReturnThis();
    vi.mocked(db.where).mockResolvedValueOnce([]);

    const result = await restoreRecipe("nonexistent-history");

    expect(result.error).toBe("History record not found");
  });

  it("soft-deletes a recipe and creates a DELETE history record", async () => {
    const result = await deleteRecipe("recipe-abc");

    expect(result.success).toBe(true);
    expect(db.update).toHaveBeenCalled();
    expect(db.set).toHaveBeenCalledWith(expect.objectContaining({ isDeleted: true }));
    expect(db.insert).toHaveBeenCalled();
    // The insert call should have included changeType: "DELETE"
    expect(vi.mocked(db.values)).toHaveBeenCalledWith(
      expect.objectContaining({ changeType: "DELETE" })
    );
  });

  it("returns Unauthorized for createRecipe when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const result = await createRecipe({
      temperature: 350,
      time: 15,
      instructions: "Test instructions",
    });

    expect(result.error).toBe("Unauthorized");
  });

  it("returns Unauthorized for updateRecipe when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const result = await updateRecipe("recipe-abc", { temperature: 400 });

    expect(result.error).toBe("Unauthorized");
  });

  it("returns Unauthorized for deleteRecipe when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const result = await deleteRecipe("recipe-abc");

    expect(result.error).toBe("Unauthorized");
  });

  it("returns Unauthorized for restoreRecipe when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const result = await restoreRecipe("history-123");

    expect(result.error).toBe("Unauthorized");
  });

  describe("getRecipes", () => {
    it("returns empty array for user with no recipes", async () => {
      vi.mocked(db.select).mockReturnThis();
      vi.mocked(db.from).mockReturnThis();
      vi.mocked(db.innerJoin).mockReturnThis();
      vi.mocked(db.where).mockResolvedValueOnce([]);

      const result = await getRecipes();

      expect(result).toEqual({ recipes: [] });
    });

    it("returns recipes for authenticated user", async () => {
      const rows = [
        {
          recipes: {
            id: "recipe-1",
            temperature: 350,
            time: 15,
            instructions: "Bake.",
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];
      vi.mocked(db.select).mockReturnThis();
      vi.mocked(db.from).mockReturnThis();
      vi.mocked(db.innerJoin).mockReturnThis();
      vi.mocked(db.where).mockResolvedValueOnce(rows);

      const result = await getRecipes();

      expect(result).toEqual({
        recipes: [
          {
            id: "recipe-1",
            temperature: 350,
            time: 15,
            instructions: "Bake.",
          },
        ],
      });
    });

    it("returns error for unauthenticated user", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

      const result = await getRecipes();

      expect(result).toEqual({ error: "Unauthorized" });
    });
  });

  describe("updateRecipe full snapshot (A3)", () => {
    it("fetches current recipe and stores full snapshot in history", async () => {
      const existingRecipe = {
        id: "recipe-123",
        temperature: 350,
        time: 15,
        instructions: "Original instructions.",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(db.select).mockReturnThis();
      vi.mocked(db.from).mockReturnThis();
      vi.mocked(db.where).mockResolvedValueOnce([existingRecipe]);

      await updateRecipe("recipe-123", { temperature: 400 });

      const valuesCallArgs = vi.mocked(db.values).mock.calls.map((c) => c[0]);
      const historyInsert = valuesCallArgs.find(
        (arg) =>
          arg &&
          typeof arg === "object" &&
          "snapshot" in (arg as object) &&
          typeof (arg as Record<string, unknown>).snapshot === "object" &&
          "instructions" in ((arg as Record<string, unknown>).snapshot as object)
      ) as Record<string, unknown> | undefined;

      expect(historyInsert).toBeDefined();
      const snapshot = historyInsert!.snapshot as Record<string, unknown>;
      expect(snapshot.temperature).toBe(400);
      expect(snapshot.instructions).toBe("Original instructions.");
    });

    it("returns error when recipe not found during update", async () => {
      vi.mocked(db.select).mockReturnThis();
      vi.mocked(db.from).mockReturnThis();
      vi.mocked(db.where).mockResolvedValueOnce([]);

      const result = await updateRecipe("nonexistent", { temperature: 400 });

      expect(result).toEqual({ error: "Recipe not found" });
    });
  });
});
