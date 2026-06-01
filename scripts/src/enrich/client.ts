import Anthropic from "@anthropic-ai/sdk";

/** Minimal seam the enrichment core depends on. Tests inject a mock. */
export interface EnrichmentClient {
  complete(prompt: string): Promise<string>;
}

const SYSTEM_PROMPT =
  "You are an expert web accessibility engineer turning WCAG success criteria into clear, " +
  "accurate, developer-facing content. Follow each task's stated output format exactly — " +
  "no preamble, no markdown fences unless asked.";

export function createAnthropicClient(opts: { apiKey: string; model?: string }): EnrichmentClient {
  const anthropic = new Anthropic({ apiKey: opts.apiKey });
  const model = opts.model ?? "claude-opus-4-8";
  return {
    async complete(prompt: string): Promise<string> {
      const res = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        // Cache the static system block to cut cost across many criteria.
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: prompt }],
      });
      const text = res.content.find((b) => b.type === "text");
      if (!text || text.type !== "text") throw new Error("No text block in model response");
      return text.text.trim();
    },
  };
}
