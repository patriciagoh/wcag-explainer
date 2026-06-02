import { allComponents, allRoles } from "../augment.ts";

type Props = {
  component: string | null;
  role: string | null;
  onComponent: (v: string | null) => void;
  onRole: (v: string | null) => void;
};

/** #6 Component- and role-based filtering. */
export function FacetFilter({ component, role, onComponent, onRole }: Props) {
  return (
    <div className="px-3 py-2 border-b grid grid-cols-2 gap-2">
      <label className="text-xs text-gray-700">
        <span className="block mb-1 font-medium">Component</span>
        <select
          value={component ?? ""}
          onChange={(e) => onComponent(e.target.value || null)}
          className="w-full border rounded px-2 py-1 text-sm bg-white"
        >
          <option value="">All</option>
          {allComponents.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-gray-700">
        <span className="block mb-1 font-medium">Your role</span>
        <select
          value={role ?? ""}
          onChange={(e) => onRole(e.target.value || null)}
          className="w-full border rounded px-2 py-1 text-sm bg-white"
        >
          <option value="">All</option>
          {allRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      {(component || role) && (
        <button
          type="button"
          onClick={() => {
            onComponent(null);
            onRole(null);
          }}
          className="col-span-2 text-xs text-blue-700 hover:underline text-left"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
