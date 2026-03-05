import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PrintUI } from "./print-ui";

describe("PrintUI Component", () => {
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
      instructions: "Broil",
    },
  ];

  it("renders recipes and allows incrementing copies", () => {
    const handlePrint = vi.fn();
    render(<PrintUI recipes={mockRecipes} onPrint={handlePrint} />);

    const printButton = screen.getByRole("button", { name: /Generate Labels/i });
    expect(printButton).toBeInTheDocument();

    const increaseButtons = screen.getAllByRole("button", { name: "+" });

    // Increase copies of the first recipe to 2
    fireEvent.click(increaseButtons[0]);
    fireEvent.click(increaseButtons[0]);

    fireEvent.click(printButton);

    // It should have called onPrint with 2 copies of the first recipe and 0 of the second
    expect(handlePrint).toHaveBeenCalledWith([mockRecipes[0], mockRecipes[0]]);
  });

  it("renders recipe details for each recipe", () => {
    render(<PrintUI recipes={mockRecipes} onPrint={vi.fn()} />);
    expect(screen.getByText("350°F")).toBeInTheDocument();
    expect(screen.getByText("15m")).toBeInTheDocument();
    expect(screen.getByText("Bake for 15 minutes")).toBeInTheDocument();
    expect(screen.getByText("425°F")).toBeInTheDocument();
    expect(screen.getByText("10m")).toBeInTheDocument();
    expect(screen.getByText("Broil")).toBeInTheDocument();
  });

  it("Generate Labels button is disabled when no copies are selected", () => {
    render(<PrintUI recipes={mockRecipes} onPrint={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Generate Labels/i })).toBeDisabled();
  });

  it("Generate Labels button is enabled after incrementing copies", () => {
    render(<PrintUI recipes={mockRecipes} onPrint={vi.fn()} />);
    const increaseButtons = screen.getAllByRole("button", { name: "+" });
    fireEvent.click(increaseButtons[0]);
    expect(screen.getByRole("button", { name: /Generate Labels \(1\)/i })).not.toBeDisabled();
  });

  it("decrementing copies does not go below zero", () => {
    render(<PrintUI recipes={mockRecipes} onPrint={vi.fn()} />);
    const decreaseButtons = screen.getAllByRole("button", { name: "-" });
    fireEvent.click(decreaseButtons[0]);
    // copies should stay at 0, button still disabled
    expect(screen.getByRole("button", { name: /Generate Labels \(0\)/i })).toBeDisabled();
  });

  it("renders empty state when no recipes are provided", () => {
    render(<PrintUI recipes={[]} onPrint={vi.fn()} />);
    expect(screen.getByText(/No recipes available to print/i)).toBeInTheDocument();
  });
});
