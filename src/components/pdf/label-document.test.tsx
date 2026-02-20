/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LabelDocument } from "./label-document";

// Mock react-pdf since it doesn't run natively in jsdom without canvas tools
vi.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children, style }: any) => (
    <div data-testid="pdf-page" style={style}>
      {children}
    </div>
  ),
  View: ({ children, style }: any) => (
    <div data-testid="pdf-view" style={style}>
      {children}
    </div>
  ),
  Text: ({ children, style }: any) => (
    <span data-testid="pdf-text" style={style}>
      {children}
    </span>
  ),
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Font: {
    register: vi.fn(),
  },
}));

describe("LabelDocument Component", () => {
  it("renders the generic document wrapper", () => {
    const mockRecipes = [
      {
        id: "1",
        temperature: 400,
        time: 20,
        instructions: "Test instructions",
      },
    ];

    render(<LabelDocument items={mockRecipes} />);

    expect(screen.getByTestId("pdf-document")).toBeInTheDocument();
    // Verify it renders the text contents
    expect(screen.getByText(/400°F/)).toBeInTheDocument();
    expect(screen.getByText(/20 min/)).toBeInTheDocument();
    expect(screen.getByText("Test instructions")).toBeInTheDocument();
  });
});
