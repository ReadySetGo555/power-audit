"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { supabase, DEFAULT_USER_ID } from "@/lib/supabase";
import type { Answers, Selections, GoalAnswers, SomaticAnswers, SomaticDone, BlockAnswers, AllItem } from "@/lib/types";
import type { ParsedImport } from "@/lib/csv";
import { SETS, STAGES } from "@/lib/data";
import { getAllItems } from "@/lib/helpers";

// ─── types ────────────────────────────────────────────────────────────────────

interface PendingUpdate { setIdx: number; stageIdx: number; phase?: "questions" | "excited" | "impact"; }

interface AppContextValue {
  answers: Answers;
  excited: Selections;
  impactful: Selections;
  goalAnswers: GoalAnswers;
  somaticAnswers: SomaticAnswers;
  somaticDone: SomaticDone;
  blockAnswers: BlockAnswers;
  allItems: AllItem[];
  loading: boolean;
  pendingUpdate: PendingUpdate | null;
  setAnswer: (setId: string, stageId: string, field: string, value: unknown) => void;
  setExcitedStage: (setId: string, stageId: string | null) => void;
  setImpactfulStage: (setId: string, stageId: string | null) => void;
  setGoalAnswer: (key: string, value: string) => void;
  setSomaticAnswer: (key: string, value: string) => void;
  setBlockAnswer: (key: string, value: string) => void;
  completeSomatic: (itemKey: string, setId: string, stageId: string) => void;
  completeBlock: (setId: string, stageId: string) => void;
  scheduleBlockAction: (setId: string, stageId: string) => void;
  toggleBadge: (setId: string, stageId: string, type: "excited" | "impact") => void;
  setPendingUpdate: (u: PendingUpdate | null) => void;
  resetAll: () => void;
  importAll: (data: ParsedImport) => Promise<void>;
}

// ─── context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ─── helpers ──────────────────────────────────────────────────────────────────

function db(table: string) {
  return supabase.from(table);
}

function logErr(label: string, error: unknown) {
  if (error) console.error(`[supabase] ${label}:`, error);
}

