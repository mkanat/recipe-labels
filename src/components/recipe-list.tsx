"use client";

import { SwipeableRow } from "./ui/swipeable-row";

export interface Recipe {
  id: string;
  temperature: number;
  time: number;
  instructions: string;
}

interface RecipeListProps {
  recipes: Recipe[];
  onDelete: (id: string) => void;
}

export function RecipeList({ recipes, onDelete }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-zinc-800 p-12 text-center">
        <div className="rounded-full bg-zinc-900 p-4">
          <svg
            className="h-8 w-8 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <p className="text-xl font-medium text-zinc-400">No recipes found.</p>
        <p className="text-zinc-600">Create one to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {recipes.map((recipe) => (
        <li key={recipe.id} className="relative z-0">
          <SwipeableRow onSwipeRight={() => onDelete(recipe.id)} swipeThreshold={120}>
            <div className="flex min-h-[5rem] flex-col justify-center space-y-2 rounded-2xl border border-zinc-800/60 bg-zinc-900/80 p-5 shadow-lg backdrop-blur-md transition-colors hover:bg-zinc-800/80">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-1.5 rounded-full bg-rose-500/10 px-3 py-1 font-mono text-sm font-semibold text-rose-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span>{recipe.temperature}°F</span>
                  </div>
                  <div className="flex items-center space-x-1.5 rounded-full bg-orange-500/10 px-3 py-1 font-mono text-sm font-semibold text-orange-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{recipe.time} min</span>
                  </div>
                </div>
              </div>
              <p className="line-clamp-2 text-base text-zinc-300">{recipe.instructions}</p>
            </div>
          </SwipeableRow>
        </li>
      ))}
    </ul>
  );
}
