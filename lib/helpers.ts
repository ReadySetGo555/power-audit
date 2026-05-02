import type { Answers, Selections, SomaticDone, AllItem } from "./types";
import { SETS, STAGES } from "./data";

export function scoreColor(s: number | null | undefined): string {
  if (!s) return "#4A4238";
  if (s <= 3) return "#C0392B";
  if (s <= 6) return "#E67E22";
  return "#2ECC71";
}

export function scoreLabel(s: number | null | undefined): string {
  if (!s) return "";
  if (s <= 3) return "🔥 Limited";
  if (s <= 6) return "⚠️ Improve";
  return "💪🏼 Strength";
}

export function scoreCat(s: number | null | undefined): string {
  if (!s) return "none";
  if (s <= 3) return "limited";
  if (s <= 6) return "improve";
  return "strength";
}

export function getTier(isExcited: boolean, isImpact: boolean, hasSomatic: boolean): number | null {
  const chosen = isExcited || isImpact;
  if (chosen && hasSomatic) return 1;
  if (isExcited && isImpact) return 2;
  if (chosen) return 3;
  if (hasSomatic) return 4;
  return null;
}

export function getAllItems(
  answers: Answers,
  excited: Selections,
  impactful: Selections,
  somaticDone: SomaticDone,
): AllItem[] {
  const items: AllItem[] = [];
  SETS.forEach((set) => {
    STAGES.forEach((stage) => {
      const ans = answers[set.id]?.[stage.id];
      if (!ans || ans.score == null) return;
      const isExcited = excited[set.id] === stage.id;
      const isImpact = impactful[set.id] === stage.id;
      const rawSomatic = !!(ans.somatic || ans.blocked);
      const doneKey = `${set.id}-${stage.id}`;
      const somaticCleared = !!somaticDone[doneKey];
      const hasSomatic = rawSomatic && !somaticCleared;
      const tier = getTier(isExcited, isImpact, hasSomatic);
      items.push({ set, stage, ans, tier, isExcited, isImpact, hasSomatic, rawSomatic, somaticCleared, key: doneKey });
    });
  });
  return items;
}
