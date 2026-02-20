import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Input, Textarea } from "./input";

describe("Input & Textarea Components", () => {
  it("renders Input correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders Textarea correctly", () => {
    render(<Textarea placeholder="Enter long text" />);
    expect(screen.getByPlaceholderText("Enter long text")).toBeInTheDocument();
  });
});
