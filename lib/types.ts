export interface Answer {
  score?: number | null;
  why?: string;
  makeTen?: string;
  somatic?: boolean;
  blocked?: boolean;
  somatic_cleared?: boolean;
}

export type Answers = Record<string, Record<string, Answer>>;
export type Selections = Record<string, string | null>;
export type GoalAnswers = Record<string, string>;
export type SomaticAnswers = Record<string, string>;
export type SomaticDone = Record<string, boolean>;

export interface Stage {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface QuestionSet {
  id: string;
  label: string;
  poleLow: string;
  poleHigh: string;
  question: (stageId: string) => string;
  excitedPrompt: string;
  impactPrompt: string;
}

export interface TierMeta {
  label: string;
  desc: string;
  color: string;
}

export interface AllItem {
  set: QuestionSet;
  stage: Stage;
  ans: Answer;
  tier: number | null;
  isExcited: boolean;
  isImpact: boolean;
  hasSomatic: boolean;
  rawSomatic: boolean;
  somaticCleared: boolean;
  key: string;
}
