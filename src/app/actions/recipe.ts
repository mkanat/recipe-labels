"use server";

import { db } from "@/db";
import { recipes, userRecipes, recipeHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

interface RecipeInput {
  temperature: number;
  time: number;
  instructions: string;
}

export async function createRecipe(data: RecipeInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    if (data.instructions.length > 200) {
      return { error: "Instructions must be 200 characters or less" };
    }

    const recipeId = crypto.randomUUID();
    const now = new Date();

    const snapshotData = {
      id: recipeId,
      temperature: data.temperature,
      time: data.time,
      instructions: data.instructions,
      isDeleted: false,
    };

    // Create recipe
    await db.insert(recipes).values({
      ...snapshotData,
      createdAt: now,
      updatedAt: now,
    });

    // Link recipe to user
    await db.insert(userRecipes).values({
      userId: session.user.id,
      recipeId,
    });

    // Create history snapshot
    await db.insert(recipeHistory).values({
      id: crypto.randomUUID(),
      recipeId,
      changeType: "CREATE",
      snapshot: snapshotData,
      createdAt: now,
    });

    return { success: true, recipeId };
  } catch {
    return { error: "Failed to create recipe" };
  }
}

export async function updateRecipe(recipeId: string, data: Partial<RecipeInput>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    if (data.instructions && data.instructions.length > 200) {
      return { error: "Instructions must be 200 characters or less" };
    }

    // Verify ownership and fetch current recipe to build a full snapshot
    const existing = await db
      .select({ recipe: recipes })
      .from(recipes)
      .innerJoin(userRecipes, eq(userRecipes.recipeId, recipes.id))
      .where(and(eq(recipes.id, recipeId), eq(userRecipes.userId, session.user.id)));

    if (existing.length === 0) {
      return { error: "Recipe not found" };
    }

    const current = existing[0].recipe;
    const now = new Date();

    const updatedFields = {
      ...(data.temperature !== undefined && { temperature: data.temperature }),
      ...(data.time !== undefined && { time: data.time }),
      ...(data.instructions !== undefined && { instructions: data.instructions }),
      updatedAt: now,
    };

    await db.update(recipes).set(updatedFields).where(eq(recipes.id, recipeId));

    // Build full snapshot from current state merged with update
    const snapshotData = {
      id: current.id,
      temperature: data.temperature ?? current.temperature,
      time: data.time ?? current.time,
      instructions: data.instructions ?? current.instructions,
      isDeleted: current.isDeleted,
    };

    await db.insert(recipeHistory).values({
      id: crypto.randomUUID(),
      recipeId,
      changeType: "UPDATE",
      snapshot: snapshotData,
      createdAt: now,
    });

    return { success: true };
  } catch {
    return { error: "Failed to update recipe" };
  }
}

export async function deleteRecipe(recipeId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    // Verify ownership and fetch current state before deleting so restore can bring it back
    const current = await db
      .select({ recipe: recipes })
      .from(recipes)
      .innerJoin(userRecipes, eq(userRecipes.recipeId, recipes.id))
      .where(and(eq(recipes.id, recipeId), eq(userRecipes.userId, session.user.id)));
    if (current.length === 0) {
      return { error: "Recipe not found" };
    }
    const pre = current[0].recipe;

    // Soft delete
    await db
      .update(recipes)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, recipeId));

    const historyId = crypto.randomUUID();
    await db.insert(recipeHistory).values({
      id: historyId,
      recipeId,
      changeType: "DELETE",
      snapshot: {
        id: pre.id,
        temperature: pre.temperature,
        time: pre.time,
        instructions: pre.instructions,
        isDeleted: false,
      },
      createdAt: new Date(),
    });

    return { success: true, historyId };
  } catch {
    return { error: "Failed to delete recipe" };
  }
}

export async function getRecipes() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const rows = await db
      .select()
      .from(recipes)
      .innerJoin(userRecipes, eq(userRecipes.recipeId, recipes.id))
      .where(and(eq(userRecipes.userId, session.user.id), eq(recipes.isDeleted, false)));

    const result = rows.map((row) => ({
      id: row.recipes.id,
      temperature: row.recipes.temperature,
      time: row.recipes.time,
      instructions: row.recipes.instructions,
    }));

    return { recipes: result };
  } catch {
    return { error: "Failed to fetch recipes" };
  }
}

export async function restoreRecipe(historyId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const records = await db
      .select({ history: recipeHistory })
      .from(recipeHistory)
      .innerJoin(userRecipes, eq(userRecipes.recipeId, recipeHistory.recipeId))
      .where(and(eq(recipeHistory.id, historyId), eq(userRecipes.userId, session.user.id)));

    if (records.length === 0) {
      return { error: "History record not found" };
    }

    const snapshot = records[0].history.snapshot as {
      id: string;
      temperature: number;
      time: number;
      instructions: string;
      isDeleted: boolean;
    };

    await db
      .update(recipes)
      .set({
        temperature: snapshot.temperature,
        time: snapshot.time,
        instructions: snapshot.instructions,
        isDeleted: snapshot.isDeleted,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, snapshot.id));

    return { success: true };
  } catch {
    return { error: "Failed to restore recipe" };
  }
}
