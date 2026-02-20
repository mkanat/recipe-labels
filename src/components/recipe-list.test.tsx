import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RecipeList } from "./recipe-list";

describe("RecipeList Component", () => {
  const mockRecipes = [
    {
      id: "1",
      temperature: 350,
      time: 15,
      instructions: "Bake for 15 minutes",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("renders a list of recipes", () => {
    render(<RecipeList recipes={mockRecipes} onDelete={vi.fn()} />);
    expect(screen.getByText("350°F")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("Bake for 15 minutes")).toBeInTheDocument();
  });

  it("renders empty state when no recipes exist", () => {
    render(<RecipeList recipes={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/No recipes found/i)).toBeInTheDocument();
  });
});
