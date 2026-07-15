import { cn } from "~/lib/utils";

/** SVG connector lines between nodes */
function ConnectorLayer() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon fill="#454653" points="0 0, 10 3.5, 0 7" />
        </marker>
        <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon fill="#fca9d4" points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      {/* Row 1 connectors */}
      <path className="fill-none stroke-[#454653]" strokeWidth="1.5" d="M260,140 C340,140 340,140 420,140" markerEnd="url(#arrowhead)" />
      <path className="fill-none stroke-[#454653]" strokeWidth="1.5" d="M580,140 C660,140 660,140 740,140" markerEnd="url(#arrowhead)" />
      {/* Row 2 connectors */}
      <path className="fill-none stroke-[#454653]" strokeWidth="1.5" d="M260,380 C340,380 340,380 420,380" markerEnd="url(#arrowhead)" />
      <path className="fill-none stroke-[#454653]" strokeWidth="1.5" d="M580,380 C660,380 660,380 740,380" markerEnd="url(#arrowhead)" />
      {/* Active branch connector */}
      <path className="fill-none stroke-[#fca9d4]" strokeWidth="1.5" d="M900,380 C950,380 950,500 900,500" markerEnd="url(#arrowhead-active)" />
      {/* Default branch */}
      <path className="fill-none stroke-[#454653]" strokeWidth="1.5" d="M900,380 C1000,380 1000,380 1060,380" markerEnd="url(#arrowhead)" />
    </svg>
  );
}

/** A single form node on the canvas */
function CanvasNode({
  left,
  top,
  width = "w-40",
  icon,
  iconColor,
  label,
  selected = false,
  selectedBorderColor,
  headerBg,
  children,
}: {
  left: string;
  top: string;
  width?: string;
  icon: string;
  iconColor: string;
  label: string;
  selected?: boolean;
  selectedBorderColor?: string;
  headerBg?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute rounded overflow-hidden",
        width,
        selected ? "border-2 shadow-md z-20 scale-105" : "border shadow-[0px_1px_3px_rgba(0,0,0,0.3)]",
      )}
      style={{
        left,
        top,
        backgroundColor: "#1f1f26",
        borderColor: selected ? (selectedBorderColor ?? "#fca9d4") : "#454653",
      }}
    >
      {/* Node header */}
      <div
        className="px-2 py-1 flex items-center justify-between border-b"
        style={{
          backgroundColor: headerBg ?? "#1f1f26",
          borderColor: selected ? (selectedBorderColor ? `${selectedBorderColor}30` : "#fca9d430") : "#454653",
        }}
      >
        <div className="flex items-center gap-1">
          <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>{icon}</span>
          <span
            className={cn("text-[12px]", selected ? "text-[#e4e1eb] font-bold" : "text-[#c6c5d5]")}
            style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
          >
            {label}
          </span>
        </div>
        {selected ? (
          <span className="material-symbols-outlined text-[16px] text-[#fca9d4]">settings</span>
        ) : (
          <span className="material-symbols-outlined text-[16px] text-[#908f9e]">more_horiz</span>
        )}
      </div>
      {/* Node body */}
      <div className="p-2">{children}</div>
    </div>
  );
}

