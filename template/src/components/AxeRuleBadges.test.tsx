import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AxeRuleBadges } from "./AxeRuleBadges.tsx";

const rules = [
  {
    ruleId: "color-contrast",
    impact: "serious" as const,
    description: "Ensures contrast ratio meets WCAG AA",
    url: "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
  },
];

describe("<AxeRuleBadges>", () => {
  it("renders one badge per rule with an external link", () => {
    render(<AxeRuleBadges rules={rules} />);
    const link = screen.getByRole("link", { name: /color-contrast/i });
    expect(link).toHaveAttribute("href", rules[0].url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows a placeholder when no rules", () => {
    render(<AxeRuleBadges rules={[]} />);
    expect(screen.getByText(/no axe-core rules/i)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<AxeRuleBadges rules={rules} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
