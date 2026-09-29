"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, FileTextIcon, CalendarIcon, UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { Spinner } from "~/components/ui/spinner"
import { useCreateForm } from "~/hooks/api/form"

interface CreateFormDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function CreateFormDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: CreateFormDialogProps = {}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (setControlledOpen ?? (() => {})) : setInternalOpen

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [maxResponses, setMaxResponses] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  const { createFormAsync, isPending } = useCreateForm()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("create") === "true" || params.get("createForm") === "true") {
        setOpen(true)
      }
    }
  }, [setOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Form title is required")
      return
    }

    try {
      const res = await createFormAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        maxResponses: maxResponses ? parseInt(maxResponses, 10) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      })

      toast.success("Form created successfully!")
      resetForm()
      setOpen(false)

      if (res?.formId) {
        router.push(`/dashboard/forms/${res.formId}`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create form. Please try again.")
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setMaxResponses("")
    setExpiresAt("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            id="create-form-button"
            className="rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] gap-2"
            style={{
              background: "linear-gradient(135deg, oklch(0.5 0.14 145), oklch(0.58 0.15 155))",
              border: "none",
            }}
          >
            <FileTextIcon className="size-4" />
            New Form
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="rounded-2xl sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-xl shadow-sm text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, oklch(0.5 0.14 145), oklch(0.58 0.15 155))",
                }}
              >
                <FileTextIcon className="size-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Create New Form</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Build a customizable form to collect leads, feedback, surveys, or registrations.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-title" className="text-xs font-semibold">
                Form Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="form-title"
                placeholder="e.g. Community Feedback Survey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={55}
                required
                className="rounded-xl h-10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-desc" className="text-xs font-semibold">
                Description (Optional)
              </Label>
              <Textarea
                id="form-desc"
                placeholder="Brief introduction or purpose of this form..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={55}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-max-resp" className="text-xs font-semibold flex items-center gap-1.5">
                  <UsersIcon className="size-3.5 text-muted-foreground" />
                  Max Responses
                </Label>
                <Input
                  id="form-max-resp"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={maxResponses}
                  onChange={(e) => setMaxResponses(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="form-expiry" className="text-xs font-semibold flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5 text-muted-foreground" />
                  Expiry Date
                </Label>
                <Input
                  id="form-expiry"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="rounded-xl font-semibold text-white shadow-md gap-2"
              style={{
                background: "linear-gradient(135deg, oklch(0.5 0.14 145), oklch(0.58 0.15 155))",
              }}
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  Creating Form...
                </>
              ) : (
                <>
                  <FileTextIcon className="size-4" />
                  Create & Open Builder
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
