import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RecipeList } from "./recipe-list";

vi.mock("./ui/swipeable-row", () => ({
  SwipeableRow: ({
    children,
    onSwipeRight,
  }: {
    children: React.ReactNode;
    onSwipeRight?: () => void;
  }) => (
    <div>
      {children}
      <button onClick={onSwipeRight} aria-label="swipe-delete">
        Delete
      </button>
    </div>
  ),
}));

describe("RecipeList Component", () => {
  const mockRecipes = [
    {
      id: "1",
      temperature: 350,
      time: 15,
      instructions: "Bake for 15 minutes",
    },
    {
      id: "2",
      temperature: 425,
      time: 10,
      instructions: "Broil on high",
    },
  ];

  it("renders a list of recipes", () => {
    render(<RecipeList recipes={mockRecipes} onDelete={vi.fn()} />);
    expect(screen.getByText("350°F")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("Bake for 15 minutes")).toBeInTheDocument();
    expect(screen.getByText("425°F")).toBeInTheDocument();
    expect(screen.getByText("10 min")).toBeInTheDocument();
    expect(screen.getByText("Broil on high")).toBeInTheDocument();
  });

  it("renders empty state when no recipes exist", () => {
    render(<RecipeList recipes={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/No recipes found/i)).toBeInTheDocument();
  });

  it("calls onDelete with the recipe id when swipe delete is triggered", () => {
    const onDelete = vi.fn();
    render(<RecipeList recipes={mockRecipes} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole("button", { name: "swipe-delete" });
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("calls onEdit with the recipe when edit button is clicked", () => {
    const onEdit = vi.fn();
    render(<RecipeList recipes={mockRecipes} onDelete={vi.fn()} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole("button", { name: "Edit recipe" });
    fireEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockRecipes[0]);
  });
});
