"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SETS, STAGES } from "@/lib/data";
import { scoreColor } from "@/lib/helpers";
import { useApp } from "@/context/AppContext";
import type { Answers } from "@/lib/types";

interface Props {
  answers: Answers;
}

type PanelType = "stage" | "set";
interface OpenPanel { type: PanelType; id: string; }

function avg(nums: (number | null | undefined)[]): number | null {
  const valid = nums.filter((n): n is number => n != null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function fmt(n: number | null): string {
  if (n == null) return "—";
  return (Math.round(n * 10) / 10).toString();
}

export function BirdsEyeGrid({ answers }: Props) {
  const [openPanel, setOpenPanel] = useState<OpenPanel | null>(null);
  const [sortScore, setSortScore] = useState(false);
  const router = useRouter();
  const { setPendingUpdate } = useApp();

  function togglePanel(type: PanelType, id: string) {
    if (openPanel?.type === type && openPanel.id === id) {
      setOpenPanel(null);
    } else {
      setOpenPanel({ type, id });
      setSortScore(false);
    }
  }

  function jumpToStage(setId: string, stageId: string) {
    const setIdx = SETS.findIndex((s) => s.id === setId);
    const stageIdx = STAGES.findIndex((s) => s.id === stageId);
    if (setIdx < 0 || stageIdx < 0) return;
    setPendingUpdate({ setIdx, stageIdx, phase: "questions" });
    router.push("/assessment");
  }

  // Pre-compute set averages and stage averages
  const setAvgs = SETS.map((set) => avg(STAGES.map((st) => answers[set.id]?.[st.id]?.score)));
  const stageAvgs = STAGES.map((stage) => avg(SETS.map((set) => answers[set.id]?.[stage.id]?.score)));
  const grandAvg = avg(SETS.flatMap((set) => STAGES.map((st) => answers[set.id]?.[st.id]?.score)));

  function ScoreCell({ score, clickable, onClick }: { score: number | null; clickable?: boolean; onClick?: () => void }) {
    const color = score != null ? scoreColor(score) : "#2A2218";
    const isActive = clickable && openPanel && (
      (openPanel.type === "stage" && onClick) || (openPanel.type === "set" && onClick)
    );
    return (
      <div
        className={"beg-cell" + (clickable ? " beg-cell-btn" : "")}
        style={{ color, borderColor: isActive ? color : undefined }}
        onClick={onClick}
      >
        {score != null ? fmt(score) : <span className="beg-empty">—</span>}
      </div>
    );
  }

  function renderExpandPanel() {
    if (!openPanel) return null;

    if (openPanel.type === "stage") {
      const stage = STAGES.find((s) => s.id === openPanel.id)!;
      let rows = SETS.map((set) => ({
        label: set.label,
        score: answers[set.id]?.[stage.id]?.score ?? null,
        question: set.question(stage.id),
        why: answers[set.id]?.[stage.id]?.why ?? "",
        makeTen: answers[set.id]?.[stage.id]?.makeTen ?? "",
      })).filter((r) => r.score != null);
      if (sortScore) rows = [...rows].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      return (
        <ExpandPanel
          title={`${stage.icon} ${stage.label} — All Sets`}
          rows={rows}
          sortScore={sortScore}
          onSort={setSortScore}
          naturalLabel="Set Order"
        />
      );
    }

    // type === "set"
    const set = SETS.find((s) => s.id === openPanel.id)!;
    let rows = STAGES.map((stage) => ({
      label: stage.label,
      score: answers[set.id]?.[stage.id]?.score ?? null,
      question: set.question(stage.id),
      why: answers[set.id]?.[stage.id]?.why ?? "",
      makeTen: answers[set.id]?.[stage.id]?.makeTen ?? "",
    })).filter((r) => r.score != null);
    if (sortScore) rows = [...rows].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return (
      <ExpandPanel
        title={`${set.label} — All Stages`}
        rows={rows}
        sortScore={sortScore}
        onSort={setSortScore}
        naturalLabel="Stage Order"
      />
    );
  }

  const cellStyle: React.CSSProperties = { textAlign: "center" };

  return (
    <div className="beg-wrap">
      <div className="beg-grid" style={{ gridTemplateColumns: `1fr repeat(${STAGES.length}, minmax(0,1fr)) minmax(0,1fr)` }}>
        {/* Header row */}
        <div className="beg-corner" />
        {STAGES.map((s) => (
          <div key={s.id} className="beg-col-hd" style={cellStyle}>
            <span className="beg-stage-icon">{s.icon}</span>
            <span className="beg-stage-name">{s.label}</span>
          </div>
        ))}
        <div className="beg-col-hd beg-avg-hd" style={cellStyle}>Avg</div>

        {/* Data rows */}
        {SETS.map((set, si) => (
          <React.Fragment key={set.id}>
            <div className="beg-row-hd">{set.label}</div>
            {STAGES.map((stage) => {
              const score = answers[set.id]?.[stage.id]?.score ?? null;
              return (
                <ScoreCell
                  key={`${set.id}-${stage.id}`}
                  score={score}
                  clickable
                  onClick={() => jumpToStage(set.id, stage.id)}
                />
              );
            })}
            <ScoreCell
              score={setAvgs[si]}
              clickable
              onClick={() => togglePanel("set", set.id)}
            />
          </React.Fragment>
        ))}

        {/* Totals row */}
        <div className="beg-row-hd beg-avg-row-lbl">Avg</div>
        {STAGES.map((stage, sti) => (
          <ScoreCell
            key={`stavg-${stage.id}`}
            score={stageAvgs[sti]}
            clickable
            onClick={() => togglePanel("stage", stage.id)}
          />
        ))}
        <div className="beg-cell" />
      </div>

      {renderExpandPanel()}
    </div>
  );
}

interface ExpandRow {
  label: string;
  score: number | null;
  question: string;
  why: string;
  makeTen: string;
}

function ExpandPanel({
  title, rows, sortScore, onSort, naturalLabel,
}: {
  title: string;
  rows: ExpandRow[];
  sortScore: boolean;
  onSort: (v: boolean) => void;
  naturalLabel: string;
}) {
  if (rows.length === 0) return (
    <div className="beg-panel">
      <p className="beg-panel-empty">No answers yet for this selection.</p>
    </div>
  );

  return (
    <div className="beg-panel">
      <div className="beg-panel-hd">
        <span className="beg-panel-title">{title}</span>
        <div className="beg-sort-toggle">
          <button className={"beg-sort-btn" + (!sortScore ? " active" : "")} onClick={() => onSort(false)}>{naturalLabel}</button>
          <button className={"beg-sort-btn" + (sortScore ? " active" : "")} onClick={() => onSort(true)}>Score ↓</button>
        </div>
      </div>
      {rows.map((row) => (
        <div key={row.label} className="beg-row">
          <div className="beg-row-score" style={{ color: scoreColor(row.score) }}>
            {row.score}
          </div>
          <div className="beg-row-content">
            <div className="beg-row-label">{row.label}</div>
            <div className="beg-row-q">{row.question}</div>
            {row.why && <div className="beg-row-ans"><span className="beg-ans-lbl">Why:</span> {row.why}</div>}
            {row.makeTen && <div className="beg-row-ans"><span className="beg-ans-lbl">Make it a 10:</span> {row.makeTen}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
