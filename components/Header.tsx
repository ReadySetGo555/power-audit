"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { exportCSV, parseCSV } from "@/lib/csv";

export function Header() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const { answers, excited, impactful, goalAnswers, somaticAnswers, importAll } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    exportCSV(answers, excited, impactful, goalAnswers, somaticAnswers);
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
        <div className="htag">Power Audit</div>
      </div>
    </div>
  );
}
