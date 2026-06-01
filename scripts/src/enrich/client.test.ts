import { describe, it, expect } from "vitest";
import { createAnthropicClient, type EnrichmentClient } from "./client.ts";

describe("createAnthropicClient", () => {
  it("returns an object satisfying the EnrichmentClient interface", () => {
    const client = createAnthropicClient({ apiKey: "test-key" });
    // Compile-time check: the factory's return type must match the interface.
    const typed: EnrichmentClient = client;
    expect(typeof typed.complete).toBe("function");
  });
});
