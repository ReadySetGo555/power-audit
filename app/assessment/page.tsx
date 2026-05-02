"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SETS, STAGES } from "@/lib/data";
import { Header } from "@/components/Header";
import { QuestionCard } from "@/components/QuestionCard";
import { SelectScreen } from "@/components/SelectScreen";
import { useApp } from "@/context/AppContext";

type Phase = "questions" | "excited" | "impact";

export default function AssessmentPage() {
  const router = useRouter();
  const { answers, excited, impactful, setAnswer, setExcitedStage, setImpactfulStage, pendingUpdate, setPendingUpdate } = useApp();
  const topRef = useRef<HTMLDivElement>(null);

  const [setIdx, setSetIdx] = useState(pendingUpdate?.setIdx ?? 0);
  const [stageIdx, setStageIdx] = useState(pendingUpdate?.stageIdx ?? 0);
  const [phase, setPhase] = useState<Phase>("questions");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (pendingUpdate) setPendingUpdate(null);
  }, []);

  const curSet = SETS[setIdx];
  const curStage = STAGES[stageIdx];
  const curAns = answers[curSet.id]?.[curStage.id] ?? {};
  const isTen = curAns.score === 10;
  const canAdv = curAns.score != null && (curAns.why ?? "").trim().length > 4 && (isTen || (curAns.makeTen ?? "").trim().length > 4);
  const doneInSet = Object.keys(answers[curSet.id] ?? {});
  const pct = ((setIdx * 6 + stageIdx) / 24) * 100;

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
    else go(() => setPhase("excited"));
  }

  function handleBack() {
    if (phase === "impact") go(() => setPhase("excited"));
    else if (phase === "excited") go(() => { setStageIdx(5); setPhase("questions"); });
    else if (stageIdx > 0) go(() => setStageIdx((i) => i - 1));
    else if (setIdx > 0) go(() => { setSetIdx((i) => i - 1); setStageIdx(5); setPhase("questions"); });
    else router.push("/");
  }

  function afterImpact() {
    if (setIdx < SETS.length - 1) {
      go(() => { setSetIdx((i) => i + 1); setStageIdx(0); setPhase("questions"); });
    } else {
      go(() => router.push("/dashboard"));
    }
  }

  return (
    <div className="app" ref={topRef}>
      <Header />

      {phase === "questions" && (
        <div className="pt">
          <div className="pt-track"><div className="pt-fill" style={{ width: `${pct}%` }} /></div>
          <div className="pt-meta">
            <span className="pt-set">{curSet.label}</span>
            <span>Stage {stageIdx + 1} of 6 · Set {setIdx + 1} of 4</span>
          </div>
        </div>
      )}

      <div className={"fw" + (fading ? " out" : "")}>
        {phase === "questions" && (
          <>
            <div className="cmap">
              {STAGES.map((s) => {
                const isAct = s.id === curStage.id;
                const isDone = doneInSet.includes(s.id);
                return (
                  <div key={s.id} className="cms" style={{
                    background: isAct ? "#7C5CBF" : "transparent",
                    color: isAct ? "#0A0908" : isDone ? "#7C5CBF" : "#4A4238",
                    borderColor: isAct ? "#7C5CBF" : isDone ? "#7C5CBF55" : "#2A2520",
                    fontWeight: isAct ? 600 : 400,
                  }}>
                    {s.icon} {s.label}{isDone && !isAct ? " ✓" : ""}
                  </div>
                );
              })}
            </div>
            <QuestionCard key={`${curSet.id}-${curStage.id}`} set={curSet} stage={curStage} answer={curAns} onChange={handleChange} />
            <div className="qnav">
              <button className="btn-ghost" onClick={handleBack}>Back</button>
              <button className="btn-primary" disabled={!canAdv} onClick={handleNext}>
                {stageIdx < 5 ? "Next stage →" : "See selections →"}
              </button>
            </div>
          </>
        )}

        {phase === "excited" && (
          <SelectScreen
            set={curSet} answers={answers} isExcited={true}
            selected={excited[curSet.id]}
            onSelect={(id) => setExcitedStage(curSet.id, id)}
            onBack={handleBack}
            onNext={() => go(() => setPhase("impact"))}
          />
        )}

        {phase === "impact" && (
          <SelectScreen
            set={curSet} answers={answers} isExcited={false}
            selected={impactful[curSet.id]}
            onSelect={(id) => setImpactfulStage(curSet.id, id)}
            onBack={handleBack}
            onNext={afterImpact}
          />
        )}
      </div>
    </div>
  );
}
