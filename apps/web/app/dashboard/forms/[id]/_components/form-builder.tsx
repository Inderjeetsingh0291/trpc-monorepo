"use client"

import { useState } from "react"
import { trpc } from "~/trpc/client"
import { BuilderHeader } from "~/components/builder/header"
import { BuilderToolbar } from "~/components/builder/toolbar"
import { BuilderInsertPanel } from "~/components/builder/insert-panel"
import { BuilderInspector } from "~/components/builder/inspector"
import { FormSettingsPanel } from "~/components/builder/form-settings-panel"
import { ViewToggle, useBuilderView } from "~/components/builder/view-toggle"
import { FlowCanvas } from "~/components/builder/Flow-view/flow-canvas"
import { SortableFieldList } from "~/components/builder/sortable-field-list"
import { useUndoRedo } from "~/components/builder/use-undo-redo"
import { PreviewModal } from "~/components/builder/preview-modal"

// Field types not yet supported by the backend
const UNSUPPORTED_TYPES = ["welcome", "logic"]

export function FormBuilder({ formId }: { formId: string }) {
  const [view, setView] = useBuilderView()
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [autoSave, setAutoSave] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<"blocks" | "canvas" | "settings">("canvas")
  
  const { data: formResp, error: formError, isError: isFormError } = trpc.form.getFormById.useQuery({ formId }, { retry: false })
  const { data: fieldsResp, error: fieldsError, isError: isFieldsError } = trpc.form.getFields.useQuery({ formId }, { retry: false })
  
  const form = formResp?.form
  const fields = fieldsResp?.fields
  const isError = isFormError || isFieldsError
  const errorMessage = formError?.message || fieldsError?.message

  const utils = trpc.useUtils()
  const createField = trpc.form.createField.useMutation({
    onSuccess: () => utils.form.getFields.invalidate(),
  })
  const deleteField = trpc.form.deleteField.useMutation({
    onSuccess: () => utils.form.getFields.invalidate(),
  })
  
  const handleAddField = (fieldType: string) => {
    if (UNSUPPORTED_TYPES.includes(fieldType)) {
      alert(`"${fieldType}" blocks are coming soon!`)
      return
    }
    const countOfType = fields ? fields.filter((f) => f.type === fieldType).length + 1 : 1
    const baseName = fieldType.replace(/_/g, " ")
    const formattedName = baseName.charAt(0).toUpperCase() + baseName.slice(1)
    const label = countOfType > 1 ? `${formattedName} ${countOfType}` : formattedName
    const newIndex = fields ? (fields.length + 1).toFixed(2) : "1.00"

    createField.mutate({
      formId,
      label,
      type: fieldType as any,
      index: newIndex,
      isRequired: false,
    })

    // On mobile, switch back to canvas tab after adding a block
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileTab("canvas")
    }
  }

  const handleDeleteField = (fieldId: string) => {
    deleteField.mutate({ fieldId })
    if (selectedFieldId === fieldId) setSelectedFieldId(null)
  }

  const handleSelectField = (fieldId: string | null) => {
    setSelectedFieldId(fieldId)
    if (fieldId && typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileTab("settings")
    }
  }
  
  const { undo, redo, canUndo, canRedo } = useUndoRedo()
  
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden font-sans text-foreground">
      <BuilderHeader 
        formId={formId}
        formTitle={form?.title}
        onPreview={() => setIsPreviewOpen(true)}
        autoSave={autoSave}
        onToggleAutoSave={() => setAutoSave(!autoSave)}
      />
      
      {/* Mobile Top Tab Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-b border-border bg-background mt-16 h-10 px-2 shrink-0 z-40">
        <button
          onClick={() => setMobileTab("blocks")}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md transition-colors ${
            mobileTab === "blocks" ? "bg-orange-50 text-orange-600 border border-orange-200" : "text-muted-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">add_box</span>
          Blocks
        </button>
        <button
          onClick={() => setMobileTab("canvas")}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md transition-colors ${
            mobileTab === "canvas" ? "bg-orange-50 text-orange-600 border border-orange-200" : "text-muted-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">edit_note</span>
          Editor
        </button>
        <button
          onClick={() => setMobileTab("settings")}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md transition-colors relative ${
            mobileTab === "settings" ? "bg-orange-50 text-orange-600 border border-orange-200" : "text-muted-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {selectedFieldId ? "tune" : "settings"}
          </span>
          {selectedFieldId ? "Inspector" : "Settings"}
          {selectedFieldId && (
            <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-1 right-1" />
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden mt-0 md:mt-16 relative">
        {/* Left narrow toolbar: desktop only */}
        <div className="hidden md:block">
          <BuilderToolbar 
            view={view}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onPreview={() => setIsPreviewOpen(true)}
          />
        </div>
        
        {/* Insert panel: visible on desktop or when 'blocks' tab is selected on mobile */}
        <div className={`${mobileTab === "blocks" ? "block w-full md:w-[200px]" : "hidden md:block w-[200px]"} h-full shrink-0`}>
          <BuilderInsertPanel onAddBlock={handleAddField} view={view} />
        </div>
        
        {/* Main canvas area: visible on desktop or when 'canvas' tab is selected on mobile */}
        <main className={`flex-1 relative flex-col bg-slate-50 overflow-hidden ${mobileTab === "canvas" ? "flex" : "hidden md:flex"}`}>
          {/* View toggle — overlaid top-left of the canvas */}
          <div className="absolute top-3 left-3 z-40">
            <ViewToggle value={view} onChange={setView} />
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {view === "form" ? (
              /* ── Form (list) view ── */
              <div className="absolute inset-0 overflow-y-auto">
                <div className="pt-16 md:pt-20 pb-20 px-4 md:px-8 max-w-3xl mx-auto min-h-full">
                  {fields && fields.length > 0 ? (
                    <SortableFieldList 
                      fields={fields as any}
                      formId={formId}
                      selectedFieldId={selectedFieldId}
                      onSelectField={handleSelectField}
                      onDeleteField={handleDeleteField}
                    />
                  ) : fields !== undefined ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-orange-400 text-3xl">add_box</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">No fields yet</p>
                      <p className="text-xs text-slate-400" style={{ fontFamily: "var(--font-geist-mono)" }}>
                        Click a block on the left to add your first field
                      </p>
                    </div>
                  ) : isError ? (
                    /* Error state */
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-red-400 text-3xl">error_outline</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Failed to load form</p>
                      <p className="text-xs text-slate-400 mb-4 max-w-xs" style={{ fontFamily: "var(--font-geist-mono)" }}>
                        {errorMessage || "Form not found or invalid ID."}
                      </p>
                      <a
                        href="/dashboard/forms"
                        className="inline-flex items-center text-xs font-semibold text-orange-600 hover:underline"
                      >
                        ← Return to My Forms
                      </a>
                    </div>
                  ) : (
                    /* Loading */
                    <div className="flex justify-center mt-20">
                      <span className="text-[12px] text-muted-foreground" style={{ fontFamily: "var(--font-geist-mono)" }}>
                        Loading fields...
                      </span>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              /* ── Canvas (flow) view ── */
              <FlowCanvas
                fields={fields as any}
                formTitle={form?.title}
                formId={formId}
                onAddField={handleAddField}
                onDeleteField={handleDeleteField}
                onSelectField={handleSelectField}
                selectedFieldId={selectedFieldId}
              />
            )}
          </div>
        </main>
        
        {/* Right panel: Inspector OR Form Settings (visible on desktop or when 'settings' tab is selected on mobile) */}
        <div className={`${mobileTab === "settings" ? "block w-full md:w-[260px]" : "hidden md:block w-[260px]"} h-full bg-background border-l border-border flex-col z-30 shrink-0`}>
          {selectedFieldId ? (
            /* Inspector panel with a close button */
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-orange-500">tune</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground" style={{ fontFamily: "var(--font-geist-mono)" }}>
                    Inspector
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFieldId(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Close inspector"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                <BuilderInspector
                  fieldId={selectedFieldId!}
                  formId={formId}
                  onDelete={(id) => {
                    handleDeleteField(id)
                    setSelectedFieldId(null)
                  }}
                />
              </div>
            </div>
          ) : (
            /* Form settings panel */
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-orange-500">settings</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-foreground" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  Form Settings
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden">
                <FormSettingsPanel formId={formId} />
              </div>
            </div>
          )}
        </div>
      </div>

      <PreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formTitle={form?.title}
        fields={fields as any}
        layout={(form as any)?.layout ?? "step"}
      />
    </div>
  )
}
