"use client";

import { useState } from "react";
import type { AllItem } from "@/lib/types";
import { SOMATIC_PROMPTS } from "@/lib/data";
import { useApp } from "@/context/AppContext";

interface Props {
  item: AllItem;
  onComplete: () => void;
  onBack: () => void;
}

export function SomaticScreen({ item, onComplete, onBack }: Props) {
  const { somaticAnswers, setSomaticAnswer } = useApp();
  const firstUnfilled = SOMATIC_PROMPTS.findIndex(
    (p) => (somaticAnswers[`${item.key}-${p.id}`] ?? "").trim().length === 0
  );
  const [step, setStep] = useState(firstUnfilled >= 0 ? firstUnfilled : SOMATIC_PROMPTS.length - 1);
  const prompt = SOMATIC_PROMPTS[step];
  const key = `${item.key}-${prompt.id}`;
  const value = somaticAnswers[key] ?? "";
  const canNext = value.trim().length > 4;
  const isLast = step === SOMATIC_PROMPTS.length - 1;

  return (
    <div className="goal-screen">
      <div className="goal-ctx" style={{ borderColor: "#C0392B55" }}>
        <span style={{ fontSize: "1.5rem" }}>🎭</span>
        <div style={{ flex: 1 }}>
          <span className="goal-ctx-stage">Clear the Block</span>
          <span className="goal-ctx-set">{item.stage.label} — {item.set.label}</span>
        </div>
      </div>
      {item.ans.why && <p className="goal-ctx-why">&ldquo;{item.ans.why}&rdquo;</p>}
      <div className="goal-prog" style={{ background: "#C0392B22" }}>
        <div className="goal-prog-fill" style={{ width: `${(step / SOMATIC_PROMPTS.length) * 100}%`, background: "#C0392B" }} />
      </div>
      <div className="goal-step-lbl" style={{ color: "#C0392B" }}>{prompt.label}</div>
      <p className="goal-q">{prompt.question}</p>
      <textarea
        className="rarea"
        placeholder={prompt.placeholder}
        value={value}
        onChange={(e) => setSomaticAnswer(key, e.target.value)}
        rows={4}
      />
      <div className="nav-row">
        <button className="btn-ghost" onClick={() => step > 0 ? setStep((s) => s - 1) : onBack()}>Back</button>
        <button className="btn-primary" style={{ background: "#C0392B" }} disabled={!canNext}
          onClick={() => isLast ? onComplete() : setStep((s) => s + 1)}>
          {isLast ? "Complete & Clear Block →" : "Next →"}
        </button>
      </div>
    </div>
  );
}
