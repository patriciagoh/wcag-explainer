type Props = { ids: string[] };

export function RelatedCriteria({ ids }: Props) {
  if (ids.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2 list-none p-0">
      {ids.map((id) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className="inline-block px-2 py-1 rounded-pill text-sm font-mono border border-matcha-tint-border text-matcha-deep bg-matcha-tint hover:bg-oat"
          >
            {id}
          </a>
        </li>
      ))}
    </ul>
  );
}
