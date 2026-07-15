"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFlowData } from "./use-flow-data";
import type { FlowNode } from "./types";

interface Field {
  id: string;
  label: string;
  type: string;
  isRequired: boolean;
  index: string;
  options?: unknown;
  [key: string]: unknown;
}

interface FlowCanvasProps {
  fields: Field[] | undefined;
  formTitle?: string;
  formId: string;
  onAddField: (fieldType: string) => void;
  onDeleteField: (fieldId: string) => void;
  onSelectField: (fieldId: string | null) => void;
  selectedFieldId: string | null;
}

interface Pos { x: number; y: number; }
interface Connection { from: string; to: string; }

const CARD_W = 360;
const CARD_H = 88;
const NODE_GAP = 160; // vertical gap between nodes

function FlowCanvasInner({
  fields, formTitle, formId, onDeleteField, onSelectField, selectedFieldId,
}: FlowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { nodes } = useFlowData(fields, formTitle);

  const [cam, setCam] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Pos>({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Map<string, Pos>>(new Map());
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Pos>({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingMouse, setConnectingMouse] = useState<Pos>({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  // ─── Layout nodes vertically, centred in viewport ────────────────────────────
  useEffect(() => {
    if (nodes.length === 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const vw = rect?.width || 800;
    const vh = rect?.height || 600;

    const newPositions = new Map<string, Pos>();
    nodes.forEach((node, i) => {
      newPositions.set(node.id, {
        x: vw / 2 - CARD_W / 2,   // horizontally centred
        y: 60 + i * NODE_GAP,
      });
    });
    setPositions(newPositions);

    // Build linear connections
    setConnections(() => {
      const conns: Connection[] = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        conns.push({ from: nodes[i]!.id, to: nodes[i + 1]!.id });
      }
      return conns;
    });

    // Fit camera so all nodes are in view using newPositions
    const allPos = Array.from(newPositions.values());
    const minX = Math.min(...allPos.map(p => p.x));
    const maxX = Math.max(...allPos.map(p => p.x + CARD_W));
    const minY = Math.min(...allPos.map(p => p.y));
    const maxY = Math.max(...allPos.map(p => p.y + CARD_H));
    
    const pad = 80;
    const zoom = Math.max(0.1, Math.min(
      (vw - pad * 2) / Math.max(maxX - minX, 1),
      (vh - pad * 2) / Math.max(maxY - minY, 1),
      1.2
    ));
    setCam({
      zoom,
      x: vw / 2 - ((minX + maxX) / 2) * zoom,
      y: vh / 2 - ((minY + maxY) / 2) * zoom,
    });
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, formId]);

  // ─── Fit all nodes into view ─────────────────────────────────────────────────
  const fitView = useCallback(() => {
    if (!containerRef.current || positions.size === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const allPos = Array.from(positions.values());
    const minX = Math.min(...allPos.map(p => p.x));
    const maxX = Math.max(...allPos.map(p => p.x + CARD_W));
    const minY = Math.min(...allPos.map(p => p.y));
    const maxY = Math.max(...allPos.map(p => p.y + CARD_H));
    const vw = rect.width || 800;
    const vh = rect.height || 600;
    const pad = 80;
    const zoom = Math.max(0.1, Math.min(
      (vw - pad * 2) / Math.max(maxX - minX, 1),
      (vh - pad * 2) / Math.max(maxY - minY, 1),
      1.2
    ));
    setCam({
      zoom,
      x: vw / 2 - ((minX + maxX) / 2) * zoom,
      y: vh / 2 - ((minY + maxY) / 2) * zoom,
    });
  }, [positions]);

  // ─── Pan ─────────────────────────────────────────────────────────────────────
  const onCanvasDown = useCallback((e: React.PointerEvent) => {
    if (e.target === e.currentTarget || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - cam.x, y: e.clientY - cam.y });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [cam.x, cam.y]);

  const onCanvasMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      setCam(c => ({ ...c, x: e.clientX - panStart.x, y: e.clientY - panStart.y }));
    }
    if (dragId) {
      const nx = (e.clientX - dragOffset.x - cam.x) / cam.zoom;
      const ny = (e.clientY - dragOffset.y - cam.y) / cam.zoom;
      setPositions(prev => { const n = new Map(prev); n.set(dragId, { x: nx, y: ny }); return n; });
    }
    if (connectingFrom) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setConnectingMouse({
          x: (e.clientX - rect.left - cam.x) / cam.zoom,
          y: (e.clientY - rect.top  - cam.y) / cam.zoom,
        });
      }
    }
  }, [isPanning, panStart, dragId, dragOffset, cam, connectingFrom]);

  const onCanvasUp = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    }
    if (dragId) setDragId(null);
    if (connectingFrom) {
      // Detect drop target
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mx = (e.clientX - rect.left - cam.x) / cam.zoom;
        const my = (e.clientY - rect.top  - cam.y) / cam.zoom;
        for (const [id, p] of positions.entries()) {
          if (id === connectingFrom) continue;
          if (mx >= p.x && mx <= p.x + CARD_W && my >= p.y && my <= p.y + CARD_H) {
            const src = connectingFrom;
            setConnections(prev => {
              const exists = prev.some(c => c.from === src && c.to === id);
              if (exists) return prev;
              return [...prev.filter(c => c.from !== src), { from: src, to: id }];
            });
            break;
          }
        }
      }
      setConnectingFrom(null);
    }
  }, [isPanning, dragId, connectingFrom, cam, positions]);

  // ─── Zoom (mouse wheel) ───────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const f = e.deltaY > 0 ? 0.92 : 1.09;
    setCam(c => {
      const nz = Math.min(2, Math.max(0.25, c.zoom * f));
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { ...c, zoom: nz };
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const r = nz / c.zoom;
      return { zoom: nz, x: mx - (mx - c.x) * r, y: my - (my - c.y) * r };
    });
  }, []);

  // ─── Node drag ────────────────────────────────────────────────────────────────
  const startDrag = useCallback((id: string, e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    const pos = positions.get(id) ?? { x: 0, y: 0 };
    setDragId(id);
    setDragOffset({ x: e.clientX - pos.x * cam.zoom - cam.x, y: e.clientY - pos.y * cam.zoom - cam.y });
  }, [positions, cam]);

  // ─── Connect port drag ────────────────────────────────────────────────────────
  const startConnect = useCallback((fromId: string, e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    setConnectingFrom(fromId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setConnectingMouse({
        x: (e.clientX - rect.left - cam.x) / cam.zoom,
        y: (e.clientY - rect.top  - cam.y) / cam.zoom,
      });
    }
  }, [cam]);

  // ─── Delete connection by clicking it (double‑click port) ────────────────────
  const deleteConnection = (from: string, to: string) => {
    setConnections(prev => prev.filter(c => !(c.from === from && c.to === to)));
  };

  const gridSize = 28 * cam.zoom;

  // ─── Empty state ─────────────────────────────────────────────────────────────
  if (ready && nodes.length <= 2) {
    // Only Welcome + Thank You — no real fields yet
    return (
      <div ref={containerRef} className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0c12] gap-4">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #2d2d3a 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#141418] border border-[#2d2d3a] shadow-sm flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-outlined text-orange-400 text-3xl">account_tree</span>
          </div>
          <p className="text-sm font-semibold text-[#e4e1eb] mb-1">Canvas is empty</p>
          <p className="text-xs text-[#908f9e] max-w-xs">Add fields from the left panel and they will appear here as connected nodes.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{
        backgroundColor: "#0c0c12",
        backgroundImage: "radial-gradient(circle, #2d2d3a 1.5px, transparent 1.5px)",
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${cam.x % gridSize}px ${cam.y % gridSize}px`,
        cursor: isPanning ? "grabbing" : connectingFrom ? "crosshair" : dragId ? "grabbing" : "grab",
      }}
      onPointerDown={onCanvasDown}
      onPointerMove={onCanvasMove}
      onPointerUp={onCanvasUp}
      onWheel={onWheel}
      onClick={() => onSelectField(null)}
    >
      {/* Transform layer */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.zoom})`, willChange: "transform" }}
      >
        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
          {connections.map((conn) => {
            const fp = positions.get(conn.from);
            const tp = positions.get(conn.to);
            if (!fp || !tp) return null;
            const x1 = fp.x + CARD_W / 2, y1 = fp.y + CARD_H;
            const x2 = tp.x + CARD_W / 2, y2 = tp.y;
            const tension = Math.max(40, Math.abs(y2 - y1) * 0.4);
            const d = `M ${x1} ${y1} C ${x1} ${y1 + tension}, ${x2} ${y2 - tension}, ${x2} ${y2}`;
            const col = getLineColor(nodes.find(n => n.id === conn.from));
            return (
              <g key={`${conn.from}-${conn.to}`} className="pointer-events-auto" onDoubleClick={() => deleteConnection(conn.from, conn.to)}>
                {/* Hit area */}
                <path d={d} fill="none" stroke="transparent" strokeWidth={14} style={{ cursor: "pointer" }} />
                <path d={d} fill="none" stroke={col} strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
                {/* Animated midpoint dot */}
                <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={4} fill={col}>
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
          {/* Live connecting line */}
          {connectingFrom && (() => {
            const fp = positions.get(connectingFrom);
            if (!fp) return null;
            const x1 = fp.x + CARD_W / 2, y1 = fp.y + CARD_H;
            return (
              <line
                x1={x1} y1={y1}
                x2={connectingMouse.x} y2={connectingMouse.y}
                stroke="#f97316" strokeWidth={2} strokeDasharray="6 4" opacity={0.8}
              />
            );
          })()}
        </svg>

        {/* Node cards */}
        {nodes.map(node => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const isSynthetic = node.id === "__welcome__" || node.id === "__success__";
          const isDragging = dragId === node.id;
          const isSelected = selectedFieldId === node.id;

          return (
            <div
              key={node.id}
              className="absolute pointer-events-auto"
              style={{
                left: pos.x, top: pos.y, width: CARD_W,
                zIndex: isDragging ? 100 : isSelected ? 50 : 10,
                transform: isDragging ? "scale(1.03) rotate(0.5deg)" : "none",
                filter: isDragging ? "drop-shadow(0 12px 32px rgba(0,0,0,0.15))" : "none",
                transition: isDragging ? "none" : "transform 0.15s ease, filter 0.15s ease",
              }}
            >
              {/* Card */}
              <div
                className={`rounded-2xl overflow-hidden shadow-md cursor-grab active:cursor-grabbing transition-shadow ${
                  isSelected ? "ring-2 ring-orange-500 ring-offset-2 shadow-lg" : "hover:shadow-lg"
                }`}
                style={{
                  background: getNodeBg(node),
                  border: `1.5px solid ${getNodeBorder(node)}`,
                }}
                onClick={e => { e.stopPropagation(); if (!isSynthetic) onSelectField(node.id); }}
                onPointerDown={e => startDrag(node.id, e)}
              >
                <NodeContent node={node} onDelete={!isSynthetic ? () => onDeleteField(node.id) : undefined} />
              </div>

              {/* Bottom port — drag to connect */}
              {!isSynthetic && (
                <div
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center cursor-crosshair pointer-events-auto z-50 transition-transform hover:scale-125 shadow-md"
                  style={{ background: getLineColor(node) }}
                  title="Drag to connect"
                  onPointerDown={e => startConnect(node.id, e)}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                </div>
              )}

              {/* Top port — visual only */}
              {!isSynthetic && (
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm pointer-events-none"
                  style={{ background: getNodeBorder(node) }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Zoom controls ── */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#141418] border border-[#2d2d3a] rounded-xl shadow-md px-4 py-2 flex items-center gap-3">
        <button
          onClick={() => setCam(c => ({ ...c, zoom: Math.max(0.25, c.zoom * 0.8) }))}
          className="text-[#908f9e] hover:text-[#e4e1eb] text-base font-bold w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#1e212d] transition-colors"
        >−</button>
        <span className="text-xs font-medium text-[#c6c5d5] w-10 text-center" style={{ fontFamily: "var(--font-geist-mono)" }}>
          {Math.round(cam.zoom * 100)}%
        </span>
        <button
          onClick={() => setCam(c => ({ ...c, zoom: Math.min(2, c.zoom * 1.25) }))}
          className="text-[#908f9e] hover:text-[#e4e1eb] text-base font-bold w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#1e212d] transition-colors"
        >+</button>
        <div className="w-px h-4 bg-[#2d2d3a]" />
        <button
          onClick={fitView}
          className="text-xs font-semibold text-[#908f9e] hover:text-orange-500 uppercase tracking-wider transition-colors"
        >Fit</button>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 right-4 z-20 text-[10px] text-[#5a5a6e] pointer-events-none" style={{ fontFamily: "var(--font-geist-mono)" }}>
        Scroll to zoom · Drag background to pan · Drag port to connect · Double-click line to remove
      </div>
    </div>
  );
}

// ─── Node Content ─────────────────────────────────────────────────────────────

function NodeContent({ node, onDelete }: { node: FlowNode; onDelete?: () => void }) {
  if (node.type === "welcome") {
    return (
      <div className="flex items-center gap-3 p-4">
        <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center text-2xl shrink-0">👋</div>
        <div>
          <p className="font-semibold text-sm text-slate-900">{node.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">Start of form</p>
        </div>
      </div>
    );
  }

  if (node.type === "success") {
    return (
      <div className="flex items-center gap-3 p-4">
        <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-slate-900">{node.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">End of form</p>
        </div>
        <span className="text-2xl">🎉</span>
      </div>
    );
  }

  const field = node.fields[0];
  if (!field) return null;

  const icon = getFieldIcon(field.fieldType);

  if (node.type === "choice") {
    const opts = (field.options as Array<{ label: string }> | null) ?? [];
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl ${icon.bg} flex items-center justify-center shrink-0`}>
            <span className={`material-symbols-outlined text-xl ${icon.color}`}>{icon.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-slate-900 truncate">{field.label}</p>
              {onDelete && <DeleteBtn onDelete={onDelete} />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{getDesc(field.fieldType)}</p>
          </div>
        </div>
        {opts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {opts.slice(0, 4).map((o, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-medium">
                {typeof o === 'string' ? o : (o as any).label}
              </span>
            ))}
            {opts.length > 4 && <span className="px-2 py-1 text-[10px] text-slate-400">+{opts.length - 4} more</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4">
      <div className={`w-11 h-11 rounded-xl ${icon.bg} flex items-center justify-center shrink-0 text-lg font-bold ${icon.color}`}>
        {icon.content}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm text-slate-900 truncate">{field.label}</p>
          {onDelete && <DeleteBtn onDelete={onDelete} />}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{getDesc(field.fieldType)}</p>
      </div>
    </div>
  );
}

function DeleteBtn({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onDelete(); }}
      className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
      </svg>
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNodeBg(n: FlowNode) {
  switch (n.type) {
    case "welcome": return "#ffffff";
    case "success": return "#f0fdf4";
    case "choice":  return "#fffbeb";
    default:        return "#ffffff";
  }
}

function getNodeBorder(n: FlowNode) {
  switch (n.type) {
    case "welcome": return "rgba(249,115,22,0.25)";
    case "success": return "rgba(34,197,94,0.35)";
    case "choice":  return "rgba(245,158,11,0.35)";
    default:        return "rgba(226,232,240,1)";
  }
}

function getLineColor(n?: FlowNode) {
  if (!n) return "#f97316";
  switch (n.type) {
    case "welcome": return "#f97316";
    case "success": return "#22c55e";
    case "choice":  return "#f59e0b";
    default:        return "#94a3b8";
  }
}

type IconDef = { bg: string; color: string; icon: string; content: string };
function getFieldIcon(ft: string): IconDef {
  const map: Record<string, IconDef> = {
    text:         { bg: "bg-slate-100",  color: "text-slate-600",  icon: "short_text",             content: "T"  },
    textarea:     { bg: "bg-slate-100",  color: "text-slate-600",  icon: "notes",                  content: "¶"  },
    number:       { bg: "bg-slate-100",  color: "text-slate-600",  icon: "tag",                    content: "#"  },
    email:        { bg: "bg-blue-50",    color: "text-blue-600",   icon: "mail",                   content: "✉"  },
    phone:        { bg: "bg-blue-50",    color: "text-blue-600",   icon: "call",                   content: "📞" },
    select:       { bg: "bg-amber-50",   color: "text-amber-600",  icon: "radio_button_checked",   content: "☷"  },
    multi_select: { bg: "bg-amber-50",   color: "text-amber-600",  icon: "check_box",              content: "☰"  },
    checkbox:     { bg: "bg-green-50",   color: "text-green-600",  icon: "check_box_outline_blank", content: "☑"  },
    rating:       { bg: "bg-orange-50",  color: "text-orange-500", icon: "star",                   content: "★"  },
    date:         { bg: "bg-purple-50",  color: "text-purple-600", icon: "calendar_today",         content: "📅" },
  };
  return map[ft] ?? { bg: "bg-slate-100", color: "text-slate-500", icon: "input", content: "?" };
}

function getDesc(ft: string) {
  const d: Record<string, string> = {
    text:         "Short text response",
    textarea:     "Long text / paragraph",
    number:       "Numeric value",
    email:        "Email address",
    phone:        "Phone number",
    select:       "Single choice",
    multi_select: "Multiple choices",
    checkbox:     "Yes / No",
    rating:       "Star rating (1–5)",
    date:         "Date picker",
  };
  return d[ft] ?? "";
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 p-8 bg-red-50 text-red-900 overflow-auto">
          <h2 className="text-xl font-bold mb-4">Canvas Crashed</h2>
          <pre className="text-xs whitespace-pre-wrap">{this.state.error?.toString()}</pre>
          <pre className="text-xs whitespace-pre-wrap mt-4">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ErrorBoundary>
      <FlowCanvasInner {...props} />
    </ErrorBoundary>
  );
}