"use client";

import { useEffect, useRef, useState } from "react";
import type { AllItem } from "@/lib/types";
import type { Answers } from "@/lib/types";
import { scoreCat } from "@/lib/helpers";

interface Props {
  allItems: AllItem[];
  answers: Answers;
}

interface SummaryState {
  text: string;
  loading: boolean;
  error: boolean;
}

const CATS = [
  { id: "limited",  label: "🔥 Limited",    range: "1–3", color: "#C0392B" },
  { id: "improve",  label: "⚠️ Improve",    range: "4–6", color: "#E67E22" },
  { id: "strength", label: "💪🏼 Strength", range: "7–10", color: "#2ECC71" },
];

function hashItems(items: Array<{ why?: string; makeTen?: string }>): string {
  return items.map((i) => `${i.why}|${i.makeTen}`).join("~");
}

export function ScaleSummaries({ allItems, answers }: Props) {
  const [summaries, setSummaries] = useState<Record<string, SummaryState>>({});
  const fetchedHashRef = useRef<Record<string, string>>({});

  useEffect(() => {
    for (const cat of CATS) {
      const catItems = allItems.filter((i) => scoreCat(i.ans.score) === cat.id);
      if (catItems.length === 0) continue;

      const payloadItems = catItems.map((i) => ({
        set: i.set.label,
        stage: i.stage.label,
        score: i.ans.score ?? 0,
        why: i.ans.why ?? "",
        makeTen: i.ans.makeTen ?? "",
      }));

      const hash = hashItems(payloadItems);
      if (fetchedHashRef.current[cat.id] === hash) continue;
      fetchedHashRef.current[cat.id] = hash;

      setSummaries((s) => ({ ...s, [cat.id]: { text: "", loading: true, error: false } }));

      fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat.label, items: payloadItems }),
      })
        .then((r) => r.json())
        .then(({ summary }: { summary: string }) => {
          setSummaries((s) => ({ ...s, [cat.id]: { text: summary, loading: false, error: false } }));
        })
        .catch(() => {
          setSummaries((s) => ({ ...s, [cat.id]: { text: "", loading: false, error: true } }));
        });
    }
  }, [allItems, answers]);

  const visibleCats = CATS.filter((c) => allItems.some((i) => scoreCat(i.ans.score) === c.id));
  if (visibleCats.length === 0) return null;

  return (
    <div className="scale-summaries">
      {visibleCats.map((cat) => {
        const catItems = allItems.filter((i) => scoreCat(i.ans.score) === cat.id);
        const state = summaries[cat.id];
        return (
          <div key={cat.id} className="scale-summary-block" style={{ borderLeftColor: cat.color }}>
            <div className="scale-summary-hd">
              <span className="scale-summary-label">{cat.label}</span>
              <span className="scale-summary-range">Scores {cat.range} · {catItems.length} item{catItems.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="scale-summary-body">
              {!state && <span className="scale-summary-placeholder">Generating summary…</span>}
              {state?.loading && <span className="scale-summary-placeholder">Generating summary…</span>}
              {state?.error && <span className="scale-summary-error">Could not generate summary. Add ANTHROPIC_API_KEY to your environment.</span>}
              {state?.text && <p className="scale-summary-text">{state.text}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
