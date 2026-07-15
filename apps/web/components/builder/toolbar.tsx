"use client";

import type { BuilderView } from "./view-toggle";

interface BuilderToolbarProps {
  view?: BuilderView;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onPreview?: () => void;
}

/**
 * Vertical icon toolbar on the far left of the builder.
 * Shows contextual actions based on the current view.
 */
export function BuilderToolbar({
  view = "form",
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onPreview,
}: BuilderToolbarProps) {
  return (
    <aside className="w-12 h-full flex flex-col items-center py-4 gap-1 border-r z-30 bg-background border-border">
      {/* Undo */}
      <ToolbarIconButton
        icon="undo"
        label="Undo (⌘Z)"
        onClick={onUndo}
        disabled={!canUndo}
      />
      {/* Redo */}
      <ToolbarIconButton
        icon="redo"
        label="Redo (⌘⇧Z)"
        onClick={onRedo}
        disabled={!canRedo}
      />

      <div className="w-6 h-[1px] my-2 bg-border" />

      {/* Preview */}
      <ToolbarIconButton
        icon="visibility"
        label="Preview Form"
        onClick={onPreview}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* View indicator */}
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`material-symbols-outlined text-[16px] ${view === "flow" ? "text-orange-500" : "text-muted-foreground"}`}
        >
          {view === "flow" ? "account_tree" : "view_list"}
        </span>
        <span
          className="text-[8px] uppercase tracking-wider text-muted-foreground"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {view}
        </span>
      </div>
    </aside>
  );
}

function ToolbarIconButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30 text-slate-500 hover:bg-slate-100 hover:text-foreground"
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}