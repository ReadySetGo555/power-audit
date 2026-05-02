"use client";

import type { QuestionSet, Stage, Answer } from "@/lib/types";
import { scoreColor } from "@/lib/helpers";
import { COLOR } from "@/lib/data";

interface Props {
  set: QuestionSet;
  stage: Stage;
  answer: Answer;
  onChange: (field: string, value: unknown) => void;
}

export function QuestionCard({ set, stage, answer, onChange }: Props) {
  const q = set.question(stage.id);
  const hasScore = answer.score != null;
  const hasWhy = (answer.why ?? "").trim().length > 4;
  const isTen = answer.score === 10;

  return (
    <div className="qcard">
      <div className="qcard-top">
        <span className="qcard-icon">{stage.icon}</span>
        <span className="qcard-stage">{stage.label}</span>
        <span className="qcard-desc">— {stage.description}</span>
      </div>
      <p className="qcard-q">{q}</p>
      <div className="slider-row">
        <span className="pole">{set.poleLow}<br /><b>1</b></span>
        <input
          type="range" min={1} max={10} step={1}
          value={answer.score ?? 5}
          onChange={(e) => onChange("score", Number(e.target.value))}
          style={{ "--ac": COLOR } as React.CSSProperties}
        />
        <span className="pole">{set.poleHigh}<br /><b>10</b></span>
      </div>
      <div className="slider-num" style={{ color: scoreColor(answer.score) }}>
        {answer.score ?? <span style={{ opacity: 0.25, fontSize: "1rem" }}>move the slider</span>}
      </div>

      {hasScore && (
        <div className="reveal">
          <label className="rlabel">Why is it a {answer.score}?</label>
          <textarea
            className="rarea"
            placeholder="Describe what's happening here..."
            value={answer.why ?? ""}
            onChange={(e) => onChange("why", e.target.value)}
            rows={3}
          />
          <div className="checks">
            <label className="check">
              <input type="checkbox" checked={!!answer.somatic} onChange={(e) => onChange("somatic", e.target.checked)} />
              <span>🎭 This doesn&apos;t feel good somatically</span>
            </label>
            <label className="check">
              <input type="checkbox" checked={!!answer.blocked} onChange={(e) => onChange("blocked", e.target.checked)} />
              <span>🎭 I feel stuck / blocked</span>
            </label>
          </div>
        </div>
      )}

      {hasScore && hasWhy && isTen && (
        <div className="reveal">
          <div className="strength-msg">💪🏼 Great Job! We&apos;ll place this in your Strengths.</div>
        </div>
      )}

      {hasScore && hasWhy && !isTen && (
        <div className="reveal">
          <label className="rlabel">What would make it a 10? <span className="rhint">(Observe the Opposite)</span></label>
          <textarea
            className="rarea"
            placeholder="If this were a 10, I would..."
            value={answer.makeTen ?? ""}
            onChange={(e) => onChange("makeTen", e.target.value)}
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
