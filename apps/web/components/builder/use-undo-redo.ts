"use client";

import { useCallback, useRef, useState } from "react";

interface UndoAction {
  type: "add" | "delete" | "update" | "reorder";
  fieldId?: string;
  formId: string;
  payload?: unknown;
  timestamp: number;
}

/**
 * Simple undo/redo stack for builder operations.
 * Tracks field mutations and allows reverting them.
 */
export function useUndoRedo() {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  const pushAction = useCallback((action: Omit<UndoAction, "timestamp">) => {
    setUndoStack((prev) => [...prev.slice(-19), { ...action, timestamp: Date.now() }]);
    setRedoStack([]); // Clear redo on new action
  }, []);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const undo = useCallback(() => {
    if (undoStack.length === 0) return null;
    const action = undoStack[undoStack.length - 1]!;
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, action]);
    return action;
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return null;
    const action = redoStack[redoStack.length - 1]!;
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, action]);
    return action;
  }, [redoStack]);

  return { pushAction, undo, redo, canUndo, canRedo };
}