"use client";

import { useEffect, useState } from "react";

export type BuilderView = "form" | "flow";

interface ViewToggleProps {
  value: BuilderView;
  onChange: (view: BuilderView) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center p-0.5 gap-0.5 rounded-xl bg-slate-900 shadow-lg">
      <button
        onClick={() => onChange("form")}
        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all"
        style={{
          fontFamily: "var(--font-geist-mono)",
          background: value === "form" ? "#ffffff" : "transparent",
          color: value === "form" ? "#0f172a" : "#64748b",
        }}
      >
        <span className="material-symbols-outlined text-[15px]">view_list</span>
        Form
      </button>
      <button
        onClick={() => onChange("flow")}
        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all relative"
        style={{
          fontFamily: "var(--font-geist-mono)",
          background: value === "flow" ? "rgba(249,115,22,0.9)" : "transparent",
          color: value === "flow" ? "#ffffff" : "#64748b",
        }}
      >
        <span className="material-symbols-outlined text-[15px]">timeline</span>
        Canvas
        {value !== "flow" && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        )}
      </button>
    </div>
  );
}

export function useBuilderView(): [BuilderView, (v: BuilderView) => void] {
  const [view, setView] = useState<BuilderView>("form");

  useEffect(() => {
    const stored = localStorage.getItem("builder-view");
    if (stored === "form" || stored === "flow") {
      setView(stored);
    }
  }, []);

  const setAndPersist = (v: BuilderView) => {
    setView(v);
    localStorage.setItem("builder-view", v);
  };

  return [view, setAndPersist];
}