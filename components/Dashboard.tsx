"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AllItem } from "@/lib/types";
import { SETS, STAGES, TIER_META, COLOR, GOAL_PROMPTS } from "@/lib/data";
import { scoreColor, scoreLabel, scoreCat, getTier } from "@/lib/helpers";
import { useApp } from "@/context/AppContext";
import { TierItemCard } from "./TierItemCard";
import { BirdsEyeGrid } from "./BirdsEyeGrid";
import { ScaleSummaries } from "./ScaleSummaries";

export function Dashboard() {
  const router = useRouter();
  const { allItems, answers, excited, impactful, goalAnswers, somaticAnswers, blockAnswers, toggleBadge, setPendingUpdate, completeBlock } = useApp();
  const [tab, setTab] = useState("tiers");
  const [openSec, setOpenSec] = useState<Record<string, boolean>>({});
  const [nextStepOpen, setNextStepOpen] = useState(false);

  const tierItems = allItems.filter((i) => i.tier !== null);
  const grouped: Record<number, AllItem[]> = { 1: [], 2: [], 3: [], 4: [] };
  tierItems.forEach((item) => { if (grouped[item.tier!]) grouped[item.tier!].push(item); });
  grouped[1].sort((a, b) => {
    const aS = a.isExcited && a.isImpact ? 0 : a.isExcited ? 1 : 2;
    const bS = b.isExcited && b.isImpact ? 0 : b.isExcited ? 1 : 2;
    return aS - bS;
  });

  const goalItems = allItems.filter((item) =>
    Object.keys(goalAnswers).some((k) => k.startsWith(`${item.set.id}-${item.stage.id}`))
  );
  const somaticItems = allItems.filter((item) =>
    Object.keys(somaticAnswers).some((k) => k.startsWith(item.key))
  );
  const blockedItems = allItems.filter((item) => !!item.ans.blocked);

  const goalCompleted = goalItems.filter((item) =>
    GOAL_PROMPTS.every((p) => (goalAnswers[`${item.set.id}-${item.stage.id}-${p.id}`] ?? "").trim().length > 0)
  ).length;
  const somaticCompleted = somaticItems.filter((i) => i.somaticCleared).length;
  const blockedCleared = blockedItems.filter((i) => !!i.ans.block_cleared).length;

  const totalAnswered = SETS.reduce(
    (acc, set) => acc + STAGES.filter((stage) => answers[set.id]?.[stage.id]?.score != null).length,
    0
  );
  const assessmentTabLabel =
    totalAnswered < SETS.length * STAGES.length ? "Finish Full Assessment" : "View Assessment Birds-eye";

  function toggle(key: string) {
    setOpenSec((o) => ({ ...o, [key]: !o[key] }));
  }

  function handleGoal(item: AllItem) {
    router.push(`/goal/${item.set.id}/${item.stage.id}`);
  }

  function handleSomatic(item: AllItem) {
    router.push(`/somatic/${item.set.id}/${item.stage.id}`);
  }

  function handleBlock(item: AllItem) {
    router.push(`/blocks/${item.set.id}/${item.stage.id}`);
  }

  function handleBlockConfirm(item: AllItem) {
    completeBlock(item.set.id, item.stage.id);
  }

  function card(item: AllItem, color?: string) {
    return (
      <TierItemCard key={item.key} item={item} tierColor={color}
        onBadge={toggleBadge} onGoal={handleGoal} onSomatic={handleSomatic} onBlock={handleBlock}
        goalAnswers={goalAnswers} somaticAnswers={somaticAnswers} blockAnswers={blockAnswers}
      />
    );
  }

  function dropdown(secKey: string, label: string, count: number, items: AllItem[], color: string) {
    return (
      <>
        <div className="dash-dropdown" onClick={() => toggle(secKey)}>
          <span>{label} <span className="dd-count">{count}</span></span>
          <span className="dd-arr">{openSec[secKey] ? "▲" : "▼"}</span>
        </div>
        {openSec[secKey] && (
          <div className="dd-body">
            {items.length === 0
              ? <p className="dd-empty">{label.includes("Goal") ? "No active goals yet." : "No somatic processes started."}</p>
              : items.map((i) => card(i, color))}
          </div>
        )}
      </>
    );
  }

  function renderProgressSections() {
    const hasAny = goalItems.length > 0 || somaticItems.length > 0 || blockedItems.length > 0;
    if (!hasAny) return null;

    function progSection(
      secKey: string,
      label: string,
      items: AllItem[],
      counter: string,
      color: string,
      emptyMsg: string,
    ) {
      const isOpen = !!openSec[`prog_${secKey}`];
      return (
        <div className="prog-section" key={secKey}>
          <div className="prog-hd" onClick={() => toggle(`prog_${secKey}`)}>
            <span className="prog-label">{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <span className="prog-counter" style={{ color }}>{counter}</span>
              <span className="dd-arr">{isOpen ? "▲" : "▼"}</span>
            </div>
          </div>
          {isOpen && (
            <div className="dd-body">
              {items.length === 0
                ? <p className="dd-empty">{emptyMsg}</p>
                : items.map((i) => card(i, color))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="prog-wrap">
        {goalItems.length > 0 && progSection("goals", "🎯 Active Goals", goalItems, `${goalCompleted}/${goalItems.length} completed`, COLOR, "No active goals yet.")}
        {somaticItems.length > 0 && progSection("somatic", "🎭 Somatic Processes", somaticItems, `${somaticCompleted}/${somaticItems.length} completed`, TIER_META[4].color, "No somatic processes started.")}
        {blockedItems.length > 0 && progSection("blocked", "❌ Stuck / Blocked", blockedItems, `${blockedCleared}/${blockedItems.length} cleared`, "#C0392B", "No blocked items.")}
      </div>
    );
  }

  function renderNextStep() {
    if (tierItems.length === 0) return null;
    const best = [...tierItems].sort((a, b) => {
      if (a.tier !== b.tier) return (a.tier ?? 9) - (b.tier ?? 9);
      return (a.ans.score ?? 0) - (b.ans.score ?? 0);
    })[0];
    const hasGoal = Object.keys(goalAnswers).some((k) => k.startsWith(`${best.set.id}-${best.stage.id}`));
    const tm = TIER_META[best.tier!];
    return (
      <div className="next-step-wrap">
        <h2 className="tv-title" style={{ marginBottom: ".75rem" }}>Your Next Step</h2>
        <div className="next-step-card" style={{ borderLeftColor: tm.color }} onClick={() => setNextStepOpen((o) => !o)}>
          <div className="next-step-top">
            <span className="ti-icon">{best.stage.icon}</span>
            <div className="ti-info">
              <span className="ti-stage">{best.stage.label}</span>
              <span className="ti-set">{best.set.label}</span>
            </div>
            <div className="ti-badges">
              {best.isExcited && <span className="tbadge on">❗</span>}
              {best.isImpact && <span className="tbadge on">💥</span>}
              {best.hasSomatic && <span className="tbadge on">🎭</span>}
            </div>
            <div className="ti-score" style={{ color: scoreColor(best.ans.score) }}>
              {best.ans.score}/10
              <span className="ti-sl">{scoreLabel(best.ans.score)}</span>
            </div>
            <span className="next-step-arr">{nextStepOpen ? "▲" : "▼"}</span>
          </div>
          {nextStepOpen && (
            <div className="next-step-body" onClick={(e) => e.stopPropagation()}>
              {best.ans.why && <><p className="ti-why-lbl">Why it&apos;s a {best.ans.score}:</p><p className="ti-why">&ldquo;{best.ans.why}&rdquo;</p></>}
              {best.ans.makeTen && <><p className="ti-why-lbl">What would make it a 10:</p><p className="ti-why">&ldquo;{best.ans.makeTen}&rdquo;</p></>}
              <div className="ti-actions">
                {best.hasSomatic && (
                  <button className="btn-somatic" onClick={() => handleSomatic(best)}>
                    🎭 Clear the Block →
                  </button>
                )}
                <button className="btn-start" style={{ background: tm.color }} onClick={() => handleGoal(best)}>
                  {hasGoal ? "Continue goal →" : "Set Goals →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderContinueSection() {
    const assessmentQsDone = totalAnswered === SETS.length * STAGES.length;
    const assessmentSelDone = SETS.every((s) => excited[s.id] != null && impactful[s.id] != null);
    const assessmentComplete = assessmentQsDone && assessmentSelDone;

    const incompleteGoalItems = goalItems.filter((item) => {
      const nonEmpty = GOAL_PROMPTS.filter(
        (p) => (goalAnswers[`${item.set.id}-${item.stage.id}-${p.id}`] ?? "").trim().length > 0
      ).length;
      return nonEmpty > 0 && nonEmpty < GOAL_PROMPTS.length;
    });

    const inProgressSomaticItems = somaticItems.filter((i) => !i.somaticCleared);
    const scheduledBlockItems = blockedItems.filter((i) => !!i.ans.action_scheduled && !i.ans.action_confirmed && !i.ans.block_cleared);
    const inProgressBlockItems = blockedItems.filter((i) => !i.ans.block_cleared && !i.ans.action_scheduled &&
      Object.keys(blockAnswers).some((k) => k.startsWith(i.key))
    );

    const nothingStarted =
      totalAnswered === 0 &&
      Object.keys(goalAnswers).length === 0 &&
      Object.keys(somaticAnswers).length === 0;
    const everythingDone =
      assessmentComplete && incompleteGoalItems.length === 0 && inProgressSomaticItems.length === 0 &&
      scheduledBlockItems.length === 0 && inProgressBlockItems.length === 0;

    if (everythingDone) return null;

    if (nothingStarted) {
      return (
        <div className="continue-section">
          <p className="continue-eyebrow">Ready to Begin?</p>
          <button className="continue-start-btn" onClick={() => router.push("/assessment")}>
            Start your assessment →
          </button>
        </div>
      );
    }

    // Find next assessment target
    let nextTarget: { setIdx: number; stageIdx: number; phase: "questions" | "excited" | "impact" } | null = null;
    if (!assessmentComplete) {
      outer: for (let si = 0; si < SETS.length; si++) {
        for (let sti = 0; sti < STAGES.length; sti++) {
          if (answers[SETS[si].id]?.[STAGES[sti].id]?.score == null) {
            nextTarget = { setIdx: si, stageIdx: sti, phase: "questions" };
            break outer;
          }
        }
      }
      if (!nextTarget) {
        for (let si = 0; si < SETS.length; si++) {
          if (!excited[SETS[si].id]) {
            nextTarget = { setIdx: si, stageIdx: 0, phase: "excited" };
            break;
          }
        }
      }
      if (!nextTarget) {
        for (let si = 0; si < SETS.length; si++) {
          if (!impactful[SETS[si].id]) {
            nextTarget = { setIdx: si, stageIdx: 0, phase: "impact" };
            break;
          }
        }
      }
    }

    const hasCards = nextTarget || incompleteGoalItems.length > 0 || inProgressSomaticItems.length > 0 ||
      scheduledBlockItems.length > 0 || inProgressBlockItems.length > 0;
    if (!hasCards) return null;

    return (
      <div className="continue-section">
        <p className="continue-eyebrow">Continue Where You Left Off</p>

        {nextTarget && (
          <div
            className="continue-card"
            onClick={() => {
              setPendingUpdate(nextTarget!);
              router.push("/assessment");
            }}
          >
            <span className="cc-icon">📋</span>
            <div className="cc-text">
              <div className="cc-label">
                {nextTarget.phase === "questions"
                  ? `Continue ${SETS[nextTarget.setIdx].label}`
                  : `Selections for ${SETS[nextTarget.setIdx].label}`}
              </div>
              <div className="cc-sub">
                {nextTarget.phase === "questions"
                  ? `${STAGES[nextTarget.stageIdx].icon} Stage ${nextTarget.stageIdx + 1} — ${STAGES[nextTarget.stageIdx].label}`
                  : nextTarget.phase === "excited"
                    ? "Choose your most exciting stage"
                    : "Choose your most impactful stage"}
              </div>
            </div>
            <span className="cc-arr">→</span>
          </div>
        )}

        {incompleteGoalItems.map((item) => (
          <div
            key={item.key}
            className="continue-card"
            onClick={() => router.push(`/goal/${item.set.id}/${item.stage.id}`)}
          >
            <span className="cc-icon">🎯</span>
            <div className="cc-text">
              <div className="cc-label">Continue your goal on {item.stage.label}</div>
              <div className="cc-sub">{item.set.label}</div>
            </div>
            <span className="cc-arr">→</span>
          </div>
        ))}

        {inProgressSomaticItems.map((item) => (
          <div
            key={item.key}
            className="continue-card"
            onClick={() => router.push(`/somatic/${item.set.id}/${item.stage.id}`)}
          >
            <span className="cc-icon">🎭</span>
            <div className="cc-text">
              <div className="cc-label">Continue somatic process on {item.stage.label}</div>
              <div className="cc-sub">{item.set.label}</div>
            </div>
            <span className="cc-arr">→</span>
          </div>
        ))}

        {inProgressBlockItems.map((item) => (
          <div
            key={item.key}
            className="continue-card"
            onClick={() => router.push(`/blocks/${item.set.id}/${item.stage.id}`)}
          >
            <span className="cc-icon">❌</span>
            <div className="cc-text">
              <div className="cc-label">Continue block clearing on {item.stage.label}</div>
              <div className="cc-sub">{item.set.label}</div>
            </div>
            <span className="cc-arr">→</span>
          </div>
        ))}

        {scheduledBlockItems.map((item) => (
          <div key={item.key} className="continue-card continue-card-scheduled">
            <span className="cc-icon">📅</span>
            <div className="cc-text">
              <div className="cc-label">Scheduled action — {item.stage.label}</div>
              <div className="cc-sub">{item.set.label} · Tap to confirm it&apos;s done</div>
            </div>
            <button
              className="btn-primary"
              style={{ fontSize: ".75rem", padding: ".35rem .875rem" }}
              onClick={(e) => { e.stopPropagation(); handleBlockConfirm(item); }}
            >
              Done ✓
            </button>
          </div>
        ))}
      </div>
    );
  }

  function renderTiersTab() {
    return (
      <div>
        {([1, 2, 3, 4] as const).map((t) => {
          if (!grouped[t]?.length) return null;
          const tm = TIER_META[t];
          const isOpen = !!openSec[`tier${t}`];
          return (
            <div key={t} className="tier-block" style={{ borderLeftColor: tm.color }}>
              <div className="tier-hd" onClick={() => toggle(`tier${t}`)}>
                <div className="tier-hd-left">
                  <span className="tier-num" style={{ background: tm.color }}>{t}</span>
                  <div>
                    <div className="tier-label">{tm.label}</div>
                    <div className="tier-desc">{tm.desc}</div>
                  </div>
                </div>
                <span className="tier-tog">{isOpen ? "▲" : "▼"} {grouped[t].length}</span>
              </div>
              {isOpen && <div className="tier-body">{grouped[t].map((i) => card(i, tm.color))}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  function renderStageTab() {
    return (
      <div>
        {STAGES.map((stage) => {
          const si = allItems.filter((i) => i.stage.id === stage.id);
          if (!si.length) return null;
          const avg = si.reduce((a, i) => a + (i.ans.score ?? 0), 0) / si.length;
          const isOpen = !!openSec[`stage_${stage.id}`];
          return (
            <div key={stage.id} className="tier-block" style={{ borderLeftColor: scoreColor(avg) }}>
              <div className="tier-hd" onClick={() => toggle(`stage_${stage.id}`)}>
                <div className="tier-hd-left">
                  <span style={{ fontSize: "1.25rem" }}>{stage.icon}</span>
                  <div>
                    <div className="tier-label">{stage.label}</div>
                    <div className="tier-desc" style={{ color: scoreColor(avg) }}>Avg {Math.round(avg * 10) / 10}/10 — {scoreLabel(avg)}</div>
                  </div>
                </div>
                <span className="tier-tog">{isOpen ? "▲" : "▼"} {si.length}</span>
              </div>
              {isOpen && <div className="tier-body">{si.map((i) => card(i, scoreColor(avg)))}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  function renderScaleTab() {
    const cats = [
      { id: "strength", label: "💪🏼 Strength", range: "7–10", color: "#2ECC71" },
      { id: "improve",  label: "⚠️ Improve",   range: "4–6",  color: "#E67E22" },
      { id: "limited",  label: "🔥 Limited",    range: "1–3",  color: "#C0392B" },
    ];
    return (
      <div>
        <ScaleSummaries allItems={allItems} answers={answers} />
        {cats.map((cat) => {
          const ci = allItems.filter((i) => scoreCat(i.ans.score) === cat.id);
          if (!ci.length) return null;
          const isOpen = !!openSec[`cat_${cat.id}`];
          return (
            <div key={cat.id} className="tier-block" style={{ borderLeftColor: cat.color }}>
              <div className="tier-hd" onClick={() => toggle(`cat_${cat.id}`)}>
                <div className="tier-hd-left">
                  <div>
                    <div className="tier-label">{cat.label}</div>
                    <div className="tier-desc">Scores {cat.range}</div>
                  </div>
                </div>
                <span className="tier-tog">{isOpen ? "▲" : "▼"} {ci.length}</span>
              </div>
              {isOpen && <div className="tier-body">{ci.map((i) => card(i, cat.color))}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  function renderSetTab() {
    return (
      <div>
        {SETS.map((set) => {
          const si = allItems.filter((i) => i.set.id === set.id);
          if (!si.length) return null;
          const avg = si.reduce((a, i) => a + (i.ans.score ?? 0), 0) / si.length;
          const isOpen = !!openSec[`set_${set.id}`];
          return (
            <div key={set.id} className="tier-block" style={{ borderLeftColor: scoreColor(avg) }}>
              <div className="tier-hd" onClick={() => toggle(`set_${set.id}`)}>
                <div className="tier-hd-left">
                  <div>
                    <div className="tier-label">{set.label}</div>
                    <div className="tier-desc" style={{ color: scoreColor(avg) }}>Avg {Math.round(avg * 10) / 10}/10 — {scoreLabel(avg)}</div>
                  </div>
                </div>
                <span className="tier-tog">{isOpen ? "▲" : "▼"} {si.length}</span>
              </div>
              {isOpen && <div className="tier-body">{si.map((i) => card(i, scoreColor(avg)))}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  function renderAssessmentTab() {
    return (
      <div className="assessment-grid">
        <div className="ag-inner">
          <div className="ag-corner" />
          {STAGES.map((s) => (
            <div key={s.id} className="ag-stage-hd">
              <span className="ag-stage-icon">{s.icon}</span>
              <span className="ag-stage-name">{s.label}</span>
            </div>
          ))}
          {SETS.flatMap((set, sIdx) => [
            <div key={`lbl-${set.id}`} className="ag-set-name">{set.label}</div>,
            ...STAGES.map((stage, stIdx) => {
              const ans = answers[set.id]?.[stage.id];
              const hasAnswer = ans?.score != null;
              return (
                <div
                  key={`${set.id}-${stage.id}`}
                  className="ag-cell"
                  onClick={() => {
                    setPendingUpdate({ setIdx: sIdx, stageIdx: stIdx });
                    router.push("/assessment");
                  }}
                >
                  {hasAnswer ? (
                    <span className="ag-cell-score" style={{ color: scoreColor(ans.score) }}>
                      {ans.score}
                    </span>
                  ) : (
                    <span className="ag-cell-empty">—</span>
                  )}
                </div>
              );
            }),
          ])}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "tiers",      label: "Tiers" },
    { id: "stage",      label: "Stage" },
    { id: "scale",      label: "Scale" },
    { id: "set",        label: "Set" },
    { id: "assessment", label: assessmentTabLabel },
  ];

  return (
    <div className="dashboard">
      <p className="tv-eyebrow">Power Audit</p>
      <p className="tv-tagline">Power is your ability to clearly articulate your ideas, express yourself, take immediate action and continually move without delay.</p>
      <h2 className="tv-title">Current Power Snapshot</h2>
      <BirdsEyeGrid answers={answers} />
      {renderNextStep()}
      {renderProgressSections()}
      {renderContinueSection()}
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.id} className={"tab-btn" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tab === "tiers"      && renderTiersTab()}
        {tab === "stage"      && renderStageTab()}
        {tab === "scale"      && renderScaleTab()}
        {tab === "set"        && renderSetTab()}
        {tab === "assessment" && renderAssessmentTab()}
      </div>
    </div>
  );
}
