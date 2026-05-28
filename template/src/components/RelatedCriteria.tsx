type Props = { ids: string[] };

export function RelatedCriteria({ ids }: Props) {
  if (ids.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2 list-none p-0">
      {ids.map((id) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className="inline-block px-2 py-1 rounded text-sm border border-blue-300 text-blue-900 bg-blue-50 hover:bg-blue-100"
          >
            {id}
          </a>
        </li>
      ))}
    </ul>
  );
}
