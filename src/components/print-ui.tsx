"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export interface Recipe {
  id: string;
  temperature: number;
  time: number;
  instructions: string;
}

interface PrintUIProps {
  recipes: Recipe[];
  onPrint: (selectedItems: Recipe[]) => void | Promise<void>;
}

export function PrintUI({ recipes, onPrint }: PrintUIProps) {
  // Map of recipeId -> numberOfCopies
  // Initialized to 0
  const [copies, setCopies] = useState<Record<string, number>>(
    recipes.reduce((acc, r) => ({ ...acc, [r.id]: 0 }), {})
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const totalCopies = Object.values(copies).reduce((a, b) => a + b, 0);

  const updateCopies = (id: string, delta: number) => {
    setCopies((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const handlePrint = async () => {
    if (totalCopies === 0) return;

    setIsGenerating(true);
    try {
      const selectedItems: Recipe[] = [];
      recipes.forEach((recipe) => {
        const count = copies[recipe.id] || 0;
        for (let i = 0; i < count; i++) {
          selectedItems.push(recipe);
        }
      });
      await onPrint(selectedItems);
    } finally {
      setIsGenerating(false);
    }
  };

  if (recipes.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">No recipes available to print.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="flex-1 pr-4">
              <div className="mb-1 flex items-center space-x-2">
                <span className="text-sm font-medium text-rose-400">{recipe.temperature}°F</span>
                <span className="text-sm font-medium text-orange-400">{recipe.time}m</span>
              </div>
              <p className="line-clamp-1 text-sm text-zinc-300">{recipe.instructions}</p>
            </div>

            <div className="flex items-center space-x-3 rounded-xl border border-zinc-800/80 bg-zinc-950 px-2 py-1.5">
              <button
                onClick={() => updateCopies(recipe.id, -1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="-"
              >
                -
              </button>
              <span className="w-6 text-center font-mono font-medium text-white">
                {copies[recipe.id] || 0}
              </span>
              <button
                onClick={() => updateCopies(recipe.id, 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="+"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 z-20">
        <Button
          onClick={handlePrint}
          disabled={totalCopies === 0 || isGenerating}
          className="h-14 w-full text-lg"
        >
          {isGenerating ? "Generating..." : `Generate Labels (${totalCopies})`}
        </Button>
      </div>
    </div>
  );
}
