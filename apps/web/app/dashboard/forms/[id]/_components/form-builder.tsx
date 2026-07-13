"use client"

import { useState, useEffect } from "react"
import { PlusIcon, Trash2Icon, Share2Icon, CopyIcon, ExternalLinkIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

import { useGetFields, useCreateField, useDeleteField, useUpdateField } from "~/hooks/api/form-field"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Spinner } from "~/components/ui/spinner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"

const fieldTypes = [
  "text", "number", "email", "phone", "textarea", 
  "select", "radio", "checkbox", "YES_NO", "file", "image"
] as const

type FieldType = typeof fieldTypes[number]

export function FormBuilder({ formId }: { formId: string }) {
  const { fields, isLoading, isError, error } = useGetFields(formId)
  const { deleteFieldAsync, isPending: isDeleting } = useDeleteField()
  const { updateFieldAsync, isPending: isUpdating } = useUpdateField()

  const [open, setOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/form/${formId}`)
    }
  }, [formId])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied to clipboard!")
    } catch {
      toast.error("Failed to copy link.")
    }
  }
  
  // New field state
  const [label, setLabel] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<FieldType>("text")
  const [isRequired, setIsRequired] = useState(false)

  // Edit field state
  const [editFieldId, setEditFieldId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editPlaceholder, setEditPlaceholder] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editType, setEditType] = useState<FieldType>("text")
  const [editIsRequired, setEditIsRequired] = useState(false)

  const { createFieldAsync, isPending: isCreating } = useCreateField()

  const openEditDialog = (field: NonNullable<typeof fields>[number]) => {
    setEditFieldId(field.id)
    setEditLabel(field.label)
    setEditPlaceholder(field.placeholder || "")
    setEditDescription(field.description || "")
    setEditType(field.type as FieldType)
    setEditIsRequired(field.isRequired)
  }

  const handleUpdateField = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editLabel.trim() || !editFieldId) {
      toast.error("Label is required")
      return
    }

    try {
      await updateFieldAsync({
        fieldId: editFieldId,
        label: editLabel.trim(),
        placeholder: editPlaceholder.trim() || undefined,
        description: editDescription.trim() || undefined,
        type: editType,
        isRequired: editIsRequired,
      })

      toast.success("Field updated successfully!")
      setEditFieldId(null)
    } catch {
      toast.error("Failed to update field.")
    }
  }

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!label.trim()) {
      toast.error("Label is required")
      return
    }

    try {
      // Calculate next index: just use fields length + 1 as string for now
      // A more robust implementation would properly calculate fractional indices
      const nextIndex = (fields.length + 1).toFixed(2)

      await createFieldAsync({
        formId,
        label: label.trim(),
        placeholder: placeholder.trim() || undefined,
        description: description.trim() || undefined,
        type,
        isRequired,
        index: nextIndex
      })

      toast.success("Field added successfully!")
      setLabel("")
      setPlaceholder("")
      setDescription("")
      setType("text")
      setIsRequired(false)
      setOpen(false)
    } catch {
      toast.error("Failed to create field.")
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return

    try {
      await deleteFieldAsync({ fieldId })
      toast.success("Field deleted")
    } catch {
      toast.error("Failed to delete field.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive p-8 text-center text-destructive">
        Failed to load form fields: {error?.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Form Fields</h2>
        
        <div className="flex gap-2">
          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2Icon className="mr-2 size-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Form</DialogTitle>
                <DialogDescription>
                  Anyone with this link can submit responses to your form.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-6 py-6">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <QRCodeSVG value={shareUrl} size={180} />
                </div>
                <div className="flex w-full items-center space-x-2">
                  <Input readOnly value={shareUrl} className="flex-1" />
                  <Button size="icon" onClick={copyToClipboard} variant="secondary">
                    <CopyIcon className="size-4" />
                  </Button>
                  <Button size="icon" variant="secondary" onClick={() => window.open(shareUrl, "_blank")}>
                    <ExternalLinkIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 size-4" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCreateField}>
              <DialogHeader>
                <DialogTitle>Add New Field</DialogTitle>
                <DialogDescription>
                  Configure a new field for this form.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="field-label">Label *</Label>
                  <Input 
                    id="field-label" 
                    value={label} 
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. First Name"
                    maxLength={100}
                    autoFocus
                    disabled={isCreating}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="field-type">Type *</Label>
                  <Select 
                    value={type} 
                    onValueChange={(val) => setType(val as FieldType)}
                    disabled={isCreating}
                  >
                    <SelectTrigger id="field-type">
                      <SelectValue placeholder="Select a field type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map(t => (
                        <SelectItem key={t} value={t}>
                          {t.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="field-placeholder">Placeholder</Label>
                  <Input 
                    id="field-placeholder" 
                    value={placeholder} 
                    onChange={(e) => setPlaceholder(e.target.value)}
                    placeholder="e.g. Enter your first name"
                    maxLength={100}
                    disabled={isCreating}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="field-description">Description</Label>
                  <Textarea 
                    id="field-description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Helper text for this field"
                    maxLength={255}
                    disabled={isCreating}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="field-required">Required Field</Label>
                    <p className="text-xs text-muted-foreground">
                      Must the user fill out this field?
                    </p>
                  </div>
                  <Switch 
                    id="field-required"
                    checked={isRequired}
                    onCheckedChange={setIsRequired}
                    disabled={isCreating}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!label.trim() || isCreating}
                >
                  {isCreating ? <><Spinner className="mr-2" /> Adding...</> : "Add Field"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <p className="font-medium">No fields yet</p>
          <p className="text-sm text-muted-foreground">
            Click "Add Field" to start building your form.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field, idx) => (
            <Card key={field.id} className="relative group">
              <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {idx + 1}.
                    </span>
                    <CardTitle className="text-base">{field.label}</CardTitle>
                    {field.isRequired && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                        Required
                      </Badge>
                    )}
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] uppercase">
                      {field.type}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs font-mono ml-6">
                    Key: {field.labelKey}
                  </CardDescription>
                  {field.description && (
                    <p className="text-sm text-muted-foreground ml-6 mt-1">
                      {field.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={() => openEditDialog(field)}
                    disabled={isDeleting}
                  >
                    <PencilIcon className="size-4" />
                    <span className="sr-only">Edit Field</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDeleteField(field.id)}
                    disabled={isDeleting}
                  >
                    <Trash2Icon className="size-4" />
                    <span className="sr-only">Delete Field</span>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Field Dialog */}
      <Dialog open={!!editFieldId} onOpenChange={(open) => !open && setEditFieldId(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateField}>
            <DialogHeader>
              <DialogTitle>Edit Field</DialogTitle>
              <DialogDescription>
                Make changes to this form field.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-field-label">Label *</Label>
                <Input 
                  id="edit-field-label" 
                  value={editLabel} 
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="e.g. First Name"
                  maxLength={100}
                  autoFocus
                  disabled={isUpdating}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-field-type">Type *</Label>
                <Select 
                  value={editType} 
                  onValueChange={(val) => setEditType(val as FieldType)}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="edit-field-type">
                    <SelectValue placeholder="Select a field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map(t => (
                      <SelectItem key={t} value={t}>
                        {t.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-field-placeholder">Placeholder</Label>
                <Input 
                  id="edit-field-placeholder" 
                  value={editPlaceholder} 
                  onChange={(e) => setEditPlaceholder(e.target.value)}
                  placeholder="e.g. Enter your first name"
                  maxLength={100}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-field-description">Description</Label>
                <Textarea 
                  id="edit-field-description" 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Helper text for this field"
                  maxLength={255}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-field-required">Required Field</Label>
                  <p className="text-xs text-muted-foreground">
                    Must the user fill out this field?
                  </p>
                </div>
                <Switch 
                  id="edit-field-required"
                  checked={editIsRequired}
                  onCheckedChange={setEditIsRequired}
                  disabled={isUpdating}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditFieldId(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!editLabel.trim() || isUpdating}
              >
                {isUpdating ? <><Spinner className="mr-2" /> Saving...</> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
