"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AllItem } from "@/lib/types";
import { SETS, STAGES, TIER_META, COLOR, GOAL_PROMPTS } from "@/lib/data";
import { scoreColor, scoreLabel, scoreCat } from "@/lib/helpers";
import { useApp } from "@/context/AppContext";
import { TierItemCard } from "./TierItemCard";
import { BirdsEyeGrid } from "./BirdsEyeGrid";

export function Dashboard() {
  const router = useRouter();
  const { allItems, answers, excited, impactful, goalAnswers, somaticAnswers, blockAnswers, toggleBadge, setPendingUpdate, completeBlock } = useApp();
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

  // All items where somatic or blocked was ticked in the assessment
  const allSomaticFlagged = allItems.filter((item) => !!item.ans.somatic);
  // "Cleared" = somatic_cleared flag set OR block_cleared flag set
  const somaticFlaggedCleared = allSomaticFlagged.filter((i) => !!(i.ans.somatic_cleared || i.somaticCleared)).length;

  const goalCompleted = goalItems.filter((item) =>
    GOAL_PROMPTS.every((p) => (goalAnswers[`${item.set.id}-${item.stage.id}-${p.id}`] ?? "").trim().length > 0)
  ).length;
  const somaticCompleted = somaticItems.filter((i) => i.somaticCleared || !!i.ans.somatic_cleared).length;
  const blockedCleared = blockedItems.filter((i) => !!i.ans.block_cleared).length;

  const totalAnswered = SETS.reduce(
    (acc, set) => acc + STAGES.filter((stage) => answers[set.id]?.[stage.id]?.score != null).length,
    0
  );

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
        {allSomaticFlagged.length > 0 && progSection("somatic", "🎭 Somatic Processes", allSomaticFlagged, `${somaticFlaggedCleared}/${allSomaticFlagged.length} cleared`, TIER_META[4].color, "No somatic processes started.")}
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

  function renderTiersSection() {
    function tierCard(item: AllItem, color: string) {
      return (
        <TierItemCard
          key={item.key}
          item={item}
          tierColor={color}
          onGoal={handleGoal}
          onSomatic={handleSomatic}
          onBlock={handleBlock}
          onUpdate={(i) => {
            setPendingUpdate({
              setIdx: SETS.findIndex((s) => s.id === i.set.id),
              stageIdx: STAGES.findIndex((s) => s.id === i.stage.id),
              phase: "questions",
            });
            router.push("/assessment");
          }}
          goalAnswers={goalAnswers}
          somaticAnswers={somaticAnswers}
          blockAnswers={blockAnswers}
        />
      );
    }

    return (
      <div>
        {([1, 2, 3] as const).map((t) => {
          const tm = TIER_META[t];
          const isOpen = !!openSec[`tier${t}`];
          const count = grouped[t]?.length ?? 0;
          const isEmpty = count === 0;
          return (
            <div key={t} className="tier-block" style={{ borderLeftColor: isEmpty ? "#2A2218" : tm.color }}>
              <div className="tier-hd" onClick={() => !isEmpty && toggle(`tier${t}`)}>
                <div className="tier-hd-left">
                  <span className="tier-num" style={{ background: isEmpty ? "#2A2218" : tm.color }}>{isEmpty ? "—" : count}</span>
                  <div>
                    <div className="tier-label" style={{ color: isEmpty ? "#3A3228" : undefined }}>{tm.label}</div>
                    <div className="tier-desc">{tm.desc}</div>
                  </div>
                </div>
                {!isEmpty && <span className="tier-tog">{isOpen ? "▲" : "▼"}</span>}
              </div>
              {isOpen && !isEmpty && <div className="tier-body">{grouped[t].map((i) => tierCard(i, tm.color))}</div>}
            </div>
          );
        })}

        {/* Update Assessment — styled identically to a tier dropdown */}
        <div
          className="tier-block"
          style={{ borderLeftColor: "#3A3228", cursor: "pointer" }}
          onClick={() => router.push("/assessment")}
        >
          <div className="tier-hd">
            <div className="tier-hd-left">
              <span className="tier-num" style={{ background: "#3A3228" }}>✏️</span>
              <div>
                <div className="tier-label" style={{ color: "#7A6E62" }}>Update Assessment</div>
                <div className="tier-desc">Revisit any question to change your score, why, or somatic flags</div>
              </div>
            </div>
            <span className="tier-tog">→</span>
          </div>
        </div>
      </div>
    );
  }

  function renderScaleSection() {
    const cats = [
      { id: "strength", label: "💪🏼 Strengths",    color: "#2ECC71" },
      { id: "improve",  label: "⚠️ Improvements",  color: "#E67E22" },
      { id: "limited",  label: "🔥 Limitations",   color: "#C0392B" },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
        {cats.map((cat) => {
          const ci = [...allItems
            .filter((i) => scoreCat(i.ans.score) === cat.id && (i.ans.why ?? "").trim().length > 0)]
            .sort((a, b) => {
              const scoreDiff = (b.ans.score ?? 0) - (a.ans.score ?? 0);
              if (scoreDiff !== 0) return scoreDiff;
              return STAGES.findIndex((s) => s.id === a.stage.id) - STAGES.findIndex((s) => s.id === b.stage.id);
            });
          if (!ci.length) return null;
          const isOpen = !!openSec[`scale_${cat.id}`];
          return (
            <div key={cat.id} style={{
              border: `1px solid ${cat.color}`,
              borderRadius: ".875rem",
              background: "#121008",
              overflow: "hidden",
            }}>
              <div
                onClick={() => toggle(`scale_${cat.id}`)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: ".85rem",
                  color: cat.color,
                  letterSpacing: ".05em",
                  fontWeight: 600,
                }}>
                  {cat.label}
                </span>
                <span style={{ fontSize: ".75rem", color: cat.color }}>
                  {ci.length} {isOpen ? "▲" : "▼"}
                </span>
              </div>
              {isOpen && (
                <div style={{
                  padding: ".875rem 1.25rem 1rem",
                  borderTop: `1px solid ${cat.color}33`,
                  display: "flex",
                  flexDirection: "column",
                  gap: ".875rem",
                }}>
                  {ci.map((item) => (
                    <div key={item.key} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                      <div style={{
                        fontFamily: "var(--font-cormorant)",
                        fontSize: "2rem",
                        lineHeight: 1,
                        color: cat.color,
                        minWidth: "2.5rem",
                        textAlign: "center",
                        flexShrink: 0,
                      }}>
                        {item.ans.score}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-syne)", fontSize: ".75rem", color: "#8A7E72", marginBottom: ".25rem" }}>
                          {item.set.label} / {item.stage.label}
                        </div>
                        <div style={{ fontStyle: "italic", color: "#5A5248", fontSize: ".8rem", lineHeight: 1.5 }}>
                          {item.ans.why}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2 className="tv-title" style={{ color: COLOR, marginBottom: ".5rem" }}>Power Audit</h2>
      <p className="tv-tagline" style={{ fontStyle: "normal" }}>Power is your ability to clearly articulate your ideas, express yourself, take immediate action and continually move without delay.</p>
      <h2 className="tv-title">Current Power Snapshot</h2>
      <BirdsEyeGrid answers={answers} />
      {renderContinueSection()}
      {renderNextStep()}
      {renderProgressSections()}
      <hr style={{ borderColor: "#1C1814", borderTop: "1px solid", margin: "1.5rem 0" }} />
      {renderTiersSection()}
      <hr style={{ borderColor: "#1C1814", borderTop: "1px solid", margin: "1.5rem 0" }} />
      {renderScaleSection()}
    </div>
  );
}
