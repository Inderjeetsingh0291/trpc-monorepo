import { useMemo } from "react";
import type { FlowNode, FlowConnection } from "./types";
import { NODE_GAP_Y } from "./types";

interface Field {
  id: string;
  label: string;
  type: string;
  isRequired: boolean;
  index: string;
  options?: unknown;
  [key: string]: unknown;
}

/**
 * Converts flat field list into flow nodes + connections.
 * Groups fields into logical nodes based on field type patterns.
 * 
 * Strategy:
 * - First node is always "Welcome" (synthetic)
 * - Each field becomes its own node (for simplicity and 1:1 sync)
 * - Choice fields (single_select, multi_select, dropdown) get "choice" type
 * - Last node is always "Success" (synthetic)
 * - Connections are linear: Welcome → Field1 → Field2 → ... → Success
 */
export function useFlowData(fields: Field[] | undefined, formTitle?: string) {
  return useMemo(() => {
    const nodes: FlowNode[] = [];
    const connections: FlowConnection[] = [];

    // Welcome node (always present)
    const welcomeNode: FlowNode = {
      id: "__welcome__",
      type: "welcome",
      label: formTitle ?? "Welcome",
      x: 0,
      y: 0,
      fields: [],
    };
    nodes.push(welcomeNode);

    // Field nodes
    if (fields && fields.length > 0) {
      fields.forEach((field, idx) => {
        const isChoice = ["select", "multi_select"].includes(field.type);
        const node: FlowNode = {
          id: field.id,
          type: isChoice ? "choice" : "question",
          label: field.label,
          x: 0,
          y: (idx + 1) * NODE_GAP_Y,
          fields: [
            {
              id: field.id,
              label: field.label,
              fieldType: field.type,
              required: field.isRequired,
              options: field.options as Array<{ label: string; value: string }> | null,
            },
          ],
        };
        nodes.push(node);
      });
    }

    // Success node (always present)
    const successNode: FlowNode = {
      id: "__success__",
      type: "success",
      label: "Thank You",
      x: 0,
      y: (nodes.length) * NODE_GAP_Y,
      fields: [],
    };
    nodes.push(successNode);

    // Auto-arrange vertically centered
    const startY = 80;
    nodes.forEach((node, idx) => {
      node.x = 0;
      node.y = startY + idx * NODE_GAP_Y;
    });

    // Linear connections
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        id: `conn-${nodes[i]!.id}-${nodes[i + 1]!.id}`,
        from: nodes[i]!.id,
        to: nodes[i + 1]!.id,
      });
    }

    return { nodes, connections };
  }, [fields, formTitle]);
}