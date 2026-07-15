"use client";

import { useEffect, useState } from "react";
import { trpc } from "~/trpc/client";

// ─── Field type metadata ─────────────────────────────────────────────────────
const FIELD_META: Record<string, { label: string; icon: string; color: string; hasOptions: boolean; hasPlaceholder: boolean; hasDescription: boolean }> = {
  text:         { label: "Short Text",   icon: "short_text",            color: "text-slate-500",  hasOptions: false, hasPlaceholder: true,  hasDescription: true },
  textarea:     { label: "Long Text",    icon: "notes",                 color: "text-slate-500",  hasOptions: false, hasPlaceholder: true,  hasDescription: true },
  number:       { label: "Number",       icon: "tag",                   color: "text-slate-500",  hasOptions: false, hasPlaceholder: true,  hasDescription: true },
  email:        { label: "Email",        icon: "mail",                  color: "text-blue-500",   hasOptions: false, hasPlaceholder: true,  hasDescription: true },
  phone:        { label: "Phone",        icon: "call",                  color: "text-blue-500",   hasOptions: false, hasPlaceholder: true,  hasDescription: true },
  select:       { label: "Single Select",icon: "radio_button_checked",  color: "text-amber-500",  hasOptions: true,  hasPlaceholder: false, hasDescription: true },
  multi_select: { label: "Multi Select", icon: "check_box",             color: "text-amber-500",  hasOptions: true,  hasPlaceholder: false, hasDescription: true },
  checkbox:     { label: "Checkbox",     icon: "check_box_outline_blank",color: "text-green-500", hasOptions: false, hasPlaceholder: false, hasDescription: true },
  rating:       { label: "Rating",       icon: "star",                  color: "text-orange-500", hasOptions: false, hasPlaceholder: false, hasDescription: true },
  date:         { label: "Date",         icon: "calendar_today",        color: "text-purple-500", hasOptions: false, hasPlaceholder: true,  hasDescription: true },
};

const DEFAULT_META = { label: "Field", icon: "input", color: "text-slate-500", hasOptions: false, hasPlaceholder: true, hasDescription: true };

interface BuilderInspectorProps {
  fieldId: string;
  formId: string;
  onDelete?: (fieldId: string) => void;
}

