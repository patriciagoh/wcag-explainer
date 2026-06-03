import type { SourceVersions } from "../types.ts";

type Props = { versions: SourceVersions };

export function DatasetFooter({ versions }: Props) {
  const builtDate = versions.builtAt.slice(0, 10);
  return (
    <footer className="bg-paper border-t border-line px-4 py-2 text-xs font-mono text-muted">
      Dataset built {builtDate} from WCAG {versions.wcagVersion} (commit{" "}
      <code>{versions.wcagJsonCommit}</code>) + axe-core {versions.axeCoreVersion}
    </footer>
  );
}
