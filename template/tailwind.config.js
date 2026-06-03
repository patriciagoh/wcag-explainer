import typography from "@tailwindcss/typography";
import matchaOat from "matcha-oat-design-system/tailwind-preset";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [matchaOat],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Map the typography plugin (`prose`) onto Matcha tokens so long-form
      // copy matches the palette instead of Tailwind's default gray.
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--ink-2)",
            "--tw-prose-headings": "var(--ink)",
            "--tw-prose-links": "var(--matcha-deep)",
            "--tw-prose-bold": "var(--ink)",
            "--tw-prose-counters": "var(--muted)",
            "--tw-prose-bullets": "var(--line-2)",
            "--tw-prose-hr": "var(--line-2)",
            "--tw-prose-quotes": "var(--ink-2)",
            "--tw-prose-quote-borders": "var(--matcha)",
            "--tw-prose-code": "var(--ink)",
            "--tw-prose-pre-bg": "var(--term-bg)",
            "--tw-prose-pre-code": "var(--term-text)",
            fontFamily: "var(--sans)",
          },
        },
      },
    },
  },
  plugins: [typography],
};