// ─── provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers]           = useState<Answers>({});
  const [excited, setExcited]           = useState<Selections>({});
  const [impactful, setImpactful]       = useState<Selections>({});
  const [goalAnswers, setGoalAnswers]   = useState<GoalAnswers>({});
  const [somaticAnswers, setSomaticAnswers] = useState<SomaticAnswers>({});
  const [somaticDone, setSomaticDone]   = useState<SomaticDone>({});
  const [blockAnswers, setBlockAnswers] = useState<BlockAnswers>({});
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null);
  const [loading, setLoading]           = useState(true);
  const loadedRef                        = useRef(false);

  // ── initial fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [aRes, sRes, gRes, somRes, blkRes] = await Promise.all([
          db("assessment_answers").select("*").eq("user_id", DEFAULT_USER_ID),
          db("set_selections").select("*").eq("user_id", DEFAULT_USER_ID),
          db("goal_answers").select("*").eq("user_id", DEFAULT_USER_ID),
          db("somatic_answers").select("*").eq("user_id", DEFAULT_USER_ID),
          db("block_answers").select("*").eq("user_id", DEFAULT_USER_ID),
        ]);

        // assessment_answers → answers + somaticDone
        const newAnswers: Answers = {};
        const newSomaticDone: SomaticDone = {};
        for (const r of (aRes.data ?? []) as Record<string, unknown>[]) {
          const sid = r.set_id as string;
          const stid = r.stage_id as string;
          newAnswers[sid] ??= {};
          newAnswers[sid][stid] = {
            score: r.score as number | null,
            why: r.why as string | undefined,
            makeTen: r.make_ten as string | undefined,
            somatic: r.somatic as boolean,
            blocked: r.blocked as boolean,
            somatic_cleared: r.somatic_cleared as boolean,
            block_cleared: r.block_cleared as boolean | undefined,
            action_scheduled: r.action_scheduled as boolean | undefined,
            action_confirmed: r.action_confirmed as boolean | undefined,
          };
          if (r.somatic_cleared) newSomaticDone[`${sid}-${stid}`] = true;
        }

        // set_selections → excited + impactful
        const newExcited: Selections = {};
        const newImpactful: Selections = {};
        for (const r of (sRes.data ?? []) as Record<string, unknown>[]) {
          newExcited[r.set_id as string] = r.excited_stage_id as string | null;
          newImpactful[r.set_id as string] = r.impactful_stage_id as string | null;
        }

        // goal_answers
        const newGoalAnswers: GoalAnswers = {};
        for (const r of (gRes.data ?? []) as Record<string, unknown>[]) {
          newGoalAnswers[`${r.set_id}-${r.stage_id}-${r.prompt_id}`] = (r.answer as string) ?? "";
        }

        // somatic_answers
        const newSomaticAnswers: SomaticAnswers = {};
        for (const r of (somRes.data ?? []) as Record<string, unknown>[]) {
          newSomaticAnswers[`${r.set_id}-${r.stage_id}-${r.prompt_id}`] = (r.answer as string) ?? "";
        }

        // block_answers
        const newBlockAnswers: BlockAnswers = {};
        for (const r of (blkRes.data ?? []) as Record<string, unknown>[]) {
          newBlockAnswers[`${r.set_id}-${r.stage_id}-${r.prompt_id}`] = (r.answer as string) ?? "";
        }

        setAnswers(newAnswers);
        setExcited(newExcited);
        setImpactful(newImpactful);
        setGoalAnswers(newGoalAnswers);
        setSomaticAnswers(newSomaticAnswers);
        setSomaticDone(newSomaticDone);
        setBlockAnswers(newBlockAnswers);
      } catch (err) {
        console.error("[supabase] initial fetch failed:", err);
      } finally {
        loadedRef.current = true;
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const allItems = getAllItems(answers, excited, impactful, somaticDone);

  // ── mutations ─────────────────────────────────────────────────────────────────

  // Putting the upsert inside the functional updater is intentional: it gives us
  // the latest merged answer without a stale-closure race. React Strict Mode may
  // call updaters twice in dev (harmless — upserts are idempotent).
  const setAnswer = useCallback((setId: string, stageId: string, field: string, value: unknown) => {
    setAnswers((a) => {
      const cur = a[setId]?.[stageId] ?? {};
      const next = { ...cur, [field]: value };
      if (loadedRef.current) db("assessment_answers").upsert({
        user_id: DEFAULT_USER_ID, set_id: setId, stage_id: stageId,
        score: (next.score as number) ?? null,
        why: (next.why as string) ?? null,
        make_ten: (next.makeTen as string) ?? null,
        somatic: (next.somatic as boolean) ?? false,
        blocked: (next.blocked as boolean) ?? false,
        somatic_cleared: (next.somatic_cleared as boolean) ?? false,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,set_id,stage_id" })
        .then(({ error }) => logErr("assessment_answers upsert", error));
      return { ...a, [setId]: { ...(a[setId] ?? {}), [stageId]: next } };
    });
  }, []);

  const setExcitedStage = useCallback((setId: string, stageId: string | null) => {
    setExcited((e) => {
      if (loadedRef.current) db("set_selections").upsert({
        user_id: DEFAULT_USER_ID, set_id: setId,
        excited_stage_id: stageId,
        impactful_stage_id: impactful[setId] ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,set_id" })
        .then(({ error }) => logErr("set_selections upsert (excited)", error));
      return { ...e, [setId]: stageId };
    });
  }, [impactful]);

  const setImpactfulStage = useCallback((setId: string, stageId: string | null) => {
    setImpactful((e) => {
      if (loadedRef.current) db("set_selections").upsert({
        user_id: DEFAULT_USER_ID, set_id: setId,
        excited_stage_id: excited[setId] ?? null,
        impactful_stage_id: stageId,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,set_id" })
        .then(({ error }) => logErr("set_selections upsert (impactful)", error));
      return { ...e, [setId]: stageId };
    });
  }, [excited]);

  const setGoalAnswer = useCallback((key: string, value: string) => {
    setGoalAnswers((a) => {
      const parts = key.split("-");
      const [setId, stageId, ...rest] = parts;
      const promptId = rest.join("-");
      if (loadedRef.current) db("goal_answers").upsert({
        user_id: DEFAULT_USER_ID, set_id: setId, stage_id: stageId, prompt_id: promptId,
        answer: value,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,set_id,stage_id,prompt_id" })
        .then(({ error }) => logErr("goal_answers upsert", error));
      return { ...a, [key]: value };
    });
  }, []);

  const setSomaticAnswer = useCallback((key: string, value: string) => {
    setSomaticAnswers((a) => {
      const parts = key.split("-");
      const [setId, stageId, ...rest] = parts;
      const promptId = rest.join("-");
      if (loadedRef.current) db("somatic_answers").upsert({
        user_id: DEFAULT_USER_ID, set_id: setId, stage_id: stageId, prompt_id: promptId,
        answer: value,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,set_id,stage_id,prompt_id" })
        .then(({ error }) => logErr("somatic_answers upsert", error));
      return { ...a, [key]: value };
    });
  }, []);

  const setBlockAnswer = useCallback((key: string, value: string) => {
    setBlockAnswers((a) => {
      const parts = key.split("-");
      const [setId, stageId, ...rest] = parts;
      const promptId = rest.join("-");
      if (loadedRef.current) db("block_answers").upsert({
        user_id: DEFAULT_USER_ID, set_id: setId, stage_id: stageId, prompt_id: promptId,
        answer: value,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,set_id,stage_id,prompt_id" })
        .then(({ error }) => logErr("block_answers upsert", error));
      return { ...a, [key]: value };
    });
  }, []);

  const completeBlock = useCallback((setId: string, stageId: string) => {
    setAnswers((a) => {
      const cur = a[setId]?.[stageId] ?? {};
      const next = { ...cur, block_cleared: true };
      if (loadedRef.current) db("assessment_answers").upsert({
        user_id: DEFAULT_USER_ID, set_id: setId, stage_id: stageId,
        score: (cur.score as number) ?? null,
        why: (cur.why as string) ?? null,
        make_ten: (cur.makeTen as string) ?? null,
        somatic: cur.somatic ?? false,
        blocked: cur.blocked ?? false,
        somatic_cleared: cur.somatic_cleared ?? false,
        block_cleared: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,set_id,stage_id" })
        .then(({ error }) => logErr("completeBlock upsert", error));
      return { ...a, [setId]: { ...(a[setId] ?? {}), [stageId]: next } };
    });
  }, []);

  const scheduleBlockAction = useCallback((setId: string, stageId: string) => {
    setAnswers((a) => {
      const cur = a[setId]?.[stageId] ?? {};
      const next = { ...cur, action_scheduled: true };
      if (loadedRef.current) db("assessment_answers").upsert({
        user_id: DEFAULT_USER_ID, set_id: setId, stage_id: stageId,
        score: (cur.score as number) ?? null,
        why: (cur.why as string) ?? null,
        make_ten: (cur.makeTen as string) ?? null,
        somatic: cur.somatic ?? false,
        blocked: cur.blocked ?? false,
        somatic_cleared: cur.somatic_cleared ?? false,
        block_cleared: cur.block_cleared ?? false,
        action_scheduled: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,set_id,stage_id" })
        .then(({ error }) => logErr("scheduleBlockAction upsert", error));
      return { ...a, [setId]: { ...(a[setId] ?? {}), [stageId]: next } };
    });
  }, []);

  const completeSomatic = useCallback((itemKey: string, setId: string, stageId: string) => {
    setSomaticDone((d) => ({ ...d, [itemKey]: true }));
    setAnswers((a) => {
      const cur = a[setId]?.[stageId] ?? {};
      const next = { ...cur, somatic: false, blocked: false, somatic_cleared: true };
      if (loadedRef.current) db("assessment_answers").upsert({
        user_id: DEFAULT_USER_ID, set_id: setId, stage_id: stageId,
        score: (next.score as number) ?? null,
        why: (next.why as string) ?? null,
        make_ten: (next.makeTen as string) ?? null,
        somatic: false, blocked: false, somatic_cleared: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,set_id,stage_id" })
        .then(({ error }) => logErr("completeSomatic upsert", error));
      return { ...a, [setId]: { ...(a[setId] ?? {}), [stageId]: next } };
    });
  }, []);

  const toggleBadge = useCallback((setId: string, stageId: string, type: "excited" | "impact") => {
    if (type === "excited") {
      setExcited((e) => {
        const next = e[setId] === stageId ? null : stageId;
        if (loadedRef.current) db("set_selections").upsert({
          user_id: DEFAULT_USER_ID, set_id: setId,
          excited_stage_id: next,
          impactful_stage_id: impactful[setId] ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,set_id" })
          .then(({ error }) => logErr("set_selections upsert (badge excited)", error));
        return { ...e, [setId]: next };
      });
    } else {
      setImpactful((e) => {
        const next = e[setId] === stageId ? null : stageId;
        if (loadedRef.current) db("set_selections").upsert({
          user_id: DEFAULT_USER_ID, set_id: setId,
          excited_stage_id: excited[setId] ?? null,
          impactful_stage_id: next,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,set_id" })
          .then(({ error }) => logErr("set_selections upsert (badge impact)", error));
        return { ...e, [setId]: next };
      });
    }
  }, [excited, impactful]);

  const importAll = useCallback(async (data: ParsedImport) => {
    await Promise.all([
      db("assessment_answers").delete().eq("user_id", DEFAULT_USER_ID),
      db("set_selections").delete().eq("user_id", DEFAULT_USER_ID),
      db("goal_answers").delete().eq("user_id", DEFAULT_USER_ID),
      db("somatic_answers").delete().eq("user_id", DEFAULT_USER_ID),
    ]);

    const ts = new Date().toISOString();

    const assessmentRows = Object.entries(data.answers).flatMap(([setId, stages]) =>
      Object.entries(stages).map(([stageId, a]) => ({
        user_id: DEFAULT_USER_ID, set_id: setId, stage_id: stageId,
        score: a.score ?? null, why: a.why ?? null, make_ten: a.makeTen ?? null,
        somatic: a.somatic ?? false, blocked: a.blocked ?? false,
        somatic_cleared: a.somatic_cleared ?? false, updated_at: ts,
      }))
    );
    if (assessmentRows.length > 0)
      await db("assessment_answers").upsert(assessmentRows, { onConflict: "user_id,set_id,stage_id" });

    const allSetIds = new Set([...Object.keys(data.excited), ...Object.keys(data.impactful)]);
    const selectionRows = [...allSetIds].map((setId) => ({
      user_id: DEFAULT_USER_ID, set_id: setId,
      excited_stage_id: data.excited[setId] ?? null,
      impactful_stage_id: data.impactful[setId] ?? null,
      updated_at: ts,
    }));
    if (selectionRows.length > 0)
      await db("set_selections").upsert(selectionRows, { onConflict: "user_id,set_id" });

    const goalRows = Object.entries(data.goalAnswers).map(([key, answer]) => {
      const parts = key.split("-");
      return { user_id: DEFAULT_USER_ID, set_id: parts[0], stage_id: parts[1], prompt_id: parts.slice(2).join("-"), answer, updated_at: ts };
    });
    if (goalRows.length > 0)
      await db("goal_answers").upsert(goalRows, { onConflict: "user_id,set_id,stage_id,prompt_id" });

    const somaticRows = Object.entries(data.somaticAnswers).map(([key, answer]) => {
      const parts = key.split("-");
      return { user_id: DEFAULT_USER_ID, set_id: parts[0], stage_id: parts[1], prompt_id: parts.slice(2).join("-"), answer, updated_at: ts };
    });
    if (somaticRows.length > 0)
      await db("somatic_answers").upsert(somaticRows, { onConflict: "user_id,set_id,stage_id,prompt_id" });

    setAnswers(data.answers);
    setExcited(data.excited);
    setImpactful(data.impactful);
    setGoalAnswers(data.goalAnswers);
    setSomaticAnswers(data.somaticAnswers);
    setSomaticDone(data.somaticDone);
    setPendingUpdate(null);
  }, []);

  const resetAll = useCallback(() => {
    setAnswers({});
    setExcited({});
    setImpactful({});
    setGoalAnswers({});
    setSomaticAnswers({});
    setSomaticDone({});
    setPendingUpdate(null);
    // fire-and-forget deletes
    Promise.all([
      db("assessment_answers").delete().eq("user_id", DEFAULT_USER_ID),
      db("set_selections").delete().eq("user_id", DEFAULT_USER_ID),
      db("goal_answers").delete().eq("user_id", DEFAULT_USER_ID),
      db("somatic_answers").delete().eq("user_id", DEFAULT_USER_ID),
    ]).then((results) => {
      results.forEach(({ error }) => logErr("resetAll delete", error));
    });
  }, []);

  return (
    <AppContext.Provider value={{
      answers, excited, impactful, goalAnswers, somaticAnswers, somaticDone, blockAnswers, allItems,
      loading, pendingUpdate, setPendingUpdate,
      setAnswer, setExcitedStage, setImpactfulStage, setGoalAnswer, setSomaticAnswer, setBlockAnswer,
      completeSomatic, completeBlock, scheduleBlockAction, toggleBadge, resetAll, importAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
