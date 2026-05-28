export type CodeExample = {
  label: string;
  kind: "pass" | "fail";
  language: "jsx" | "tsx" | "html" | "css";
  code: string;
  note?: string;
  source?: string;
};

export type AxeRule = {
  ruleId: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  description: string;
  url: string;
};

export type Criterion = {
  id: string;
  title: string;
  level: "A" | "AA" | "AAA";
  version: "2.0" | "2.1" | "2.2";
  principle: { id: "1" | "2" | "3" | "4"; name: string };
  guideline: { id: string; name: string };
  officialText: string;
  plainEnglish: string;
  whyItMatters: string;
  quickCheck: string;
  url: string;
  codeExamples: CodeExample[];
  axeRules: AxeRule[];
  commonMistakes: string[];
  relatedCriteria: string[];
};

export type SourceVersions = {
  wcagVersion: "2.2";
  wcagPublished: string;
  wcagJsonCommit: string;
  axeCoreVersion: string;
  builtAt: string;
};

export type Dataset = {
  sourceVersions: SourceVersions;
  criteria: Criterion[];
};
