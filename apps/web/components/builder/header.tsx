"use client";

import { useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { useAuth } from "@clerk/nextjs";

export function BuilderHeader({ formTitle, onPreview, autoSave, onToggleAutoSave }: { formTitle?: string; onPreview?: () => void; autoSave?: boolean; onToggleAutoSave?: () => void }) {
    const searchParams = useSearchParams();
    const formId = searchParams.get("formId");
    const { isSignedIn } = useAuth();

    const { data: formResponse } = trpc.form.getFormById.useQuery(
        { formId: formId! },
        { enabled: !!formId && !!isSignedIn },
    );
    const form = formResponse?.form;

    const utils = trpc.useUtils();
    const publishForm = trpc.form.toggleFormStatus.useMutation({
        onSuccess: () => utils.form.getFormById.invalidate(),
    });

    const slug = form?.id;
    const isPublished = form?.isActive;
    const formUrl = slug ? `${window.location.origin}/form/${slug}` : "";

    const handleShare = () => {
        if (formUrl) {
            navigator.clipboard.writeText(formUrl);
        }
    };

    const handlePublish = () => {
        if (formId) publishForm.mutate({ formId, isActive: true, visibility: "public" });
    };

    return (
        <header className="fixed top-0 right-0 left-0 h-16 bg-background border-b border-border flex items-center justify-between px-6 z-50">
            {/* Left: Logo + Breadcrumb */}
            <div className="flex items-center gap-4">
                <a href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-orange-500">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect x="2" y="2" width="6" height="6" rx="1" fill="#ffffff" />
                            <rect x="10" y="2" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
                            <rect x="2" y="10" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
                            <rect x="10" y="10" width="6" height="6" rx="1" fill="#ffffff" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-orange-500" style={{ fontFamily: "var(--font-geist-sans)" }}>
                        MakeForms
                    </span>
                </a>
                <div className="h-5 w-[1px] bg-border" />
                <nav className="flex items-center gap-2 text-[12px] text-muted-foreground" style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>
                    <a href="/dashboard" className="hover:text-orange-500 transition-colors">Dashboard</a>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-foreground font-medium">{formTitle ?? "Loading..."}</span>
                </nav>
            </div>

            {/* Center: Tabs */}
            <div className="flex items-center gap-6">
                {formId && (
                    <a
                        href={`/terminal-theme-preview?formId=${formId}`}
                        target="_blank"
                        className="text-[12px] font-medium text-muted-foreground hover:text-orange-500 pb-1 transition-all flex items-center gap-1"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                        <span className="material-symbols-outlined text-[14px]">terminal</span>
                        IDE
                    </a>
                )}
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
                        href="/dashboard/responses"
                        className="text-[12px] font-medium text-muted-foreground hover:text-orange-500 pb-1 transition-all"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                        Responses
                    </a>
                )}
                {formId && (
                    <a
                        href={`/chat-theme-preview?formId=${formId}`}
                        target="_blank"
                        className="text-[12px] font-medium text-muted-foreground hover:text-orange-500 pb-1 transition-all flex items-center gap-1"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        Chat
                    </a>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {isPublished && (
                    <span className="text-[11px] text-green-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Published
                    </span>
                )}
                <button
                    onClick={handleShare}
                    disabled={!isPublished}
                    className="px-4 py-1.5 bg-background text-foreground text-[12px] font-medium rounded border border-border hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                    title={isPublished ? "Copy form link" : "Publish first to share"}
                >
                    {isPublished ? "Copy Link" : "Share"}
                </button>
                {/* Auto-save toggle */}
                <div className="flex items-center gap-2 px-2 border-r border-border">
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
                {!isPublished && (
                    <button
                        onClick={handlePublish}
                        disabled={publishForm.isPending}
                        className="px-4 py-1.5 bg-orange-500 text-white text-[12px] font-medium rounded hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                        {publishForm.isPending ? "Publishing..." : "Publish"}
                    </button>
                )}
            </div>
        </header>
    );
}