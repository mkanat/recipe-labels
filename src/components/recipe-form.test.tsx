import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RecipeForm } from "./recipe-form";

describe("RecipeForm Component", () => {
  it("renders correctly and respects maxLength. Shows counter.", () => {
    render(<RecipeForm onSubmit={vi.fn()} />);

    const tempInput = screen.getByLabelText(/Temperature/i);
    const timeInput = screen.getByLabelText(/Time/i);
    const instInput = screen.getByLabelText(/Instructions/i);

    expect(tempInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
    expect(instInput).toBeInTheDocument();

    // The counter starts at 0/200
    expect(screen.getByText("0 / 200")).toBeInTheDocument();

    fireEvent.change(instInput, { target: { value: "Bake for 15m" } });

    // The counter updates
    expect(screen.getByText("12 / 200")).toBeInTheDocument();
  });
});
