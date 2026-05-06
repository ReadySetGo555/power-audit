"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SETS, STAGES } from "@/lib/data";
import { Header } from "@/components/Header";
import { QuestionCard } from "@/components/QuestionCard";
import { useApp } from "@/context/AppContext";
import { scoreColor, scoreLabel } from "@/lib/helpers";

type SelectMode = "excited" | "impact" | null;

export default function AssessmentPage() {
  const router = useRouter();
  const { answers, excited, impactful, setAnswer, setExcitedStage, setImpactfulStage, pendingUpdate, setPendingUpdate } = useApp();
  const topRef = useRef<HTMLDivElement>(null);

  const [setIdx, setSetIdx] = useState(pendingUpdate?.setIdx ?? 0);
  const [stageIdx, setStageIdx] = useState(pendingUpdate?.stageIdx ?? 0);
  const [selectMode, setSelectMode] = useState<SelectMode>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (pendingUpdate) setPendingUpdate(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const curSet = SETS[setIdx];
  const curStage = STAGES[stageIdx];
  const curAns = answers[curSet.id]?.[curStage.id] ?? {};
  const isTen = curAns.score === 10;
  const canAdv = curAns.score != null && (curAns.why ?? "").trim().length > 4 && (isTen || (curAns.makeTen ?? "").trim().length > 4);
  const doneInSet = Object.keys(answers[curSet.id] ?? {});
  const allSixDone = STAGES.every((s) => answers[curSet.id]?.[s.id]?.score != null);
  const pct = ((setIdx * 6 + stageIdx) / 24) * 100;

  const excitedForSet = excited[curSet.id] ?? null;
  const impactfulForSet = impactful[curSet.id] ?? null;

  function go(fn: () => void) {
    setFading(true);
    setTimeout(() => {
      fn();
      setFading(false);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }

  function handleChange(field: string, value: unknown) {
    setAnswer(curSet.id, curStage.id, field, value);
  }

  function handleNext() {
    if (stageIdx < 5) go(() => setStageIdx((i) => i + 1));
    else if (setIdx < SETS.length - 1) go(() => { setSetIdx((i) => i + 1); setStageIdx(0); setSelectMode(null); });
    else go(() => router.push("/dashboard"));
  }

  function handleBack() {
    if (selectMode) {
      setSelectMode(null);
      return;
    }
    if (stageIdx > 0) go(() => setStageIdx((i) => i - 1));
    else if (setIdx > 0) go(() => { setSetIdx((i) => i - 1); setStageIdx(5); setSelectMode(null); });
    else router.push("/");
  }

  function jumpToSet(targetIdx: number) {
    const targetSetId = SETS[targetIdx].id;
    let targetStage = 0;
    for (let i = 0; i < STAGES.length; i++) {
      if (!answers[targetSetId]?.[STAGES[i].id]?.score) {
        targetStage = i;
        break;
      }
    }
    go(() => { setSetIdx(targetIdx); setStageIdx(targetStage); setSelectMode(null); });
  }

  function toggleSelect(mode: SelectMode) {
    setSelectMode((cur) => cur === mode ? null : mode);
  }

  // Inline selection picker
  function renderSelectionPicker() {
    if (!selectMode) return null;
    const isExcited = selectMode === "excited";
    const prompt = isExcited ? curSet.excitedPrompt : curSet.impactPrompt;
    const currentSelected = isExcited ? excitedForSet : impactfulForSet;
    const accentColor = isExcited ? "#E67E22" : "#3498DB";

    return (
      <div className="sel-inline-wrap">
        <div className="sel-inline-hd">
          <span style={{ color: accentColor }}>{isExcited ? "❗" : "💥"}</span>
          <span className="sel-inline-title">{prompt}</span>
          <button className="sel-inline-close" onClick={() => setSelectMode(null)}>✕</button>
        </div>
        <div className="sel-opts" style={{ marginBottom: 0 }}>
          {STAGES.map((stage) => {
            const ans = answers[curSet.id]?.[stage.id] ?? {};
            const chosen = currentSelected === stage.id;
            return (
              <div
                key={stage.id}
                className={"sel-opt" + (chosen ? " chosen" : "")}
                style={{ borderColor: chosen ? accentColor : undefined }}
                onClick={() => {
                  if (isExcited) setExcitedStage(curSet.id, stage.id);
                  else setImpactfulStage(curSet.id, stage.id);
                  setSelectMode(null);
                }}
              >
                <div className="so-top">
                  <div className="so-left">
                    <span className="so-icon">{stage.icon}</span>
                    <div>
                      <div className="so-label">{stage.label}</div>
                      <div className="so-q">{curSet.question(stage.id)}</div>
                    </div>
                  </div>
                  <div className="so-right">
                    <span className="so-score" style={{ color: scoreColor(ans.score) }}>{ans.score ?? "—"}</span>
                    <span className="so-slabel" style={{ color: scoreColor(ans.score) }}>{scoreLabel(ans.score)}</span>
                  </div>
                </div>
                {ans.why && <p className="so-answer-lbl">Why it&apos;s a {ans.score}:</p>}
                {ans.why && <p className="so-why">&ldquo;{ans.why}&rdquo;</p>}
                <div className={"so-radio" + (chosen ? " on" : "")} style={{ borderColor: chosen ? accentColor : undefined, background: chosen ? accentColor : undefined }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const nextLabel = stageIdx < 5
    ? "Next stage →"
    : setIdx < SETS.length - 1
      ? "Next set →"
      : "Finish →";

  return (
    <div className="app" ref={topRef}>
      <Header />

      <div className="pt">
        <div className="pt-track"><div className="pt-fill" style={{ width: `${pct}%` }} /></div>
        <div className="pt-meta">
          <span className="pt-set">{curSet.label}</span>
          <span>Stage {stageIdx + 1} of 6 · Set {setIdx + 1} of 4</span>
        </div>
      </div>

      <div className={`fw${fading ? " out" : ""}`}>

        {/* Set tabs */}
        <div className="set-tabs">
          {SETS.map((s, idx) => (
            <button
              key={s.id}
              className={"set-tab" + (idx === setIdx ? " active" : "")}
              onClick={() => jumpToSet(idx)}
            >
              Set {idx + 1}
            </button>
          ))}
        </div>

        {/* Stage nav + selection buttons on same row */}
        <div className="cmap-row">
          <div className="cmap">
            {STAGES.map((s, idx) => {
              const isAct = s.id === curStage.id;
              const isDone = doneInSet.includes(s.id);
              return (
                <div
                  key={s.id}
                  className="cms"
                  onClick={() => { setSelectMode(null); go(() => setStageIdx(idx)); }}
                  style={{
                    background: isAct ? "#7C5CBF" : "transparent",
                    color: isAct ? "#0A0908" : isDone ? "#7C5CBF" : "#4A4238",
                    borderColor: isAct ? "#7C5CBF" : isDone ? "#7C5CBF55" : "#2A2520",
                    fontWeight: isAct ? 600 : 400,
                  }}
                >
                  {s.icon} {s.label}{isDone && !isAct ? " ✓" : ""}
                </div>
              );
            })}
          </div>

          {/* Excited / Impactful buttons — always visible, enabled once all 6 stages answered */}
          <div className="sel-btns">
            <button
              className={"sel-btn" + (selectMode === "excited" ? " active" : "") + (excitedForSet ? " chosen" : "")}
              style={{
                borderColor: selectMode === "excited" ? "#E67E22" : excitedForSet ? "#E67E2255" : undefined,
                color: excitedForSet || selectMode === "excited" ? "#E67E22" : undefined,
                opacity: allSixDone ? 1 : 0.3,
                cursor: allSixDone ? "pointer" : "not-allowed",
              }}
              disabled={!allSixDone}
              onClick={() => toggleSelect("excited")}
              title={allSixDone ? curSet.excitedPrompt : "Complete all 6 stages first"}
            >
              ❗{excitedForSet ? ` ${STAGES.find((s) => s.id === excitedForSet)?.icon}` : ""}
            </button>
            <button
              className={"sel-btn" + (selectMode === "impact" ? " active" : "") + (impactfulForSet ? " chosen" : "")}
              style={{
                borderColor: selectMode === "impact" ? "#3498DB" : impactfulForSet ? "#3498DB55" : undefined,
                color: impactfulForSet || selectMode === "impact" ? "#3498DB" : undefined,
                opacity: allSixDone ? 1 : 0.3,
                cursor: allSixDone ? "pointer" : "not-allowed",
              }}
              disabled={!allSixDone}
              onClick={() => toggleSelect("impact")}
              title={allSixDone ? curSet.impactPrompt : "Complete all 6 stages first"}
            >
              💥{impactfulForSet ? ` ${STAGES.find((s) => s.id === impactfulForSet)?.icon}` : ""}
            </button>
          </div>
        </div>

        {/* Inline selection picker — appears between nav and question card */}
        {renderSelectionPicker()}

        {/* Question card */}
        <QuestionCard key={`${curSet.id}-${curStage.id}`} set={curSet} stage={curStage} answer={curAns} onChange={handleChange} />

        <div className="qnav">
          <button className="btn-ghost" onClick={handleBack}>Back</button>
          <button className="btn-primary" disabled={!canAdv} onClick={handleNext}>
            {nextLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
