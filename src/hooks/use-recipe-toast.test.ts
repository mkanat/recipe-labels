import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRecipeToast } from "./use-recipe-toast";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

describe("useRecipeToast Hook", () => {
  it("calls toast with undo action when showUndoToast is called", () => {
    const { result } = renderHook(() => useRecipeToast());

    act(() => {
      result.current.showUndoToast("Recipe deleted", async () => {});
    });

    expect(toast).toHaveBeenCalledWith(
      "Recipe deleted",
      expect.objectContaining({
        action: expect.objectContaining({
          label: "Undo",
        }),
      })
    );
  });
});
