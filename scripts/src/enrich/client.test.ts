import { describe, it, expect } from "vitest";
import { createAnthropicClient } from "./client.ts";

describe("createAnthropicClient", () => {
  it("returns an object with a complete() method", () => {
    const client = createAnthropicClient({ apiKey: "test-key" });
    expect(typeof client.complete).toBe("function");
  });
});
