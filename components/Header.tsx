"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { exportCSV, parseCSV } from "@/lib/csv";
import { generatePDF } from "@/lib/pdf";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === "/dashboard";
  const isAssessment = pathname === "/assessment";
  const { answers, excited, impactful, goalAnswers, somaticAnswers, somaticDone, importAll } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  function handleExport() {
    exportCSV(answers, excited, impactful, goalAnswers, somaticAnswers);
  }

  async function handleReport() {
    setGeneratingPDF(true);
    try {
      await generatePDF(answers, excited, impactful, goalAnswers, somaticAnswers, somaticDone);
    } finally {
      setGeneratingPDF(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const ok = window.confirm("Replace all current data with the contents of this file?");
    if (!ok) return;
    try {
      const data = await parseCSV(file);
      await importAll(data);
    } catch {
      alert("Could not parse the file. Make sure it's a Power Audit CSV.");
    }
  }

  return (
    <div className="hdr">
      <div className="wm">Attention Alignment</div>
      <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
        {isDashboard && (
          <>
            <button
              className="btn-ghost"
              style={{ fontSize: ".78rem", padding: ".4rem 1rem" }}
              onClick={handleReport}
              disabled={generatingPDF}
            >
              {generatingPDF ? "Generating…" : "Report"}
            </button>
            <button
              className="btn-ghost"
              style={{ fontSize: ".78rem", padding: ".4rem 1rem" }}
              onClick={handleExport}
            >
              Export
            </button>
            <button
              className="btn-ghost"
              style={{ fontSize: ".78rem", padding: ".4rem 1rem" }}
              onClick={() => fileRef.current?.click()}
            >
              Import
            </button>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFileChange} />
          </>
        )}
        {isAssessment && (
          <button
            className="btn-ghost"
            style={{ fontSize: ".78rem", padding: ".4rem 1rem" }}
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>
        )}
        <div className="htag">Power Audit</div>
      </div>
    </div>
  );
}
