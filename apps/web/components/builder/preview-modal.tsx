"use client";

import { useState } from "react";
// import { TerminalForm } from "~/app/terminal-theme-preview/components/terminal-form";
const THEMES = [
  { id: "default", label: "Default", color: "#f97316" }, // orange-500
  { id: "terminal", label: "Terminal", color: "#22c55e" }
];

interface PreviewField {
  id: string;
  label: string;
  description: string | null;
  fieldType: string;
  placeholder: string | null;
  options?: unknown;
  required: boolean;
  position: number;
}

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  formTitle?: string;
  fields: PreviewField[] | undefined;
}

type Device = "desktop" | "tablet" | "mobile";
type Zoom = 0.75 | 1 | 1.25;

const DEVICE_SIZES = {
  desktop: { w: 1024, h: 640, label: "Desktop", icon: "laptop_mac" },
  tablet: { w: 768, h: 500, label: "Tablet", icon: "tablet_mac" },
  mobile: { w: 375, h: 680, label: "Mobile", icon: "phone_iphone" },
};

export function PreviewModal({ open, onClose, formTitle, fields }: PreviewModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [device, setDevice] = useState<Device>("desktop");
  const [zoom, setZoom] = useState<Zoom>(0.75);
  const [theme, setTheme] = useState<string>("default");

  if (!open) return null;

  const totalSteps = fields?.length ?? 0;
  const currentField = fields?.[currentStep];
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const deviceInfo = DEVICE_SIZES[device];

  const handleNext = () => { if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1); };
  const handleBack = () => { setCurrentStep(s => Math.max(0, s - 1)); };
  const handleReset = () => { setCurrentStep(0); };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "radial-gradient(ellipse at 50% 30%, #f8fafc 0%, #cbd5e1 100%)" }}>
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shrink-0 shadow-sm">
        {/* Left: title */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[16px] text-orange-500">visibility</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700" style={{ fontFamily: "var(--font-geist-mono)" }}>
            Preview
          </span>
          <span className="text-[10px] text-slate-400">—</span>
          <span className="text-[11px] text-slate-600" style={{ fontFamily: "var(--font-geist-mono)" }}>{formTitle ?? "Untitled"}</span>
        </div>

        {/* Center: Device switcher */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
          {(["desktop", "tablet", "mobile"] as Device[]).map(d => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-medium transition-all"
              style={{
                fontFamily: "var(--font-geist-mono)",
                background: device === d ? "white" : "transparent",
                color: device === d ? "#f97316" : "#64748b",
                border: device === d ? "1px solid #e2e8f0" : "1px solid transparent",
                boxShadow: device === d ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              <span className="material-symbols-outlined text-[14px]">{DEVICE_SIZES[d].icon}</span>
              {DEVICE_SIZES[d].label}
            </button>
          ))}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* Theme selector */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
            {THEMES.slice(0, 6).map((t: { id: string, label: string, color: string }) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className="w-4 h-4 rounded-full transition-all"
                style={{ background: t.color, opacity: theme === t.id ? 1 : 0.35, transform: theme === t.id ? "scale(1.3)" : "scale(1)", border: theme === t.id ? "2px solid #0f172a" : "none" }}
              />
            ))}
          </div>
          {/* Zoom */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
            {([0.75, 1, 1.25] as Zoom[]).map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className="px-2 py-0.5 rounded text-[9px] font-medium transition-colors"
                style={{ fontFamily: "var(--font-geist-mono)", color: zoom === z ? "#f97316" : "#64748b", background: zoom === z ? "white" : "transparent", boxShadow: zoom === z ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}
              >
                {Math.round(z * 100)}%
              </button>
            ))}
          </div>
          {/* Restart */}
          <button onClick={handleReset} className="p-1.5 rounded-md hover:bg-slate-100 transition-colors" title="Restart">
            <span className="material-symbols-outlined text-[16px] text-slate-500 hover:text-orange-500">refresh</span>
          </button>
          {/* Close */}
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 transition-colors" title="Close">
            <span className="material-symbols-outlined text-[16px] text-slate-500">close</span>
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
        <div style={{ transform: `scale(${zoom})`, transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
          {theme === "terminal" ? (
            <div className="text-slate-900 p-4 font-mono border border-green-500 bg-black/5">Terminal theme preview unavailable</div>
          ) : (
            <>
              {device === "desktop" && <DesktopFrame progress={progress}><FormContent field={currentField} fields={fields} step={currentStep} total={totalSteps} onNext={handleNext} onBack={handleBack} /></DesktopFrame>}
              {device === "tablet" && <TabletFrame><FormContent field={currentField} fields={fields} step={currentStep} total={totalSteps} onNext={handleNext} onBack={handleBack} /></TabletFrame>}
              {device === "mobile" && <MobileFrame progress={progress}><FormContent field={currentField} fields={fields} step={currentStep} total={totalSteps} onNext={handleNext} onBack={handleBack} /></MobileFrame>}
            </>
          )}
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="h-8 flex items-center justify-center gap-6 border-t border-slate-200 bg-white/80 backdrop-blur-md shrink-0">
        <span className="text-[9px] text-slate-500" style={{ fontFamily: "var(--font-geist-mono)" }}>{deviceInfo.label}</span>
        <span className="text-[9px] text-slate-300">•</span>
        <span className="text-[9px] text-slate-500" style={{ fontFamily: "var(--font-geist-mono)" }}>{deviceInfo.w} × {deviceInfo.h}</span>
        <span className="text-[9px] text-slate-300">•</span>
        <span className="text-[9px] text-slate-500" style={{ fontFamily: "var(--font-geist-mono)" }}>Step {currentStep + 1} / {totalSteps || 1}</span>
      </div>
    </div>
  );
}

// ─── Device Frames ───────────────────────────────────────────────────────────

function DesktopFrame({ children, progress }: { children: React.ReactNode; progress: number }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ width: 900, border: "1px solid #cbd5e1", boxShadow: "0 20px 80px rgba(0,0,0,0.15)" }}>
      {/* Browser chrome */}
      <div className="h-9 bg-slate-100 border-b border-slate-200 flex items-center px-3 gap-3">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        {/* URL bar */}
        <div className="flex-1 h-5 bg-white rounded-md flex items-center px-3 border border-slate-200 shadow-sm">
          <span className="material-symbols-outlined text-[10px] text-slate-400 mr-1.5">lock</span>
          <span className="text-[9px] text-slate-500" style={{ fontFamily: "var(--font-geist-mono)" }}>makeforms.io/form/your-form</span>
        </div>
      </div>
      {/* Progress */}
      <div className="h-[2px] bg-slate-100"><div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      {/* Content */}
      <div className="bg-white h-[520px] overflow-auto">{children}</div>
    </div>
  );
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] overflow-hidden bg-white shadow-2xl" style={{ width: 740, border: "8px solid #0f172a", boxShadow: "0 20px 80px rgba(0,0,0,0.15), inset 0 0 0 1px #cbd5e1" }}>
      <div className="bg-white h-[480px] overflow-auto rounded-[12px]">{children}</div>
    </div>
  );
}

