"use client"

import { useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { useGetFields, useCreateField, useDeleteField } from "~/hooks/api/form-field"
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

  const [open, setOpen] = useState(false)
  
  // New field state
  const [label, setLabel] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<FieldType>("text")
  const [isRequired, setIsRequired] = useState(false)

  const { createFieldAsync, isPending: isCreating } = useCreateField()

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
                
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteField(field.id)}
                  disabled={isDeleting}
                >
                  <Trash2Icon className="size-4" />
                  <span className="sr-only">Delete Field</span>
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
