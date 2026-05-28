import type { SourceVersions } from "../types.ts";

type Props = { versions: SourceVersions };

export function DatasetFooter({ versions }: Props) {
  const builtDate = versions.builtAt.slice(0, 10);
  return (
    <footer className="border-t px-4 py-2 text-xs text-gray-600">
      Dataset built {builtDate} from WCAG {versions.wcagVersion} (commit{" "}
      <code>{versions.wcagJsonCommit}</code>) + axe-core {versions.axeCoreVersion}
    </footer>
  );
}
