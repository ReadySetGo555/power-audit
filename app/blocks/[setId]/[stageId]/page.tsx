"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { SETS, STAGES } from "@/lib/data";
import { getAllItems } from "@/lib/helpers";
import { Header } from "@/components/Header";
import { BlocksScreen } from "@/components/BlocksScreen";
import { useApp } from "@/context/AppContext";

export default function BlocksPage({ params }: { params: Promise<{ setId: string; stageId: string }> }) {
  const { setId, stageId } = use(params);
  const router = useRouter();
  const { answers, excited, impactful, somaticDone } = useApp();

  const allItems = getAllItems(answers, excited, impactful, somaticDone);
  const item = allItems.find((i) => i.set.id === setId && i.stage.id === stageId);

  if (!item) {
    const set = SETS.find((s) => s.id === setId);
    const stage = STAGES.find((s) => s.id === stageId);
    if (!set || !stage) {
      return (
        <div className="app">
          <Header />
          <p style={{ color: "#5A5248", marginTop: "2rem" }}>
            Item not found.{" "}
            <button className="btn-ghost" onClick={() => router.push("/dashboard")}>Back to dashboard</button>
          </p>
        </div>
      );
    }
    const stub = {
      set, stage,
      ans: answers[setId]?.[stageId] ?? {},
      tier: null, isExcited: false, isImpact: false, hasSomatic: false, rawSomatic: false, somaticCleared: false,
      key: `${setId}-${stageId}`,
    };
    return (
      <div className="app">
        <Header />
        <BlocksScreen item={stub} onBack={() => router.push("/dashboard")} />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <BlocksScreen item={item} onBack={() => router.push("/dashboard")} />
    </div>
  );
}
