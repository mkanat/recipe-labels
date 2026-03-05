import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, userRecipes, recipeHistory } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

// This endpoint is only available in test/development environments.
// It cleans up all recipes for a given userId so E2E tests can start fresh.
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const secret = process.env.TEST_CLEANUP_SECRET;
  if (!secret || req.headers.get("x-test-cleanup-secret") !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Find recipe IDs for this user
  const rows = await db
    .select({ recipeId: userRecipes.recipeId })
    .from(userRecipes)
    .where(eq(userRecipes.userId, userId));

  const recipeIds = rows.map((r) => r.recipeId);

  if (recipeIds.length > 0) {
    await db.delete(recipeHistory).where(inArray(recipeHistory.recipeId, recipeIds));
    await db.delete(userRecipes).where(inArray(userRecipes.recipeId, recipeIds));
    await db.delete(recipes).where(inArray(recipes.id, recipeIds));
  }

  return NextResponse.json({ deleted: recipeIds.length });
}
