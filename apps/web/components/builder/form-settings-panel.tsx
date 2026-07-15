"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";

interface FormSettingsPanelProps {
  formId: string;
}

/**
 * Form-level settings panel shown in the inspector when no field is selected.
 * Allows editing: title, description, visibility, expiry, response limit, slug.
 */
export function FormSettingsPanel({ formId }: FormSettingsPanelProps) {
  const { data: formResp } = trpc.form.getFormById.useQuery({ formId });
  const form = formResp?.form;
  // const { data: themes } = trpc.themes.list.useQuery();
  const utils = trpc.useUtils();

  const updateForm = trpc.form.toggleFormStatus.useMutation({
    onSuccess: () => {
      utils.form.getFormById.invalidate();
      toast.success("Settings saved");
    },
  });

  const updateVisibility = trpc.form.toggleFormStatus.useMutation({
    onSuccess: () => {
      utils.form.getFormById.invalidate();
      toast.success("Visibility updated");
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [responseLimit, setResponseLimit] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Sync form data into local state
  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description ?? "");
      setVisibility(form.visibility as "public" | "unlisted");
      setResponseLimit(form.maxResponses?.toString() ?? "");
      setExpiresAt(form.expiresAt ? new Date(form.expiresAt).toISOString().split("T")[0] ?? "" : "");
      setPassword("");
    }
  }, [form]);

  if (!form) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[12px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleSave = () => {
    updateForm.mutate({
      formId,
      isActive: form.isActive ?? true,
      visibility,
    });
  };

  const handleVisibilityChange = (v: "public" | "unlisted") => {
    setVisibility(v);
    updateVisibility.mutate({ formId, isActive: form.isActive ?? true, visibility: v });
  };

  const slug = form.id;
  const formUrl = typeof window !== "undefined" ? `${window.location.origin}/form/${slug}` : "";

  return (
    <div className="space-y-5">
      {/* Form title */}
      <Section label="Title">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-50 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      </Section>

      {/* Description */}
      <Section label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Optional description..."
          className="w-full bg-slate-50 border border-border rounded-lg px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        />
      </Section>

      {/* Slug / Share link */}
      <Section label="Share Link">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-slate-50 border border-border rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground truncate" style={{ fontFamily: "var(--font-geist-mono)" }}>
            /form/{slug}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(formUrl)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-orange-500 hover:border-orange-500 transition-colors bg-background"
            title="Copy link"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
          </button>
        </div>
      </Section>

      {/* QR Code */}
      {formUrl && (
        <Section label="QR Code">
          <div className="flex flex-col items-center gap-2 p-3 bg-white border border-border rounded-xl">
            <QRCodeSVG
              value={formUrl}
              size={140}
              bgColor="#ffffff"
              fgColor="#0a0a0f"
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-[9px] text-muted-foreground text-center mt-1.5" style={{ fontFamily: "var(--font-geist-mono)" }}>
            Scan to open form
          </p>
        </Section>
      )}

      {/* Visibility */}
      <Section label="Visibility">
        <div className="flex gap-2">
          <VisibilityOption
            active={visibility === "public"}
            onClick={() => handleVisibilityChange("public")}
            icon="public"
            label="Public"
            description="Visible in explore"
          />
          <VisibilityOption
            active={visibility === "unlisted"}
            onClick={() => handleVisibilityChange("unlisted")}
            icon="link"
            label="Unlisted"
            description="Link only"
          />
        </div>
      </Section>

      {/* Response Limit */}
      <Section label="Response Limit">
        <input
          type="number"
          value={responseLimit}
          onChange={(e) => setResponseLimit(e.target.value)}
          placeholder="Unlimited"
          min={1}
          className="w-full bg-slate-50 border border-border rounded-lg px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        />
      </Section>

      {/* Expiry */}
      <Section label="Expires At">
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full bg-slate-50 border border-border rounded-lg px-3 py-2 text-[12px] text-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        />
      </Section>

      {/* Password Protection */}
      <Section label="Password Protection">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave empty for no password"
          className="w-full bg-slate-50 border border-border rounded-lg px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        />
        <p className="text-[9px] text-muted-foreground mt-1">Respondents must enter this password to access the form.</p>
      </Section>

      {/* ── Form Open / Closed toggle ── */}
      <Section label="Form Status">
        <div className={`rounded-xl border p-3 flex items-center justify-between gap-3 transition-colors ${
          form.isActive ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[20px] ${form.isActive ? "text-green-500" : "text-red-400"}`}>
              {form.isActive ? "lock_open" : "lock"}
            </span>
            <div>
              <p className={`text-[12px] font-semibold ${form.isActive ? "text-green-700" : "text-red-700"}`}>
                {form.isActive ? "Form is Open" : "Form is Closed"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {form.isActive ? "Accepting responses" : "Not accepting responses"}
              </p>
            </div>
          </div>
          <button
            onClick={() => updateVisibility.mutate({
              formId,
              isActive: !form.isActive,
              visibility,
            })}
            disabled={updateVisibility.isPending}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50 ${
              form.isActive
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {updateVisibility.isPending ? "..." : form.isActive ? "Close Form" : "Open Form"}
          </button>
        </div>
      </Section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={updateForm.isPending}
        className="w-full bg-orange-500 text-white text-[12px] font-semibold py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-sm"
      >
        {updateForm.isPending ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-[10px] uppercase tracking-wider text-muted-foreground"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function VisibilityOption({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-2.5 rounded-lg border text-left transition-all ${
        active ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-border"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[16px] block mb-1 ${
          active ? "text-orange-500" : "text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="text-[11px] font-medium text-foreground block">{label}</span>
      <span className="text-[9px] text-muted-foreground">{description}</span>
    </button>
  );
}