"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SETS, STAGES } from "@/lib/data";
import { getAllItems } from "@/lib/helpers";
import { Header } from "@/components/Header";
import { SomaticScreen } from "@/components/SomaticScreen";
import { useApp } from "@/context/AppContext";

export default function SomaticPage({ params }: { params: Promise<{ setId: string; stageId: string }> }) {
  const { setId, stageId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromBlocks = searchParams.get("from") === "blocks";
  const { answers, excited, impactful, somaticDone, completeSomatic } = useApp();

  const allItems = getAllItems(answers, excited, impactful, somaticDone);
  const item = allItems.find((i) => i.set.id === setId && i.stage.id === stageId);

  function handleComplete(key: string, sId: string, stId: string) {
    if (fromBlocks) {
      // Return to blocks clearing without marking somatic as cleared
      router.push(`/blocks/${sId}/${stId}`);
    } else {
      completeSomatic(key, sId, stId);
      router.push("/dashboard");
    }
  }

  if (!item) {
    const set = SETS.find((s) => s.id === setId);
    const stage = STAGES.find((s) => s.id === stageId);
    if (!set || !stage) {
      return (
        <div className="app">
          <Header />
          <p style={{ color: "#5A5248", marginTop: "2rem" }}>Item not found. <button className="btn-ghost" onClick={() => router.push("/dashboard")}>Back to dashboard</button></p>
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
        <SomaticScreen
          item={stub}
          fromBlocks={fromBlocks}
          onComplete={() => handleComplete(stub.key, setId, stageId)}
          onBack={() => fromBlocks ? router.push(`/blocks/${setId}/${stageId}`) : router.push("/dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <SomaticScreen
        item={item}
        fromBlocks={fromBlocks}
        onComplete={() => handleComplete(item.key, setId, stageId)}
        onBack={() => fromBlocks ? router.push(`/blocks/${setId}/${stageId}`) : router.push("/dashboard")}
      />
    </div>
  );
}
