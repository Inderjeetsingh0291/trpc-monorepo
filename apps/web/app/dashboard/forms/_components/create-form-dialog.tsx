"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
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

export function CreateFormDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const { createFormAsync, isPending } = useCreateForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    try {
      await createFormAsync({
        title: title.trim(),
        description: description.trim() || undefined,
      })
      toast.success("Form created successfully!")
      setTitle("")
      setDescription("")
      setOpen(false)
    } catch {
      toast.error("Failed to create form. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          id="create-form-button"
          className="rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            border: "none",
          }}
        >
          <PlusIcon className="mr-2 size-4" />
          Create Form
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl sm:max-w-md">
        <form onSubmit={handleSubmit}>
          {/* Dialog header with saffron accent */}
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="flex size-9 items-center justify-center rounded-xl shadow"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                }}
              >
                <PlusIcon className="size-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Create a new form</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Give your form a title and optional description.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="form-title" className="font-semibold text-foreground/80">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="form-title"
                placeholder="e.g. Customer Feedback Survey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={55}
                autoFocus
                disabled={isPending}
                className="h-11 rounded-xl border-border/60 bg-background/80 transition-all focus:border-[oklch(0.62_0.19_48)] focus:ring-[oklch(0.62_0.19_48)/30%]"
              />
              <p className="text-xs text-muted-foreground/70 text-right">
                {title.length}/55
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="form-description" className="font-semibold text-foreground/80">
                Description{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="form-description"
                placeholder="Briefly describe what this form is for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={55}
                rows={3}
                disabled={isPending}
                className="rounded-xl border-border/60 bg-background/80 resize-none transition-all focus:border-[oklch(0.62_0.19_48)] focus:ring-[oklch(0.62_0.19_48)/30%]"
              />
              <p className="text-xs text-muted-foreground/70 text-right">
                {description.length}/55
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              id="submit-create-form"
              type="submit"
              disabled={isPending || !title.trim()}
              className="rounded-xl font-semibold text-white min-w-[110px]"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                border: "none",
                opacity: isPending || !title.trim() ? 0.7 : 1,
              }}
            >
              {isPending ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                "Create Form"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
