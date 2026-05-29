import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { App } from "./App.tsx";

describe("<App>", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  it("renders the sidebar and search", () => {
    render(<App />);
    expect(screen.getByRole("navigation", { name: /WCAG criteria/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
  });

  it("shows the welcome front page with reference links when none selected", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Official docs & tools/i })).toBeInTheDocument();
    expect(screen.getByText(/Start here/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /WCAG 2.2 specification/i })).toHaveAttribute(
      "href",
      "https://www.w3.org/TR/WCAG22/",
    );
  });

  it("has no accessibility violations on empty state", async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
