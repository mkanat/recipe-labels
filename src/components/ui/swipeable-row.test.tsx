import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SwipeableRow } from "./swipeable-row";

describe("SwipeableRow Component", () => {
  it("renders children correctly", () => {
    render(
      <SwipeableRow onSwipeLeft={() => {}} onSwipeRight={() => {}}>
        <div>Swipeable Content</div>
      </SwipeableRow>
    );
    expect(screen.getByText("Swipeable Content")).toBeInTheDocument();
  });
});
