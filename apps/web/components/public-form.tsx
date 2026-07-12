"use client"

import { useState } from "react"
import { useGetFormById } from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Spinner } from "~/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { toast } from "sonner"

export function PublicForm({ formId }: { formId: string }) {
  const { form, isLoading, isError, error } = useGetFormById(formId)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (isError || !form) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="rounded-lg border border-destructive p-8 text-center text-destructive max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Form not found</h2>
          <p>{error?.message || "This form may have been deleted or does not exist."}</p>
        </div>
      </div>
    )
  }

  if (!form.isActive) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="rounded-lg border p-8 text-center max-w-md w-full bg-muted/50">
          <h2 className="text-xl font-bold mb-2">Form Inactive</h2>
          <p className="text-muted-foreground">This form is no longer accepting responses.</p>
        </div>
      </div>
    )
  }

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Submitting form data:", formData)
      toast.success("Form submitted successfully!")
      
      // Reset form
      setFormData({})
    } catch (err) {
      toast.error("Failed to submit form.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFieldInput = (field: NonNullable<typeof form.fields>[number]) => {
    const value = formData[field.labelKey] || ""

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.labelKey}
            placeholder={field.placeholder || ""}
            required={field.isRequired}
            value={value}
            onChange={(e) => handleFieldChange(field.labelKey, e.target.value)}
            disabled={isSubmitting}
            className="min-h-[100px]"
          />
        )
      case "select":
        return (
          <Select 
            value={value} 
            onValueChange={(v) => handleFieldChange(field.labelKey, v)}
            disabled={isSubmitting}
            required={field.isRequired}
          >
            <SelectTrigger id={field.labelKey}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {/* Note: Option configuration needs to be added to db schema later, using dummies for now */}
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        )
      case "YES_NO":
        return (
          <RadioGroup 
            value={value} 
            onValueChange={(v) => handleFieldChange(field.labelKey, v)}
            className="flex items-center gap-4 mt-2"
            disabled={isSubmitting}
            required={field.isRequired}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id={`${field.labelKey}-yes`} />
              <Label htmlFor={`${field.labelKey}-yes`} className="font-normal cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id={`${field.labelKey}-no`} />
              <Label htmlFor={`${field.labelKey}-no`} className="font-normal cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        )
      case "checkbox":
        return (
          <div className="flex items-center gap-2 mt-2">
            <Checkbox 
              id={field.labelKey}
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(field.labelKey, checked)}
              disabled={isSubmitting}
              required={field.isRequired}
            />
            <Label htmlFor={field.labelKey} className="font-normal text-muted-foreground cursor-pointer">
              {field.placeholder || `Check here to confirm`}
            </Label>
          </div>
        )
      case "number":
      case "email":
      case "phone":
      case "text":
      default:
        return (
          <Input
            id={field.labelKey}
            type={field.type === "phone" ? "tel" : field.type}
            placeholder={field.placeholder || ""}
            required={field.isRequired}
            value={value}
            onChange={(e) => handleFieldChange(field.labelKey, e.target.value)}
            disabled={isSubmitting}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="pb-8 border-b bg-card">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {form.title}
            </CardTitle>
            {form.description && (
              <CardDescription className="text-base mt-2 text-muted-foreground whitespace-pre-wrap">
                {form.description}
              </CardDescription>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="pt-8 space-y-8">
              {form.fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  This form has no fields yet.
                </div>
              ) : (
                form.fields.map((field) => (
                  <div key={field.id} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor={field.labelKey} className="text-base font-medium">
                        {field.label}
                        {field.isRequired && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-muted-foreground">
                          {field.description}
                        </p>
                      )}
                    </div>
                    {renderFieldInput(field)}
                  </div>
                ))
              )}
            </CardContent>

            <CardFooter className="border-t pt-6 bg-muted/10 rounded-b-xl flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Never submit passwords through this form.
              </p>
              <Button type="submit" size="lg" disabled={isSubmitting || form.fields.length === 0} className="px-8">
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
