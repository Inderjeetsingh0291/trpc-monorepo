"use client";

import { useState } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";

export function BuilderHeader({
  formId,
  formTitle,
  onPreview,
  autoSave,
  onToggleAutoSave,
}: {
  formId: string;
  formTitle?: string;
  onPreview?: () => void;
  autoSave?: boolean;
  onToggleAutoSave?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const { data: formResponse } = trpc.form.getFormById.useQuery(
    { formId },
    { enabled: !!formId },
  );
  const form = formResponse?.form;

  const utils = trpc.useUtils();
  const toggleFormStatus = trpc.form.toggleFormStatus.useMutation({
    onSuccess: (data) => {
      utils.form.getFormById.invalidate();
      if (data.isActive) {
        toast.success("Form published! Anyone with the link can now respond.");
      } else {
        toast.success("Form unpublished.");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const isPublished = form?.isActive;
  const formUrl =
    typeof window !== "undefined" && form?.id
      ? `${window.location.origin}/form/${form.id}`
      : "";

  const handleShare = () => {
    if (!isPublished) {
      toast.error("Publish the form first to get a shareable link.");
      return;
    }
    if (formUrl) {
      navigator.clipboard.writeText(formUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePublish = () => {
    if (formId) {
      toggleFormStatus.mutate({ formId, isActive: true, visibility: "public" });
    }
  };

  const handleUnpublish = () => {
    if (formId) {
      toggleFormStatus.mutate({ formId, isActive: false });
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-background border-b border-border flex items-center justify-between px-3 md:px-6 z-50">
      {/* Left: Logo + Breadcrumb */}
      <div className="flex items-center gap-2 md:gap-4">
        <a href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-orange-500 shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="2" y="2" width="6" height="6" rx="1" fill="#ffffff" />
              <rect x="10" y="2" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
              <rect x="2" y="10" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
              <rect x="10" y="10" width="6" height="6" rx="1" fill="#ffffff" />
            </svg>
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight text-orange-500 hidden sm:inline-block" style={{ fontFamily: "var(--font-geist-sans)" }}>
            MakeForms
          </span>
        </a>
        <div className="h-5 w-[1px] bg-border hidden md:block" />
        <nav className="hidden md:flex items-center gap-2 text-[12px] text-muted-foreground truncate max-w-[200px]" style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>
          <a href="/dashboard" className="hover:text-orange-500 transition-colors">Dashboard</a>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium truncate">{formTitle ?? "Loading..."}</span>
        </nav>
      </div>

      {/* Center: Tabs */}
      <div className="flex items-center gap-3 md:gap-6">
        <span className="text-[12px] font-medium text-orange-500 border-b-2 border-orange-500 pb-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
          Builder
        </span>
        <button
          onClick={onPreview}
          className="text-[12px] font-medium text-muted-foreground hover:text-orange-500 pb-1 transition-all"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          Preview
        </button>
        {formId && (
          <a
            href={`/dashboard/forms/${formId}/submissions`}
            className="text-[12px] font-medium text-muted-foreground hover:text-orange-500 pb-1 transition-all hidden sm:inline-block"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            Responses
          </a>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {isPublished && (
          <span className="text-[11px] text-green-500 flex items-center gap-1 hidden sm:flex">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Live
          </span>
        )}

        {/* Share / Copy link button */}
        <button
          onClick={handleShare}
          disabled={!isPublished}
          className="px-2.5 md:px-4 py-1.5 bg-background text-foreground text-[12px] font-medium rounded border border-border hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          style={{ fontFamily: "var(--font-geist-mono)" }}
          title={isPublished ? "Copy shareable link" : "Publish first to share"}
        >
          <span className="material-symbols-outlined text-[14px]">
            {copied ? "check" : "content_copy"}
          </span>
          <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
        </button>

        {/* Auto-save toggle */}
        <div className="hidden sm:flex items-center gap-2 px-2 border-r border-border">
          <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-geist-mono)" }}>Auto-save</span>
          <button
            onClick={onToggleAutoSave}
            className="w-8 h-[18px] rounded-full relative transition-colors"
            style={{ background: autoSave ? "#f97316" : "#e2e8f0" }}
            title={autoSave ? "Auto-save ON" : "Auto-save OFF"}
          >
            <div
              className="absolute top-[3px] w-3 h-3 bg-white rounded-full transition-all shadow-sm"
              style={{ left: autoSave ? "calc(100% - 15px)" : "3px" }}
            />
          </button>
        </div>

        {/* Publish / Unpublish button */}
        {isPublished ? (
          <button
            onClick={handleUnpublish}
            disabled={toggleFormStatus.isPending}
            className="px-2.5 md:px-4 py-1.5 bg-slate-100 text-slate-600 text-[12px] font-medium rounded hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {toggleFormStatus.isPending ? "..." : "Unpublish"}
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={toggleFormStatus.isPending}
            className="px-2.5 md:px-4 py-1.5 bg-orange-500 text-white text-[12px] font-medium rounded hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {toggleFormStatus.isPending ? "..." : "Publish"}
          </button>
        )}
      </div>
    </header>
  );
}