"use client";

import type { AllItem, GoalAnswers, SomaticAnswers } from "@/lib/types";
import { scoreColor, scoreLabel } from "@/lib/helpers";

interface Props {
  item: AllItem;
  tierColor?: string;
  onBadge?: (setId: string, stageId: string, type: "excited" | "impact") => void;
  onGoal?: (item: AllItem) => void;
  onSomatic?: (item: AllItem) => void;
  onUpdate?: (item: AllItem) => void;
  goalAnswers: GoalAnswers;
  somaticAnswers: SomaticAnswers;
}

export function TierItemCard({ item, tierColor, onBadge, onGoal, onSomatic, onUpdate, goalAnswers, somaticAnswers }: Props) {
  const hasGoal = Object.keys(goalAnswers).some((k) => k.startsWith(`${item.set.id}-${item.stage.id}`));
  const hasSomProc = Object.keys(somaticAnswers).some((k) => k.startsWith(item.key));

  return (
    <div className="ti">
      <div className="ti-top">
        <span className="ti-icon">{item.stage.icon}</span>
        <div className="ti-info">
          <span className="ti-stage">{item.stage.label}</span>
          <span className="ti-set">{item.set.label}</span>
        </div>
        <div className="ti-badges">
          {onBadge && (
            <>
              <span className={"tbadge" + (item.isExcited ? " on" : "")} title="Excited" onClick={() => onBadge(item.set.id, item.stage.id, "excited")}>❗</span>
              <span className={"tbadge" + (item.isImpact ? " on" : "")} title="Impactful" onClick={() => onBadge(item.set.id, item.stage.id, "impact")}>💥</span>
            </>
          )}
          {item.hasSomatic && <span className="tbadge on">🎭</span>}
          {item.somaticCleared && <span className="tbadge on" style={{ opacity: 1 }}>✅</span>}
        </div>
        <div className="ti-score" style={{ color: scoreColor(item.ans.score) }}>
          {item.ans.score}/10
          <span className="ti-sl">{scoreLabel(item.ans.score)}</span>
        </div>
      </div>
      {item.ans.why && <p className="ti-why-lbl">Why it&apos;s a {item.ans.score}:</p>}
      {item.ans.why && <p className="ti-why">&ldquo;{item.ans.why}&rdquo;</p>}
      {item.ans.makeTen && <p className="ti-why-lbl">What would make it a 10:</p>}
      {item.ans.makeTen && <p className="ti-why">&ldquo;{item.ans.makeTen}&rdquo;</p>}
      <div className="ti-actions">
        {item.hasSomatic && onSomatic && (
          <button className="btn-somatic" onClick={() => onSomatic(item)}>
            🎭 {hasSomProc ? "Continue clearing →" : "Clear the Block →"}
          </button>
        )}
        {onGoal && (
          <button className="btn-start" style={{ background: tierColor }} onClick={() => onGoal(item)}>
            {hasGoal ? "Continue goal →" : "Start here →"}
          </button>
        )}
        {onUpdate && (
          <button className="btn-ghost" onClick={() => onUpdate(item)}>Update</button>
        )}
      </div>
    </div>
  );
}