function MobileFrame({ children, progress }: { children: React.ReactNode; progress: number }) {
  return (
    <div className="relative rounded-[40px] overflow-hidden bg-white shadow-2xl" style={{ width: 340, border: "10px solid #0f172a", boxShadow: "0 20px 80px rgba(0,0,0,0.15), inset 0 0 0 1px #cbd5e1" }}>
      {/* Dynamic island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-full z-20 border border-slate-800" />
      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-slate-100"><div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      {/* Content */}
      <div className="bg-white h-[620px] overflow-auto pt-8 pb-6 rounded-[30px]">{children}</div>
      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-300 rounded-full" />
    </div>
  );
}

// ─── Form Content ─────────────────────────────────────────

function FormContent({ field, fields, step, total, onNext, onBack }: { field: PreviewField | undefined; fields: PreviewField[] | undefined; step: number; total: number; onNext: () => void; onBack: () => void }) {
  if (!fields || fields.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="material-symbols-outlined text-[32px] text-slate-300 mb-2 block">draft</span>
          <p className="text-[13px] text-slate-500">No fields to preview</p>
        </div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="material-symbols-outlined text-[40px] text-green-500 mb-2 block">task_alt</span>
          <p className="text-[16px] font-medium text-slate-900">Thank you!</p>
          <p className="text-[12px] text-slate-500 mt-1">Response submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-8 py-8">
      <p className="text-[10px] text-slate-400 mb-4 font-semibold tracking-wider uppercase" style={{ fontFamily: "var(--font-geist-mono)" }}>Step {step + 1} of {total}</p>
      <h2 className="text-[24px] font-semibold text-slate-900 mb-2 leading-tight" style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.01em" }}>
        {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
      </h2>
      {field.description && <p className="text-[13px] text-slate-500 mb-6">{field.description}</p>}
      <div className="flex-1 flex flex-col justify-center"><PreviewFieldInput field={field} /></div>
      {/* Nav */}
      <div className="flex items-center justify-between pt-6 mt-auto">
        <button onClick={onBack} disabled={step === 0} className="flex items-center gap-1 px-4 py-2.5 text-[12px] font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>Back
        </button>
        <button onClick={onNext} disabled={step >= total - 1} className="flex items-center gap-1 px-6 py-2.5 text-[12px] font-semibold text-white bg-orange-500 rounded-xl shadow-sm hover:brightness-110 transition-all disabled:opacity-50">
          Next<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

// ─── Field Input Previews ────────────────────────────────────────

function PreviewFieldInput({ field }: { field: PreviewField }) {
  const options = (field.options as Array<{ label: string; value: string }>) ?? [];
  switch (field.fieldType) {
    case "text": case "email": case "number": case "phone":
      return <input type={field.fieldType === "email" ? "email" : field.fieldType === "number" ? "number" : field.fieldType === "phone" ? "tel" : "text"} placeholder={field.placeholder ?? "Type your answer..."} disabled className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-[14px] text-slate-900 shadow-sm placeholder:text-slate-400" style={{ fontFamily: "var(--font-geist-sans)" }} />;
    case "textarea":
      return <textarea placeholder={field.placeholder ?? "Type your answer..."} disabled rows={4} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-[14px] text-slate-900 shadow-sm placeholder:text-slate-400 resize-none" style={{ fontFamily: "var(--font-geist-sans)" }} />;
    case "select":
      return <div className="space-y-3">{options.map((opt, i) => (<div key={i} className="flex items-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl bg-white shadow-sm"><div className="w-5 h-5 rounded-full border-2 border-slate-300"/><span className="text-[14px] text-slate-700">{opt.label}</span></div>))}</div>;
    case "multi_select":
      return <div className="space-y-3">{options.map((opt, i) => (<div key={i} className="flex items-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl bg-white shadow-sm"><div className="w-5 h-5 rounded border-2 border-slate-300"/><span className="text-[14px] text-slate-700">{opt.label}</span></div>))}</div>;
    case "rating":
      return <div className="flex gap-2 py-2">{[1,2,3,4,5].map(n => (<div key={n} className="w-12 h-12 rounded-full border-2 border-slate-200 shadow-sm flex items-center justify-center text-[16px] font-semibold text-slate-500 bg-white">{n}</div>))}</div>;
    case "checkbox":
      return <div className="flex items-center gap-3 px-4 py-4 border-2 border-slate-200 rounded-xl bg-white shadow-sm"><div className="w-6 h-6 rounded border-2 border-slate-300"/><span className="text-[14px] font-medium text-slate-700">Yes, I agree</span></div>;
    case "date":
      return <input type="date" disabled className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-[14px] text-slate-500 shadow-sm" />;
    default:
      return <input type="text" placeholder="Answer..." disabled className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-[14px] text-slate-900 shadow-sm placeholder:text-slate-400" />;
  }
}