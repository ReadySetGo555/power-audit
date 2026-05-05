"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AllItem } from "@/lib/types";
import { BLOCK_PROMPTS } from "@/lib/data";
import { useApp } from "@/context/AppContext";

interface Props {
  item: AllItem;
  onBack: () => void;
}

const TOTAL = BLOCK_PROMPTS.length; // 9

export function BlocksScreen({ item, onBack }: Props) {
  const router = useRouter();
  const { blockAnswers, setBlockAnswer, completeBlock, scheduleBlockAction } = useApp();

  const firstUnfilled = BLOCK_PROMPTS.findIndex(
    (p) => (blockAnswers[`${item.key}-${p.id}`] ?? "").trim().length === 0
  );
  const [step, setStep] = useState(firstUnfilled >= 0 ? firstUnfilled : TOTAL - 1);

  const prompt = BLOCK_PROMPTS[step];
  const key = `${item.key}-${prompt.id}`;
  const value = blockAnswers[key] ?? "";
  const canNext = value.trim().length > 4;
  const isLast = step === TOTAL - 1;
  const isSnapshot = prompt.id === "snapshot"; // step 4 (index 4)
  const isFeelings = prompt.id === "feelings"; // step 2 — somatic branch

  // Snapshot step: show reflection of steps 1-4 then the snapshot input
  const snapshotRef = ["actions", "behaviors", "feelings", "thoughts"];
  const snapshotPrior = snapshotRef.map((id) => ({
    prompt: BLOCK_PROMPTS.find((p) => p.id === id)!,
    answer: blockAnswers[`${item.key}-${id}`] ?? "",
  })).filter((r) => r.answer);

  function handleComplete() {
    completeBlock(item.set.id, item.stage.id);
    router.push("/dashboard");
  }

  function handleSchedule() {
    scheduleBlockAction(item.set.id, item.stage.id);
    router.push("/dashboard");
  }

  function handleSomaticBranch() {
    router.push(`/somatic/${item.set.id}/${item.stage.id}?from=blocks`);
  }

  return (
    <div className="goal-screen">
      <div className="goal-ctx" style={{ borderColor: "#C0392B55" }}>
        <span style={{ fontSize: "1.5rem" }}>❌</span>
        <div style={{ flex: 1 }}>
          <span className="goal-ctx-stage">Clear the Block</span>
          <span className="goal-ctx-set">{item.stage.label} — {item.set.label}</span>
        </div>
      </div>
      {item.ans.why && <p className="goal-ctx-why">&ldquo;{item.ans.why}&rdquo;</p>}

      <div className="goal-prog" style={{ background: "#C0392B22" }}>
        <div className="goal-prog-fill" style={{ width: `${(step / TOTAL) * 100}%`, background: "#C0392B" }} />
      </div>
      <div className="goal-step-lbl" style={{ color: "#C0392B" }}>
        Step {step + 1} of {TOTAL} — {prompt.label}
      </div>

      {isSnapshot && snapshotPrior.length > 0 && (
        <div className="blk-snapshot-review">
          {snapshotPrior.map(({ prompt: p, answer }) => (
            <div key={p.id} className="blk-snapshot-row">
              <span className="blk-snapshot-lbl">{p.label}:</span>
              <span className="blk-snapshot-ans">&ldquo;{answer}&rdquo;</span>
            </div>
          ))}
          <div className="blk-snapshot-divider" />
        </div>
      )}

      <p className="goal-q">{prompt.question}</p>

      {!isLast ? (
        <>
          <textarea
            className="rarea"
            placeholder={prompt.placeholder}
            value={value}
            onChange={(e) => setBlockAnswer(key, e.target.value)}
            rows={4}
          />
          {isFeelings && (
            <button
              className="blk-somatic-btn"
              onClick={handleSomaticBranch}
            >
              🎭 Work through this somatically →
            </button>
          )}
          <div className="nav-row">
            <button className="btn-ghost" onClick={() => step > 0 ? setStep((s) => s - 1) : onBack()}>
              Back
            </button>
            <button
              className="btn-primary"
              style={{ background: "#C0392B" }}
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        // Step 9 — Immediate Action: two completion paths
        <>
          <textarea
            className="rarea"
            placeholder={prompt.placeholder}
            value={value}
            onChange={(e) => setBlockAnswer(key, e.target.value)}
            rows={4}
          />
          <div className="nav-row" style={{ flexDirection: "column", gap: ".6rem" }}>
            <button
              className="btn-primary"
              style={{ background: "#C0392B", width: "100%" }}
              disabled={!canNext}
              onClick={handleComplete}
            >
              ✅ I&apos;ll do it now — Block Cleared
            </button>
            <button
              className="btn-ghost"
              style={{ width: "100%" }}
              disabled={!canNext}
              onClick={handleSchedule}
            >
              📅 Schedule it for later
            </button>
            <button className="btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
