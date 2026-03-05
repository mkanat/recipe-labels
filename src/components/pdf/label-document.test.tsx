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
    <div
      data-testid="pdf-view"
      style={style}
      data-style={JSON.stringify(style)}
    >
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

function makeItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    temperature: 350 + i,
    time: 10 + i,
    instructions: `Instructions for item ${i}`,
  }));
}

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

  it("renders the correct number of labels for a given item list", () => {
    render(<LabelDocument items={makeItems(6)} />);

    // Each label has an instructions text unique to it
    for (let i = 0; i < 6; i++) {
      expect(screen.getByText(`Instructions for item ${i}`)).toBeInTheDocument();
    }
  });

  it("splits labels across multiple pages when count exceeds 10", () => {
    render(<LabelDocument items={makeItems(15)} />);

    const pages = screen.getAllByTestId("pdf-page");
    expect(pages).toHaveLength(2);
    // First page has 10 items, second has 5
    expect(screen.getByText("Instructions for item 0")).toBeInTheDocument();
    expect(screen.getByText("Instructions for item 14")).toBeInTheDocument();
  });

  it("displays correct temperature, time, and instructions on each label", () => {
    const items = [
      { id: "r1", temperature: 425, time: 30, instructions: "Roast at high heat." },
      { id: "r2", temperature: 300, time: 45, instructions: "Slow and low." },
    ];
    render(<LabelDocument items={items} />);

    expect(screen.getByText(/425°F/)).toBeInTheDocument();
    expect(screen.getByText(/30 min/)).toBeInTheDocument();
    expect(screen.getByText("Roast at high heat.")).toBeInTheDocument();

    expect(screen.getByText(/300°F/)).toBeInTheDocument();
    expect(screen.getByText(/45 min/)).toBeInTheDocument();
    expect(screen.getByText("Slow and low.")).toBeInTheDocument();
  });

  it("renders without crashing when items list is empty", () => {
    render(<LabelDocument items={[]} />);

    expect(screen.getByTestId("pdf-document")).toBeInTheDocument();
    expect(screen.getAllByTestId("pdf-page")).toHaveLength(1);
  });

  it("applies marginRight: 0 to items in the right column (index % 2 === 1)", () => {
    const items = makeItems(4);
    const { container } = render(<LabelDocument items={items} />);

    // Label views are direct children of pdf-page
    const page = container.querySelector('[data-testid="pdf-page"]')!;
    const labelViews = Array.from(page.children) as HTMLElement[];

    // data-style contains JSON of the style prop passed to View
    const rightColumnStyles = JSON.parse(labelViews[1].getAttribute("data-style")!);
    // style is an array: [styles.label, { marginRight: 0 }]
    const rightOverride = Array.isArray(rightColumnStyles)
      ? rightColumnStyles.find((s: any) => "marginRight" in s && s.marginRight === 0)
      : null;
    expect(rightOverride).toBeDefined();

    const leftColumnStyles = JSON.parse(labelViews[0].getAttribute("data-style")!);
    const leftOverride = Array.isArray(leftColumnStyles)
      ? leftColumnStyles.find((s: any) => "marginRight" in s && s.marginRight === 0)
      : null;
    expect(leftOverride).toBeUndefined();
  });
});
