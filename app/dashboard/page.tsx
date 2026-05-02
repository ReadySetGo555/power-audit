"use client";

import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { useApp } from "@/context/AppContext";

export default function DashboardPage() {
  const { loading } = useApp();

  return (
    <div className="app">
      <Header />
      {loading ? (
        <div style={{ paddingTop: "3rem", textAlign: "center", color: "#4A4238", fontSize: ".85rem" }}>
          Loading your data…
        </div>
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
