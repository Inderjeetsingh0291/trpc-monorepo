"use client";

const BLOCK_GROUPS = [
  {
    title: "Common",
    blocks: [
      { icon: "short_text", label: "Short Text", type: "text", color: "text-slate-500", bg: "bg-slate-100" },
      { icon: "notes", label: "Long Text", type: "textarea", color: "text-slate-500", bg: "bg-slate-100" },
      { icon: "tag", label: "Number", type: "number", color: "text-slate-500", bg: "bg-slate-100" },
    ],
  },
  {
    title: "Contact",
    blocks: [
      { icon: "mail", label: "Email", type: "email", color: "text-blue-500", bg: "bg-blue-50" },
      { icon: "call", label: "Phone", type: "phone", color: "text-blue-500", bg: "bg-blue-50" },
    ],
  },
  {
    title: "Choice",
    blocks: [
      { icon: "radio_button_checked", label: "Single Select", type: "select", color: "text-amber-500", bg: "bg-amber-50" },
      { icon: "check_box", label: "Multi Select", type: "multi_select", color: "text-amber-500", bg: "bg-amber-50" },
      { icon: "check_box_outline_blank", label: "Checkbox", type: "checkbox", color: "text-green-500", bg: "bg-green-50" },
    ],
  },
  {
    title: "Scale & Date",
    blocks: [
      { icon: "star", label: "Rating", type: "rating", color: "text-orange-500", bg: "bg-orange-50" },
      { icon: "calendar_today", label: "Date", type: "date", color: "text-purple-500", bg: "bg-purple-50" },
    ],
  },
] as const;

interface BuilderInsertPanelProps {
  onAddBlock?: (type: string) => void;
  view?: "form" | "flow";
}

export function BuilderInsertPanel({ onAddBlock, view = "form" }: BuilderInsertPanelProps) {
  return (
    <aside className="w-full md:w-[200px] h-full bg-background border-r border-border flex flex-col z-30 shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <span
          className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {view === "flow" ? "Add Field" : "Insert Blocks"}
        </span>
      </div>

      {/* Block list — flat list style */}
      <div className="flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:hidden">
        {BLOCK_GROUPS.map((group) => (
          <div key={group.title} className="mb-1">
            <h3
              className="text-[9px] uppercase tracking-widest text-muted-foreground/60 px-4 py-1.5"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {group.title}
            </h3>
            <div className="flex flex-col">
              {group.blocks.map((block) => (
                <button
                  key={block.label}
                  onClick={() => onAddBlock?.(block.type)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group text-left"
                >
                  <div className={`w-7 h-7 rounded-md ${block.bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-[15px] ${block.color}`}>
                      {block.icon}
                    </span>
                  </div>
                  <span
                    className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors"
                    style={{ fontFamily: "var(--font-geist-sans)" }}
                  >
                    {block.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Coming soon */}
        <div className="mx-4 mt-3 mb-2 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-slate-300 text-lg mb-0.5">extension</span>
          <p className="text-[10px] text-slate-400" style={{ fontFamily: "var(--font-geist-mono)" }}>
            More coming soon
          </p>
        </div>
      </div>
    </aside>
  );
}