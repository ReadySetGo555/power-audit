"use client";

import type { QuestionSet, Answers } from "@/lib/types";
import { STAGES } from "@/lib/data";
import { scoreColor, scoreLabel } from "@/lib/helpers";

interface Props {
  set: QuestionSet;
  answers: Answers;
  isExcited: boolean;
  selected: string | null | undefined;
  onSelect: (stageId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function SelectScreen({ set, answers, isExcited, selected, onSelect, onBack, onNext }: Props) {
  const prompt = isExcited ? set.excitedPrompt : set.impactPrompt;
  return (
    <div className="select-screen">
      <div className="sel-eyebrow">{isExcited ? "❗" : "💥"} {set.label} — {isExcited ? "Most Excited to Improve" : "Most Impactful to Improve"}</div>
      <h3 className="sel-title">{prompt}</h3>
      <div className="sel-opts">
        {STAGES.map((stage) => {
          const ans = answers[set.id]?.[stage.id] ?? {};
          const chosen = selected === stage.id;
          return (
            <div key={stage.id} className={"sel-opt" + (chosen ? " chosen" : "")} onClick={() => onSelect(stage.id)}>
              <div className="so-top">
                <div className="so-left">
                  <span className="so-icon">{stage.icon}</span>
                  <div>
                    <div className="so-label">{stage.label}</div>
                    <div className="so-q">{set.question(stage.id)}</div>
                  </div>
                </div>
                <div className="so-right">
                  <span className="so-score" style={{ color: scoreColor(ans.score) }}>{ans.score ?? "—"}</span>
                  <span className="so-slabel" style={{ color: scoreColor(ans.score) }}>{scoreLabel(ans.score)}</span>
                </div>
              </div>
              {ans.why && <p className="so-answer-lbl">Why it&apos;s a {ans.score}:</p>}
              {ans.why && <p className="so-why">&ldquo;{ans.why}&rdquo;</p>}
              {ans.makeTen && <p className="so-answer-lbl">What would make it a 10:</p>}
              {ans.makeTen && <p className="so-why">&ldquo;{ans.makeTen}&rdquo;</p>}
              <div className={"so-radio" + (chosen ? " on" : "")} />
            </div>
          );
        })}
      </div>
      <div className="nav-row">
        <button className="btn-ghost" onClick={onBack}>Back</button>
        <button className="btn-primary" disabled={!selected} onClick={onNext}>
          {isExcited ? "Choose most impactful →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