export function BuilderCanvas() {
  return (
    <main
      className="flex-1 relative overflow-hidden cursor-crosshair"
      style={{
        backgroundColor: "#121319",
        backgroundImage: "radial-gradient(#292930 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <ConnectorLayer />

      {/* Node 1: Welcome */}
      <CanvasNode left="16px" top="16px" width="w-60" icon="waving_hand" iconColor="text-[#fca9d4]" label="Welcome">
        <p className="text-sm font-medium text-[#e4e1eb]">Help us improve</p>
        <p className="text-[12px] text-[#c6c5d5] mt-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
          Startup Feedback Flow
        </p>
      </CanvasNode>

      {/* Node 2: Name */}
      <CanvasNode left="420px" top="16px" icon="short_text" iconColor="text-[#fca9d4]" label="Name">
        <div className="h-6 w-full bg-[#1b1b22] rounded" />
      </CanvasNode>

      {/* Node 3: Email */}
      <CanvasNode left="740px" top="16px" icon="mail" iconColor="text-[#b9c7e0]" label="Email">
        <div className="h-6 w-full bg-[#1b1b22] rounded" />
      </CanvasNode>

      {/* Node 4: Role (Selected) */}
      <CanvasNode
        left="16px"
        top="340px"
        width="w-60"
        icon="check_circle"
        iconColor="text-[#fca9d4]"
        label="Role"
        selected
        selectedBorderColor="#fca9d4"
        headerBg="rgba(129, 140, 248, 0.2)"
      >
        <p className="text-sm font-medium text-[#e4e1eb]">What is your role?</p>
        <div className="text-[10px] text-[#908f9e] flex flex-col gap-1 mt-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
          <div className="flex items-center gap-2 px-1 bg-[#1b1b22] rounded border border-[#454653]/30">1 Founder</div>
          <div className="flex items-center gap-2 px-1 bg-[#1b1b22] rounded border border-[#454653]/30">2 Engineer</div>
          <div className="flex items-center gap-2 px-1 bg-[#1b1b22] rounded border border-[#454653]/30">3 Product</div>
        </div>
      </CanvasNode>

      {/* Node 5: Rating */}
      <CanvasNode left="420px" top="340px" icon="star" iconColor="text-[#f7bd3e]" label="Rating">
        <div className="flex gap-1 justify-center p-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="w-4 h-4 bg-[#1b1b22] rounded-full" />
          ))}
        </div>
      </CanvasNode>

      {/* Node 6: Low Rating (Negative Branch) */}
      <CanvasNode
        left="740px"
        top="460px"
        icon="error_outline"
        iconColor="text-[#c08d00]"
        label="Low Rating"
        selectedBorderColor="#c08d00"
        headerBg="rgba(192, 141, 0, 0.1)"
      >
        <p className="text-sm font-medium text-[#e4e1eb]">What went wrong?</p>
      </CanvasNode>

      {/* Node 7: Thank You */}
      <CanvasNode left="1060px" top="340px" icon="done_all" iconColor="text-[#fca9d4]" label="Success">
        <p className="text-[12px] font-bold text-[#e4e1eb] text-center" style={{ fontFamily: "var(--font-geist-mono)" }}>
          Thank You!
        </p>
      </CanvasNode>

      {/* Zoom Controls */}
      <ZoomControls />

      {/* Live Preview Window */}
      <LivePreview />
    </main>
  );
}

function ZoomControls() {
  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center bg-[#1f1f26] border border-[#454653] rounded-full px-4 py-1 gap-4 shadow-lg z-50"
    >
      <div className="flex items-center gap-2">
        <button className="material-symbols-outlined text-[20px] text-[#c6c5d5] hover:text-[#fca9d4] transition-colors">
          remove
        </button>
        <span
          className="text-[12px] min-w-[40px] text-center text-[#e4e1eb]"
          style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
        >
          80%
        </span>
        <button className="material-symbols-outlined text-[20px] text-[#c6c5d5] hover:text-[#fca9d4] transition-colors">
          add
        </button>
      </div>
      <div className="w-[1px] h-4 bg-[#454653]" />
      <button
        className="text-[12px] text-[#c6c5d5] hover:text-[#fca9d4] transition-colors"
        style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
      >
        Fit View
      </button>
      <div className="w-[1px] h-4 bg-[#454653]" />
      <button className="material-symbols-outlined text-[20px] text-[#c6c5d5] hover:text-[#fca9d4] transition-colors" title="Minimap">
        map
      </button>
    </div>
  );
}

function LivePreview() {
  return (
    <div className="absolute bottom-4 right-4 w-80 bg-[#1b1b22] rounded-xl shadow-2xl border border-[#454653] overflow-hidden z-50">
      {/* Preview header */}
      <div className="p-4 bg-[#292930] border-b border-[#454653] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#fca9d4] rounded-full animate-pulse" />
          <span
            className="text-[12px] font-bold uppercase tracking-wide text-[#e4e1eb]"
            style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
          >
            Live Preview
          </span>
        </div>
        <span className="material-symbols-outlined text-[20px] text-[#908f9e] cursor-pointer">
          open_in_full
        </span>
      </div>

      {/* Preview content */}
      <div className="p-6 space-y-4 bg-[#0d0e14]">
        <h2
          className="text-lg font-medium text-[#e4e1eb]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          What is your role?
        </h2>
        <div className="space-y-2">
          {["Founder", "Engineer", "Product"].map((option) => (
            <button
              key={option}
              className="w-full text-left p-4 border border-[#454653] rounded-lg text-sm bg-[#1b1b22] text-[#e4e1eb] hover:border-[#fca9d4] hover:bg-[#fca9d4]/10 transition-all flex items-center justify-between group"
            >
              {option}
              <span className="material-symbols-outlined text-[18px] text-[#908f9e] group-hover:text-[#fca9d4]">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview footer */}
      <div className="bg-[#292930] p-2 text-center">
        <span
          className="text-[11px] text-[#908f9e] uppercase tracking-wider"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          Form Step 4 of 7
        </span>
      </div>
    </div>
  );
}