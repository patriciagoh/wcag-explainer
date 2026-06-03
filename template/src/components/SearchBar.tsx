type Props = { value: string; onChange: (v: string) => void };

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="px-3 py-2 border-b border-line">
      <label htmlFor="wcag-search" className="sr-only">
        Search criteria
      </label>
      <input
        id="wcag-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by id, title, or keyword (e.g. 1.4.3, alt text)"
        className="w-full px-3 py-2 border border-muted rounded-md text-sm bg-paper text-ink placeholder:text-muted"
      />
    </div>
  );
}
