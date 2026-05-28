import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { CriterionDetail } from "./CriterionDetail.tsx";
import type { Criterion } from "../types.ts";

const criterion: Criterion = {
  id: "1.4.3",
  title: "Contrast (Minimum)",
  level: "AA",
  version: "2.0",
  principle: { id: "1", name: "Perceivable" },
  guideline: { id: "1.4", name: "Distinguishable" },
  officialText: "The visual presentation of text has a contrast ratio of at least 4.5:1.",
  plainEnglish: "Text needs enough contrast against its background.",
  whyItMatters: "Low-contrast text excludes ~15% of users over 50.",
  quickCheck: "Open devtools → Accessibility → Contrast.",
  url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum",
  codeExamples: [
    { label: "Pass", kind: "pass", language: "jsx", code: "<p>ok</p>" },
    { label: "Fail", kind: "fail", language: "jsx", code: "<p>bad</p>" },
  ],
  axeRules: [
    {
      ruleId: "color-contrast",
      impact: "serious",
      description: "ratio check",
      url: "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
    },
  ],
  commonMistakes: ["Light gray on white"],
  relatedCriteria: ["1.4.6"],
};

describe("<CriterionDetail>", () => {
  it("renders title with id and level badge", () => {
    render(<CriterionDetail criterion={criterion} />);
    expect(screen.getByRole("heading", { name: /1\.4\.3.*Contrast/i })).toBeInTheDocument();
    expect(screen.getByText("AA")).toBeInTheDocument();
  });

  it("renders all field sections", () => {
    render(<CriterionDetail criterion={criterion} />);
    expect(screen.getByText(/Text needs enough contrast/)).toBeInTheDocument();
    expect(screen.getByText(/15% of users over 50/)).toBeInTheDocument();
    expect(screen.getByText(/Open devtools/)).toBeInTheDocument();
    expect(screen.getByText(/Light gray on white/)).toBeInTheDocument();
    expect(screen.getByText(/contrast ratio of at least 4\.5:1/)).toBeInTheDocument();
  });

  it("renders pass and fail code examples", () => {
    render(<CriterionDetail criterion={criterion} />);
    expect(screen.getByText("PASS")).toBeInTheDocument();
    expect(screen.getByText("FAIL")).toBeInTheDocument();
  });

  it("links out to the official W3C page", () => {
    render(<CriterionDetail criterion={criterion} />);
    const link = screen.getByRole("link", { name: /W3C/i });
    expect(link).toHaveAttribute("href", criterion.url);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<CriterionDetail criterion={criterion} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
