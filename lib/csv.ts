import Papa from "papaparse";
import type { Answers, Selections, GoalAnswers, SomaticAnswers, SomaticDone } from "./types";

interface CsvRow {
  type: string;
  set_id: string;
  stage_id: string;
  score: string;
  why: string;
  make_ten: string;
  somatic: string;
  blocked: string;
  somatic_cleared: string;
  excited_stage_id: string;
  impactful_stage_id: string;
  prompt_id: string;
  answer: string;
}

export function exportCSV(
  answers: Answers,
  excited: Selections,
  impactful: Selections,
  goalAnswers: GoalAnswers,
  somaticAnswers: SomaticAnswers
): void {
  const rows: CsvRow[] = [];

  for (const setId of Object.keys(answers)) {
    for (const stageId of Object.keys(answers[setId])) {
      const a = answers[setId][stageId];
      rows.push({
        type: "assessment", set_id: setId, stage_id: stageId,
        score: a.score != null ? String(a.score) : "",
        why: a.why ?? "", make_ten: a.makeTen ?? "",
        somatic: String(a.somatic ?? false),
        blocked: String(a.blocked ?? false),
        somatic_cleared: String(a.somatic_cleared ?? false),
        excited_stage_id: "", impactful_stage_id: "", prompt_id: "", answer: "",
      });
    }
  }

  const allSetIds = new Set([...Object.keys(excited), ...Object.keys(impactful)]);
  for (const setId of allSetIds) {
    const e = excited[setId] ?? null;
    const i = impactful[setId] ?? null;
    if (e != null || i != null) {
      rows.push({
        type: "selection", set_id: setId, stage_id: "",
        score: "", why: "", make_ten: "", somatic: "", blocked: "", somatic_cleared: "",
        excited_stage_id: e ?? "", impactful_stage_id: i ?? "",
        prompt_id: "", answer: "",
      });
    }
  }

  for (const key of Object.keys(goalAnswers)) {
    const parts = key.split("-");
    rows.push({
      type: "goal", set_id: parts[0], stage_id: parts[1],
      score: "", why: "", make_ten: "", somatic: "", blocked: "", somatic_cleared: "",
      excited_stage_id: "", impactful_stage_id: "",
      prompt_id: parts.slice(2).join("-"), answer: goalAnswers[key],
    });
  }

  for (const key of Object.keys(somaticAnswers)) {
    const parts = key.split("-");
    rows.push({
      type: "somatic", set_id: parts[0], stage_id: parts[1],
      score: "", why: "", make_ten: "", somatic: "", blocked: "", somatic_cleared: "",
      excited_stage_id: "", impactful_stage_id: "",
      prompt_id: parts.slice(2).join("-"), answer: somaticAnswers[key],
    });
  }

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `power-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ParsedImport {
  answers: Answers;
  excited: Selections;
  impactful: Selections;
  goalAnswers: GoalAnswers;
  somaticAnswers: SomaticAnswers;
  somaticDone: SomaticDone;
}

export function parseCSV(file: File): Promise<ParsedImport> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const answers: Answers = {};
        const excited: Selections = {};
        const impactful: Selections = {};
        const goalAnswers: GoalAnswers = {};
        const somaticAnswers: SomaticAnswers = {};
        const somaticDone: SomaticDone = {};

        for (const row of results.data) {
          if (row.type === "assessment") {
            answers[row.set_id] ??= {};
            answers[row.set_id][row.stage_id] = {
              score: row.score !== "" ? Number(row.score) : null,
              why: row.why || undefined,
              makeTen: row.make_ten || undefined,
              somatic: row.somatic === "true",
              blocked: row.blocked === "true",
              somatic_cleared: row.somatic_cleared === "true",
            };
            if (row.somatic_cleared === "true") {
              somaticDone[`${row.set_id}-${row.stage_id}`] = true;
            }
          } else if (row.type === "selection") {
            excited[row.set_id] = row.excited_stage_id || null;
            impactful[row.set_id] = row.impactful_stage_id || null;
          } else if (row.type === "goal") {
            goalAnswers[`${row.set_id}-${row.stage_id}-${row.prompt_id}`] = row.answer;
          } else if (row.type === "somatic") {
            somaticAnswers[`${row.set_id}-${row.stage_id}-${row.prompt_id}`] = row.answer;
          }
        }

        resolve({ answers, excited, impactful, goalAnswers, somaticAnswers, somaticDone });
      },
      error: reject,
    });
  });
}
