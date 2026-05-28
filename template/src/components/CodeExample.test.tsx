import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodeExample } from "./CodeExample.tsx";
import { axe } from "vitest-axe";

const example = {
  label: "Pass: sufficient contrast",
  kind: "pass" as const,
  language: "jsx" as const,
  code: "<p style={{ color: '#222' }}>Hello</p>",
};

describe("<CodeExample>", () => {
  it("renders the label, badge, and code", () => {
    render(<CodeExample example={example} />);
    expect(screen.getByText(/sufficient contrast/i)).toBeInTheDocument();
    expect(screen.getAllByText(/pass/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<CodeExample example={example} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