export function BuilderInspector({ fieldId, formId, onDelete }: BuilderInspectorProps) {
  const utils = trpc.useUtils();

  // Fetch the field data
  const { data: fieldsData } = trpc.form.getFields.useQuery({ formId });
  const field = fieldsData?.fields?.find((f) => f.id === fieldId);

  // Local editable state
  const [label, setLabel]             = useState("");
  const [description, setDescription] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isRequired, setIsRequired]   = useState(false);
  const [options, setOptions]         = useState<string[]>([]);
  const [dirty, setDirty]             = useState(false);

  // Sync local state when field loads/changes
  useEffect(() => {
    if (!field) return;
    setLabel(field.label ?? "");
    setDescription((field.description as string) ?? "");
    setPlaceholder((field.placeholder as string) ?? "");
    setIsRequired(field.isRequired ?? false);
    // options might be an array of strings or objects
    const rawOpts = (field as any).options as string[] | { label: string }[] | null | undefined;
    if (Array.isArray(rawOpts)) {
      setOptions(rawOpts.map((o) => (typeof o === "string" ? o : o.label)));
    } else {
      setOptions([]);
    }
    setDirty(false);
  }, [field?.id, field?.label]);

  const updateField = trpc.form.updateField.useMutation({
    onSuccess: () => {
      utils.form.getFields.invalidate({ formId });
      setDirty(false);
    },
  });

  const deleteFieldMutation = trpc.form.deleteField.useMutation({
    onSuccess: () => {
      utils.form.getFields.invalidate({ formId });
      onDelete?.(fieldId);
    },
  });

  const handleSave = () => {
    updateField.mutate({
      fieldId,
      label,
      description: description || null,
      placeholder: placeholder || null,
      isRequired,
    });
  };

  const handleDelete = () => {
    if (confirm("Delete this field? This cannot be undone.")) {
      deleteFieldMutation.mutate({ fieldId });
    }
  };

  const meta = field ? (FIELD_META[field.type] ?? DEFAULT_META) : DEFAULT_META;

  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
        <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">manage_search</span>
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-geist-mono)" }}>
          Loading field…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Field type badge */}
      <div className="px-4 py-3 flex items-center gap-2 bg-slate-50 border-b border-border">
        <span className={`material-symbols-outlined text-[18px] ${meta.color}`}>{meta.icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-foreground" style={{ fontFamily: "var(--font-geist-mono)" }}>
          {meta.label}
        </span>
      </div>

      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 [&::-webkit-scrollbar]:hidden">

        {/* Label */}
        <Field label="Label">
          <input
            type="text"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setDirty(true); }}
            className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="Field label…"
          />
        </Field>

        {/* Description */}
        {meta.hasDescription && (
          <Field label="Description / Helper text">
            <input
              type="text"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
              className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Optional helper text…"
            />
          </Field>
        )}

        {/* Placeholder */}
        {meta.hasPlaceholder && (
          <Field label="Placeholder">
            <input
              type="text"
              value={placeholder}
              onChange={(e) => { setPlaceholder(e.target.value); setDirty(true); }}
              className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Input placeholder…"
            />
          </Field>
        )}

        {/* Options (select / multi_select) */}
        {meta.hasOptions && (
          <Field label="Options">
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-300 cursor-move shrink-0">drag_indicator</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = e.target.value;
                      setOptions(next);
                      setDirty(true);
                    }}
                    className="flex-1 bg-white border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => { setOptions(options.filter((_, idx) => idx !== i)); setDirty(true); }}
                    className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
              <button
                onClick={() => { setOptions([...options, `Option ${options.length + 1}`]); setDirty(true); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add option
              </button>
            </div>
          </Field>
        )}

        {/* Rating scale preview */}
        {field.type === "rating" && (
          <Field label="Rating scale">
            <div className="flex items-center gap-1.5 py-1">
              {[1,2,3,4,5].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-[22px] text-amber-400">star</span>
                  <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-geist-mono)" }}>{n}</span>
                </div>
              ))}
            </div>
          </Field>
        )}

        {/* Date preview */}
        {field.type === "date" && (
          <Field label="Date format">
            <div className="flex items-center gap-2 py-1 px-3 bg-slate-50 border border-border rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-purple-500">calendar_today</span>
              <span className="text-sm text-slate-500" style={{ fontFamily: "var(--font-geist-mono)" }}>MM / DD / YYYY</span>
            </div>
          </Field>
        )}

        {/* Checkbox preview */}
        {field.type === "checkbox" && (
          <Field label="Appearance">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-5 h-5 rounded border-2 border-green-500 bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-green-500">check</span>
              </div>
              <span className="text-sm text-slate-600">Yes / Checked</span>
            </label>
          </Field>
        )}

        {/* Required toggle */}
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] font-medium text-foreground" style={{ fontFamily: "var(--font-geist-mono)" }}>
            Required field
          </span>
          <button
            onClick={() => { setIsRequired(!isRequired); setDirty(true); }}
            className="w-10 h-[22px] rounded-full relative transition-colors"
            style={{ background: isRequired ? "#f97316" : "#e2e8f0" }}
            title={isRequired ? "Required: ON" : "Required: OFF"}
          >
            <div
              className="absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-all"
              style={{ left: isRequired ? "calc(100% - 19px)" : "3px" }}
            />
          </button>
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-between gap-2">
        <button
          onClick={handleDelete}
          disabled={deleteFieldMutation.isPending}
          className="text-[12px] text-red-500 hover:text-red-600 hover:underline transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          Delete
        </button>
        <button
          onClick={handleSave}
          disabled={!dirty || updateField.isPending}
          className="px-4 py-1.5 bg-orange-500 text-white text-[12px] font-semibold rounded-lg hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {updateField.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared label wrapper ─────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground block" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}