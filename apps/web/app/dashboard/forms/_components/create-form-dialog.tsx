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
        <Button id="create-form-button">
          <PlusIcon />
          Create Form
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new form</DialogTitle>
            <DialogDescription>
              Give your form a title and an optional description to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="form-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="form-title"
                placeholder="e.g. Customer Feedback"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={55}
                autoFocus
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/55
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                placeholder="Briefly describe what this form is for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={55}
                rows={3}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/55
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              id="submit-create-form"
              type="submit"
              disabled={isPending || !title.trim()}
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
