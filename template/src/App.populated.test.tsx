import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { App } from "./App.tsx";

// The empty-state axe check lives in App.test.tsx. These exercise the
// populated / interactive views (criterion detail, search, quiz, lookup),
// which the original axe gate never rendered.
describe("<App> populated views — accessibility", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  it("criterion detail view has no violations", async () => {
    window.location.hash = "1.4.3";
    const { container } = render(<App />);
    // The deep-linked criterion renders its own heading.
    expect(await screen.findByRole("heading", { level: 1, name: /1\.4\.3/ })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("sidebar with a search query applied has no violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await user.type(screen.getByLabelText(/search criteria/i), "contrast");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("quiz view after revealing an answer has no violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const modes = screen.getByRole("navigation", { name: /modes/i });
    await user.click(within(modes).getByRole("button", { name: /^Quiz$/ }));
    await user.click(await screen.findByRole("button", { name: /Pass/ }));
    // The verdict (in a live region) is now shown.
    expect(await screen.findByText(/Correct!|Not quite\./)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("rule lookup with results has no violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const modes = screen.getByRole("navigation", { name: /modes/i });
    await user.click(within(modes).getByRole("button", { name: /Rule lookup/ }));
    await user.type(screen.getByLabelText(/rule id/i), "image-alt");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("my checklist view has no violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const modes = screen.getByRole("navigation", { name: /modes/i });
    await user.click(within(modes).getByRole("button", { name: /My checklist/ }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
