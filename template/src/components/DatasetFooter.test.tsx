import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { DatasetFooter } from "./DatasetFooter.tsx";

const versions = {
  wcagVersion: "2.2" as const,
  wcagPublished: "2023-10-05",
  wcagJsonCommit: "a7f3e2c",
  axeCoreVersion: "4.10.2",
  builtAt: "2026-05-27T10:00:00Z",
};

describe("<DatasetFooter>", () => {
  it("shows WCAG version, axe version, and build date", () => {
    render(<DatasetFooter versions={versions} />);
    expect(screen.getByText(/WCAG 2\.2/)).toBeInTheDocument();
    expect(screen.getByText(/axe-core 4\.10\.2/)).toBeInTheDocument();
    expect(screen.getByText(/2026-05-27/)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DatasetFooter versions={versions} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
