import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { SearchBar } from "./SearchBar.tsx";

describe("<SearchBar>", () => {
  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("searchbox"), "contrast");
    expect(onChange).toHaveBeenCalledTimes("contrast".length);
    expect(onChange).toHaveBeenLastCalledWith("t");
  });

  it("has a labeled search input", () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByLabelText(/search criteria/i)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SearchBar value="" onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
