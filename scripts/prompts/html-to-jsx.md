# HTML → JSX Conversion

Convert the following HTML code example into idiomatic React JSX. Rules:

- `class=` → `className=`
- `for=` → `htmlFor=`
- Inline styles become `style={{ ... }}` objects with camelCased keys
- Self-close void elements (`<img />`, `<input />`)
- Preserve semantic meaning; do not "improve" the example
- If the snippet is already a valid React component, leave it alone

## Input

```html
{{html}}
```

## Output format

Just the JSX code, no surrounding ```jsx fences, no commentary.
