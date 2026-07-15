export interface FlowNode {
  id: string;
  type: "welcome" | "question" | "question_group" | "choice" | "success";
  label: string;
  x: number;
  y: number;
  fields: FlowNodeField[];
}

export interface FlowNodeField {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
  options?: Array<{ label: string; value: string }> | null;
}

export interface FlowConnection {
  id: string;
  from: string;
  to: string;
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export const NODE_WIDTH = 260;
export const NODE_GAP_Y = 120;
export const NODE_GAP_X = 340;