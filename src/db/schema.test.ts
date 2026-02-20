import { describe, it, expect } from "vitest";
import * as schema from "./schema";

describe("Database Schema", () => {
  it("should export all required tables", () => {
    // Auth tables
    expect(schema.user).toBeDefined();
    expect(schema.session).toBeDefined();

    // App tables
    expect(schema.recipes).toBeDefined();
    expect(schema.userRecipes).toBeDefined();
    expect(schema.recipeHistory).toBeDefined();
  });

  it("validates soft deletion default value on recipes", () => {
    // Drizzle schema builder object validation
    // `schema.recipes.isDeleted` is a column object.
    // We check its properties.
    expect(schema.recipes.isDeleted.default).toBe(false);
  });
});
