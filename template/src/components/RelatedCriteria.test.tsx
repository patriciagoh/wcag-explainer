import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { RelatedCriteria } from "./RelatedCriteria.tsx";

describe("<RelatedCriteria>", () => {
  it("renders links to related criteria with hash hrefs", () => {
    render(<RelatedCriteria ids={["1.4.6", "1.4.11"]} />);
    const link = screen.getByRole("link", { name: /1\.4\.6/ });
    expect(link).toHaveAttribute("href", "#1.4.6");
  });

  it("renders nothing when empty", () => {
    const { container } = render(<RelatedCriteria ids={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<RelatedCriteria ids={["1.4.6"]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
