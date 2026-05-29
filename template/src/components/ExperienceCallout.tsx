import { getExperience } from "../augment.ts";

type Props = { criterionId: string };

/** #4 "What the user experiences" — concrete fail vs pass from the user's side. */
export function ExperienceCallout({ criterionId }: Props) {
  const exp = getExperience(criterionId);
  if (!exp) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 not-prose">
      <div className="border rounded p-3 bg-red-50 border-red-200">
        <h3 className="text-sm font-semibold m-0 mb-1 text-red-900">😣 When it's broken</h3>
        <p className="text-sm m-0 text-red-950">{exp.fail}</p>
      </div>
      <div className="border rounded p-3 bg-green-50 border-green-200">
        <h3 className="text-sm font-semibold m-0 mb-1 text-green-900">🙂 When it's done right</h3>
        <p className="text-sm m-0 text-green-950">{exp.pass}</p>
      </div>
    </div>
  );
}
