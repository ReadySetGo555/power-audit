"use client";

import type { AllItem } from "@/lib/types";
import { SETS, STAGES } from "@/lib/data";
import { scoreColor, scoreLabel } from "@/lib/helpers";

export function Counters({ allItems }: { allItems: AllItem[] }) {
  const setAvgs = SETS.map((set) => {
    const setItems = allItems.filter((i) => i.set.id === set.id);
    if (!setItems.length) return { set, avg: null };
    const avg = setItems.reduce((a, i) => a + (i.ans.score ?? 0), 0) / setItems.length;
    return { set, avg: Math.round(avg * 10) / 10 };
  }).filter((s) => s.avg !== null) as { set: typeof SETS[0]; avg: number }[];

  const worstSet = setAvgs.length ? [...setAvgs].sort((a, b) => a.avg - b.avg)[0] : null;

  const stageAvgs = STAGES.map((stage) => {
    const stageItems = allItems.filter((i) => i.stage.id === stage.id);
    if (!stageItems.length) return { stage, avg: null };
    const avg = stageItems.reduce((a, i) => a + (i.ans.score ?? 0), 0) / stageItems.length;
    return { stage, avg: Math.round(avg * 10) / 10 };
  }).filter((s) => s.avg !== null) as { stage: typeof STAGES[0]; avg: number }[];

  const worstStage = stageAvgs.length ? [...stageAvgs].sort((a, b) => a.avg - b.avg)[0] : null;

  const totalBlocks = allItems.filter((i) => i.rawSomatic).length;
  const blocksOvercome = allItems.filter((i) => i.rawSomatic && i.somaticCleared).length;

  return (
    <div className="counters">
      <div className="counter">
        <div className="counter-lbl">Biggest Deficit — Set</div>
        {worstSet ? (
          <>
            <div className="counter-val" style={{ color: scoreColor(worstSet.avg) }}>{worstSet.avg}</div>
            <div className="counter-sub">{worstSet.set.label}</div>
          </>
        ) : <div className="counter-empty">No data yet</div>}
      </div>
      <div className="counter">
        <div className="counter-lbl">Biggest Deficit — Stage</div>
        {worstStage ? (
          <>
            <div className="counter-val" style={{ color: scoreColor(worstStage.avg) }}>{worstStage.avg}</div>
            <div className="counter-sub">{worstStage.stage.icon} {worstStage.stage.label}</div>
          </>
        ) : <div className="counter-empty">No data yet</div>}
      </div>
      <div className="counter">
        <div className="counter-lbl">Blocks Overcome</div>
        <div className="counter-blocks">
          <span style={{ color: "#2ECC71", fontWeight: 700 }}>{blocksOvercome}</span>
          <span style={{ color: "#4A4238" }}>/</span>
          <span style={{ color: "#C0392B", fontWeight: 700 }}>{totalBlocks}</span>
        </div>
        <div className="counter-sub">
          {totalBlocks === 0 ? "No blocks" : blocksOvercome === totalBlocks ? "All cleared!" : "in progress"}
        </div>
      </div>
    </div>
  );
}
