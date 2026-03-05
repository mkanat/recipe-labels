"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { RecipeList } from "./recipe-list";
import { RecipeForm } from "./recipe-form";
import { PrintUI } from "./print-ui";
import { LabelDocument } from "./pdf/label-document";
import { createRecipe, updateRecipe, deleteRecipe, restoreRecipe } from "@/app/actions/recipe";
import { useRecipeToast } from "@/hooks/use-recipe-toast";
import type { Recipe } from "@/types/recipe";

interface RecipeDashboardProps {
  initialRecipes: Recipe[];
  userEmail: string;
}

type Tab = "list" | "print";

export function RecipeDashboard({ initialRecipes, userEmail }: RecipeDashboardProps) {
  const router = useRouter();
  const { showUndoToast, showErrorToast, showSuccessToast } = useRecipeToast();

  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const handleDelete = async (recipeId: string) => {
    const result = await deleteRecipe(recipeId);
    if ("error" in result) {
      showErrorToast(result.error ?? "Failed to delete recipe");
      return;
    }
    const historyId = (result as { success: boolean; historyId?: string }).historyId;
    showUndoToast("Recipe deleted", async () => {
      if (historyId) {
        await restoreRecipe(historyId);
      }
      router.refresh();
    });
    router.refresh();
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowAddForm(true);
    setActiveTab("list");
  };

  const handleFormSubmit = async (data: {
    temperature: number;
    time: number;
    instructions: string;
  }) => {
    if (editingRecipe) {
      const result = await updateRecipe(editingRecipe.id, data);
      if ("error" in result) {
        showErrorToast(result.error ?? "Failed to update recipe");
        return;
      }
      showSuccessToast("Recipe updated");
    } else {
      const result = await createRecipe(data);
      if ("error" in result) {
        showErrorToast(result.error ?? "Failed to create recipe");
        return;
      }
      showSuccessToast("Recipe added");
    }
    setShowAddForm(false);
    setEditingRecipe(null);
    router.refresh();
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingRecipe(null);
  };

  const handlePrint = async (selectedItems: Recipe[]) => {
    const blob = await pdf(<LabelDocument items={selectedItems} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 font-sans text-zinc-50 md:p-12">
      <header className="mx-auto mb-12 flex max-w-3xl items-center justify-between">
        <h1 className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Recipe Labels
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-zinc-400">{userEmail}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8">
        {/* Tab bar */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 rounded-xl bg-zinc-900 p-1">
            <button
              onClick={() => {
                setActiveTab("list");
                setShowAddForm(false);
                setEditingRecipe(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "list"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Recipes
            </button>
            <button
              onClick={() => {
                setActiveTab("print");
                setShowAddForm(false);
                setEditingRecipe(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "print"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Print Labels
            </button>
          </div>

          {activeTab === "list" && !showAddForm && (
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingRecipe(null);
              }}
              className="flex items-center space-x-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Recipe</span>
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === "list" && (
          <div className="space-y-6">
            {showAddForm && (
              <div className="space-y-4">
                <RecipeForm initialData={editingRecipe ?? undefined} onSubmit={handleFormSubmit} />
                <button
                  onClick={handleCancelForm}
                  className="w-full rounded-xl border border-zinc-700 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>
            )}
            {!showAddForm && (
              <RecipeList recipes={initialRecipes} onDelete={handleDelete} onEdit={handleEdit} />
            )}
          </div>
        )}

        {activeTab === "print" && <PrintUI recipes={initialRecipes} onPrint={handlePrint} />}
      </main>
    </div>
  );
}
