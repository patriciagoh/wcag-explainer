import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Sidebar } from "./Sidebar.tsx";
import type { PrincipleGroup } from "../hooks/useCriteria.ts";

const baseCriterion = {
  officialText: "",
  plainEnglish: "",
  whyItMatters: "",
  quickCheck: "",
  url: "https://w3.org/",
  codeExamples: [],
  axeRules: [],
  commonMistakes: [],
  relatedCriteria: [],
  version: "2.0" as const,
};

const grouped: PrincipleGroup[] = [
  {
    id: "1",
    name: "Perceivable",
    guidelines: [
      {
        id: "1.4",
        name: "Distinguishable",
        criteria: [
          {
            ...baseCriterion,
            id: "1.4.3",
            title: "Contrast (Minimum)",
            level: "AA",
            principle: { id: "1", name: "Perceivable" },
            guideline: { id: "1.4", name: "Distinguishable" },
          },
          {
            ...baseCriterion,
            id: "1.4.6",
            title: "Contrast (Enhanced)",
            level: "AAA",
            principle: { id: "1", name: "Perceivable" },
            guideline: { id: "1.4", name: "Distinguishable" },
          },
        ],
      },
    ],
  },
];

describe("<Sidebar>", () => {
  it("hides AAA criteria by default", () => {
    render(<Sidebar grouped={grouped} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByText(/1\.4\.3/)).toBeInTheDocument();
    expect(screen.queryByText(/1\.4\.6/)).not.toBeInTheDocument();
  });

  it("shows AAA when toggle is on", async () => {
    render(<Sidebar grouped={grouped} selectedId={null} onSelect={() => {}} />);
    await userEvent.click(screen.getByRole("checkbox", { name: /show AAA/i }));
    expect(screen.getByText(/1\.4\.6/)).toBeInTheDocument();
  });

  it("calls onSelect when a criterion is clicked", async () => {
    const onSelect = vi.fn();
    render(<Sidebar grouped={grouped} selectedId={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText(/1\.4\.3/));
    expect(onSelect).toHaveBeenCalledWith("1.4.3");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Sidebar grouped={grouped} selectedId="1.4.3" onSelect={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
