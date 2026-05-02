"use client";

import { useRouter } from "next/navigation";
import { STAGES } from "@/lib/data";
import { Header } from "@/components/Header";
import { useApp } from "@/context/AppContext";

export default function IntroPage() {
  const router = useRouter();
  const { resetAll } = useApp();

  function begin() {
    resetAll();
    router.push("/assessment");
  }

  return (
    <div className="app">
      <Header />
      <div className="intro">
        <p className="i-ey">Attention Alignment Process</p>
        <div className="i-badge">Power Audit</div>
        <h1 className="i-title">How <em>connected</em> are you to your creative power?</h1>
        <p className="i-conn">Power is your ability to clearly articulate your ideas, express yourself, take immediate action and continually move without delay.</p>
        <p className="i-body">You will move through four separate sets of questions that apply to each of the six stages of the creation cycle, for a total of 24 questions. At the end of each set, you&apos;ll choose one topic to focus on. This will be the basis of establishing ONE SMART goal to accomplish, placing the others in a queue.</p>
        <div className="cbox">
          <p className="cbox-lbl">The Creation Cycle</p>
          <div className="cbox-stages">
            {STAGES.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div className="cstage">
                  <span className="cstage-icon">{s.icon}</span>
                  <span className="cstage-name">{s.label}</span>
                </div>
                {i < STAGES.length - 1 && <span className="carr">›</span>}
              </div>
            ))}
          </div>
        </div>
        <button className="btn-begin" onClick={begin}>Begin the Power Audit</button>
        <p className="i-note">24 questions · 4 sets · about 16 minutes</p>
      </div>
    </div>
  );
}
