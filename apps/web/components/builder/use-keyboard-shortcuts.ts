"use client";

import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onEscape?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
}

/**
 * Registers keyboard shortcuts for the builder.
 * - Delete/Backspace: delete selected field
 * - Cmd+Z: undo
 * - Cmd+Shift+Z: redo
 * - Escape: deselect
 * - Cmd+= / Cmd+-: zoom in/out
 * - Cmd+0: fit view
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const isMeta = e.metaKey || e.ctrlKey;

      // Delete selected
      if ((e.key === "Delete" || e.key === "Backspace") && !isMeta) {
        e.preventDefault();
        handlers.onDelete?.();
        return;
      }

      // Undo
      if (isMeta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
        return;
      }

      // Redo
      if (isMeta && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handlers.onRedo?.();
        return;
      }

      // Escape
      if (e.key === "Escape") {
        handlers.onEscape?.();
        return;
      }

      // Zoom in
      if (isMeta && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        handlers.onZoomIn?.();
        return;
      }

      // Zoom out
      if (isMeta && e.key === "-") {
        e.preventDefault();
        handlers.onZoomOut?.();
        return;
      }

      // Fit view
      if (isMeta && e.key === "0") {
        e.preventDefault();
        handlers.onFitView?.();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}