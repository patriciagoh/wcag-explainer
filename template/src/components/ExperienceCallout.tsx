import { getExperience } from "../augment.ts";

type Props = { criterionId: string };

/** #4 "What the user experiences" — concrete fail vs pass from the user's side. */
export function ExperienceCallout({ criterionId }: Props) {
  const exp = getExperience(criterionId);
  if (!exp) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 not-prose">
      <div className="rounded-md p-3 bg-warn-bg">
        <h3 className="text-xs font-bold uppercase tracking-wider m-0 mb-1 text-warn">😣 When it's broken</h3>
        <p className="text-sm m-0 text-warn">{exp.fail}</p>
      </div>
      <div className="rounded-md p-3 bg-matcha-tint">
        <h3 className="text-xs font-bold uppercase tracking-wider m-0 mb-1 text-ink">🙂 When it's done right</h3>
        <p className="text-sm m-0 text-ink-2">{exp.pass}</p>
      </div>
    </div>
  );
}
