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
});
