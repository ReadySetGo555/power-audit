import type { Answers, Selections, GoalAnswers, SomaticAnswers, SomaticDone } from "./types";
import { SETS, STAGES, GOAL_PROMPTS, SOMATIC_PROMPTS, TIER_META } from "./data";
import { getAllItems } from "./helpers";

type DocWithTable = { lastAutoTable: { finalY: number } };

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [0, 0, 0];
}

export async function generatePDF(
  answers: Answers,
  excited: Selections,
  impactful: Selections,
  goalAnswers: GoalAnswers,
  somaticAnswers: SomaticAnswers,
  somaticDone: SomaticDone,
) {
  const { default: jsPDF } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 20;

  const allItems = getAllItems(answers, excited, impactful, somaticDone);

  function checkPageBreak(needed = 30) {
    if (y + needed > pageH - 20) {
      doc.addPage();
      y = 20;
    }
  }

  function sectionHeader(title: string) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(title, margin, y);
    y += 8;
  }

  // ─── Title ────────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Power Audit Report", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    margin, y,
  );
  doc.setTextColor(0);
  y += 12;

  // ─── Assessment Grid ──────────────────────────────────────────────────────
  sectionHeader("Assessment Scores");

  autoTable(doc, {
    startY: y,
    head: [["Set", ...STAGES.map(s => s.label)]],
    body: SETS.map(set => [
      set.label,
      ...STAGES.map(stage => {
        const score = answers[set.id]?.[stage.id]?.score;
        if (!score) return "—";
        const cat = score <= 3 ? "Limited" : score <= 6 ? "Improve" : "Strength";
        return `${score}  ${cat}`;
      }),
    ]),
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: [124, 92, 191] as [number, number, number], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 42 } },
    theme: "striped",
  });
  y = (doc as unknown as DocWithTable).lastAutoTable.finalY + 10;

  // ─── Tier Breakdown ───────────────────────────────────────────────────────
  const tieredItems = allItems.filter(i => i.tier !== null);
  if (tieredItems.length > 0) {
    sectionHeader("Tier Breakdown");

    for (const tier of [1, 2, 3, 4] as const) {
      const items = tieredItems.filter(i => i.tier === tier);
      if (items.length === 0) continue;
      const meta = TIER_META[tier];

      checkPageBreak(20 + items.length * 8);
      autoTable(doc, {
        startY: y,
        head: [[meta.label, "Stage", "Score", "Level", "Selected As", "Somatic"]],
        body: items.map(item => {
          const score = item.ans.score;
          const cat = !score ? "—" : score <= 3 ? "Limited" : score <= 6 ? "Improve" : "Strength";
          const selected = [item.isExcited ? "Excited" : null, item.isImpact ? "Impactful" : null].filter(Boolean).join(", ");
          return [item.set.label, item.stage.label, score != null ? String(score) : "—", cat, selected, item.hasSomatic ? "Yes" : ""];
        }),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: hexToRgb(meta.color), textColor: 255 },
        columnStyles: { 0: { cellWidth: 45 }, 2: { cellWidth: 14, halign: "center" }, 5: { cellWidth: 16, halign: "center" } },
        theme: "striped",
      });
      y = (doc as unknown as DocWithTable).lastAutoTable.finalY + 7;
    }
    y += 3;
  }

  // ─── Goals ────────────────────────────────────────────────────────────────
  const goalItems = allItems.filter(item =>
    GOAL_PROMPTS.some(p => goalAnswers[`${item.set.id}-${item.stage.id}-${p.id}`])
  );
  if (goalItems.length > 0) {
    sectionHeader("Goal Plans");

    for (const item of goalItems) {
      const rows = GOAL_PROMPTS
        .map(p => [p.label, goalAnswers[`${item.set.id}-${item.stage.id}-${p.id}`] ?? ""] as [string, string])
        .filter(([, answer]) => answer);
      if (rows.length === 0) continue;

      checkPageBreak(20 + rows.length * 10);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${item.set.label} — ${item.stage.label}`, margin, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        body: rows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 35, fillColor: [248, 246, 255] as [number, number, number] } },
        theme: "plain",
      });
      y = (doc as unknown as DocWithTable).lastAutoTable.finalY + 8;
    }
  }

  // ─── Somatic Processes ────────────────────────────────────────────────────
  const somaticItems = allItems.filter(item =>
    item.rawSomatic &&
    SOMATIC_PROMPTS.some(p => somaticAnswers[`${item.set.id}-${item.stage.id}-${p.id}`])
  );
  if (somaticItems.length > 0) {
    sectionHeader("Somatic Processes");

    for (const item of somaticItems) {
      const rows = SOMATIC_PROMPTS
        .map(p => [p.label, somaticAnswers[`${item.set.id}-${item.stage.id}-${p.id}`] ?? ""] as [string, string])
        .filter(([, answer]) => answer);
      if (rows.length === 0) continue;

      checkPageBreak(20 + rows.length * 10);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const cleared = item.somaticCleared ? " (Cleared)" : "";
      doc.text(`${item.set.label} — ${item.stage.label}${cleared}`, margin, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        body: rows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 35, fillColor: [245, 240, 255] as [number, number, number] } },
        theme: "plain",
      });
      y = (doc as unknown as DocWithTable).lastAutoTable.finalY + 8;
    }
  }

  // ─── Page numbers ─────────────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${i} / ${total}`, pageW - margin, pageH - 8, { align: "right" });
  }

  doc.save(`power-audit-report-${new Date().toISOString().split("T")[0]}.pdf`);
}
