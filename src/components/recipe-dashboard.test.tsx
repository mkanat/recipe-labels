/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecipeDashboard } from "./recipe-dashboard";
import type { Recipe } from "@/types/recipe";

// Mock server actions
vi.mock("@/app/actions/recipe", () => ({
  createRecipe: vi.fn().mockResolvedValue({ success: true, recipeId: "new-id" }),
  updateRecipe: vi.fn().mockResolvedValue({ success: true }),
  deleteRecipe: vi.fn().mockResolvedValue({ success: true, historyId: "hist-1" }),
  restoreRecipe: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock SwipeableRow so onSwipeRight can be triggered directly in tests
vi.mock("./ui/swipeable-row", () => ({
  SwipeableRow: ({ children, onSwipeRight }: any) => (
    <div>
      {children}
      <button aria-label="swipe-delete" onClick={onSwipeRight} />
    </div>
  ),
}));

// Mock react-pdf
vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: any) => <div>{children}</div>,
  Page: ({ children }: any) => <div>{children}</div>,
  View: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  StyleSheet: { create: (s: any) => s },
  Font: { register: vi.fn() },
  pdf: vi.fn().mockResolvedValue({
    toBlob: vi.fn().mockResolvedValue(new Blob()),
  }),
}));

const mockRecipes: Recipe[] = [
  { id: "r1", temperature: 350, time: 15, instructions: "Bake evenly." },
  { id: "r2", temperature: 425, time: 25, instructions: "Roast at high heat." },
];

describe("RecipeDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the recipe list tab by default", () => {
    render(<RecipeDashboard initialRecipes={mockRecipes} userEmail="test@example.com" />);
    expect(screen.getByText("Bake evenly.")).toBeInTheDocument();
    expect(screen.getByText("Roast at high heat.")).toBeInTheDocument();
  });

  it("shows the Add Recipe form when the add button is clicked", async () => {
    render(<RecipeDashboard initialRecipes={mockRecipes} userEmail="test@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: /add recipe/i }));
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
  });

  it("hides the form and switches to list tab when cancel is clicked", async () => {
    render(<RecipeDashboard initialRecipes={mockRecipes} userEmail="test@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: /add recipe/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByLabelText(/temperature/i)).not.toBeInTheDocument();
  });

  it("calls createRecipe on form submit when not editing", async () => {
    const { createRecipe } = await import("@/app/actions/recipe");
    render(<RecipeDashboard initialRecipes={[]} userEmail="test@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: /add recipe/i }));

    fireEvent.change(screen.getByLabelText(/temperature/i), { target: { value: "350" } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText(/instructions/i), { target: { value: "Test instructions." } });
    fireEvent.click(screen.getByRole("button", { name: /add recipe/i, hidden: true }));

    await waitFor(() => {
      expect(createRecipe).toHaveBeenCalledWith({
        temperature: 350,
        time: 15,
        instructions: "Test instructions.",
      });
    });
  });

  it("calls updateRecipe on form submit when editing a recipe", async () => {
    const { updateRecipe } = await import("@/app/actions/recipe");
    render(<RecipeDashboard initialRecipes={mockRecipes} userEmail="test@example.com" />);

    // Click the edit button for the first recipe
    const editButtons = screen.getAllByRole("button", { name: /edit recipe/i });
    fireEvent.click(editButtons[0]);

    // Form should be pre-filled with the first recipe's data
    expect(screen.getByLabelText(/temperature/i)).toHaveValue(350);

    // Change temperature and submit
    fireEvent.change(screen.getByLabelText(/temperature/i), { target: { value: "400" } });
    fireEvent.click(screen.getByRole("button", { name: /update recipe/i }));

    await waitFor(() => {
      expect(updateRecipe).toHaveBeenCalledWith("r1", {
        temperature: 400,
        time: 15,
        instructions: "Bake evenly.",
      });
    });
  });

  it("calls deleteRecipe when swipe-delete is triggered", async () => {
    const { deleteRecipe } = await import("@/app/actions/recipe");
    render(<RecipeDashboard initialRecipes={mockRecipes} userEmail="test@example.com" />);

    const deleteButtons = screen.getAllByRole("button", { name: /swipe-delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteRecipe).toHaveBeenCalledWith("r1");
    });
  });

  it("switches to the print tab when Print Labels tab is clicked", () => {
    render(<RecipeDashboard initialRecipes={mockRecipes} userEmail="test@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: /print labels/i }));
    // PrintUI renders recipe list for copy selection
    expect(screen.getAllByText(/350°F|425°F/).length).toBeGreaterThan(0);
  });

  it("switches back to list tab when Recipes tab is clicked", () => {
    render(<RecipeDashboard initialRecipes={mockRecipes} userEmail="test@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: /print labels/i }));
    fireEvent.click(screen.getByRole("button", { name: /^recipes$/i }));
    expect(screen.getByText("Bake evenly.")).toBeInTheDocument();
  });

  it("displays user email in the header", () => {
    render(<RecipeDashboard initialRecipes={mockRecipes} userEmail="chef@example.com" />);
    expect(screen.getByText("chef@example.com")).toBeInTheDocument();
  });
});
