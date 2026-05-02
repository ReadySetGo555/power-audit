"use client";

import { useState } from "react";
import type { AllItem } from "@/lib/types";
import { GOAL_PROMPTS, COLOR } from "@/lib/data";
import { scoreColor } from "@/lib/helpers";
import { useApp } from "@/context/AppContext";

interface Props {
  item: AllItem;
  onComplete: () => void;
  onBack: () => void;
}

export function GoalScreen({ item, onComplete, onBack }: Props) {
  const { goalAnswers, setGoalAnswer } = useApp();
  const firstUnfilled = GOAL_PROMPTS.findIndex(
    (p) => (goalAnswers[`${item.set.id}-${item.stage.id}-${p.id}`] ?? "").trim().length === 0
  );
  const [step, setStep] = useState(firstUnfilled >= 0 ? firstUnfilled : GOAL_PROMPTS.length - 1);
  const prompt = GOAL_PROMPTS[step];
  const key = `${item.set.id}-${item.stage.id}-${prompt.id}`;
  const value = goalAnswers[key] ?? "";
  const canNext = value.trim().length > 4;
  const isLast = step === GOAL_PROMPTS.length - 1;

  return (
    <div className="goal-screen">
      <div className="goal-ctx">
        <span style={{ fontSize: "1.25rem" }}>{item.stage.icon}</span>
        <div style={{ flex: 1 }}>
          <span className="goal-ctx-stage">{item.stage.label}</span>
          <span className="goal-ctx-set">{item.set.label}</span>
        </div>
        <span style={{ fontFamily: "var(--font-cormorant),serif", fontSize: "1.3rem", fontWeight: 600, color: scoreColor(item.ans.score) }}>{item.ans.score}/10</span>
      </div>
      {item.ans.why && <p className="goal-ctx-why">&ldquo;{item.ans.why}&rdquo;</p>}
      <div className="goal-prog">
        <div className="goal-prog-fill" style={{ width: `${(step / GOAL_PROMPTS.length) * 100}%` }} />
      </div>
      <div className="goal-step-lbl">{prompt.label}</div>
      <p className="goal-q">{prompt.question}</p>
      <textarea
        className="rarea"
        placeholder={prompt.placeholder}
        value={value}
        onChange={(e) => setGoalAnswer(key, e.target.value)}
        rows={4}
      />
      <div className="nav-row">
        <button className="btn-ghost" onClick={() => step > 0 ? setStep((s) => s - 1) : onBack()}>Back</button>
        <button className="btn-primary" disabled={!canNext} onClick={() => isLast ? onComplete() : setStep((s) => s + 1)}>
          {isLast ? "Save Goal →" : "Next →"}
        </button>
      </div>
    </div>
  );
}
