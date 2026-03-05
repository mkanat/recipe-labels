import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("shows 'Add Recipe' submit button in add mode", () => {
    render(<RecipeForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Add Recipe/i })).toBeInTheDocument();
  });

  it("shows 'Update Recipe' submit button in edit mode", () => {
    render(
      <RecipeForm
        initialData={{ temperature: 350, time: 15, instructions: "Bake" }}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /Update Recipe/i })).toBeInTheDocument();
  });

  it("pre-fills fields from initialData in edit mode", () => {
    render(
      <RecipeForm
        initialData={{ temperature: 375, time: 20, instructions: "Roast until golden" }}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/Temperature/i)).toHaveValue(375);
    expect(screen.getByLabelText(/Time/i)).toHaveValue(20);
    expect(screen.getByLabelText(/Instructions/i)).toHaveValue("Roast until golden");
  });

  it("calls onSubmit with correct parsed data when form is submitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<RecipeForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Temperature/i), { target: { value: "400" } });
    fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText(/Instructions/i), {
      target: { value: "Cook at high heat" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Recipe/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        temperature: 400,
        time: 25,
        instructions: "Cook at high heat",
      });
    });
  });

  it("does not call onSubmit when required fields are empty", () => {
    const onSubmit = vi.fn();
    render(<RecipeForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /Add Recipe/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
