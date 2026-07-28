"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useGetFormById } from "~/hooks/api/form"
import { useSubmitForm } from "~/hooks/api/form-submission"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { toast } from "sonner"

export function PublicForm({ formId }: { formId: string }) {
  const router = useRouter()
  const { form, isLoading, isError, error } = useGetFormById(formId)
  const { submitFormAsync, isPending: isSubmitting } = useSubmitForm()
  
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [countdown, setCountdown] = useState(10)

  // Password protection state
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordUnlocked, setPasswordUnlocked] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-redirect countdown after submission
  useEffect(() => {
    if (submitted) {
      setCountdown(10)
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!)
            router.push("/")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [submitted, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner className="size-8 text-orange-500" />
      </div>
    )
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center max-w-md w-full shadow-lg">
          <div className="flex size-16 mx-auto items-center justify-center rounded-2xl mb-4 bg-red-50 text-red-500">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-900">Form Not Found</h2>
          <p className="text-slate-500 text-sm">
            {error?.message || "This form may have been deleted or the link is invalid."}
          </p>
        </div>
      </div>
    )
  }

  if (!form.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center max-w-md w-full shadow-lg">
          <div className="flex size-16 mx-auto items-center justify-center rounded-2xl mb-4 bg-slate-100 text-slate-500">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-900">Form Closed</h2>
          <p className="text-slate-500 text-sm">
            This form is no longer accepting responses. It may have been unpublished by the creator.
          </p>
        </div>
      </div>
    )
  }

  // Password protection gate
  const hasPassword = !!(form as any).password
  if (hasPassword && !passwordUnlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center max-w-md w-full shadow-lg">
          <div className="flex size-16 mx-auto items-center justify-center rounded-2xl mb-4 bg-orange-50 text-orange-500">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-900">Password Protected</h2>
          <p className="text-slate-500 text-sm mb-6">
            This form is password protected. Enter the password to continue.
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={e => {
                setPasswordInput(e.target.value)
                setPasswordError("")
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  if (passwordInput === (form as any).password) {
                    setPasswordUnlocked(true)
                  } else {
                    setPasswordError("Incorrect password. Please try again.")
                  }
                }
              }}
              className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-[16px] text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-center"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            <Button
              onClick={() => {
                if (passwordInput === (form as any).password) {
                  setPasswordUnlocked(true)
                } else {
                  setPasswordError("Incorrect password. Please try again.")
                }
              }}
              className="rounded-xl h-11 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              Unlock Form
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Thank you screen with auto-redirect
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center max-w-md w-full shadow-lg">
          <div className="flex size-20 mx-auto items-center justify-center rounded-full mb-6 bg-green-50 text-green-500">
            <span className="material-symbols-outlined text-[40px]">task_alt</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-slate-900">Thank you!</h2>
          <p className="text-slate-500 mb-6">
            Your response has been recorded successfully.
          </p>
          <div className="mb-8">
            <div className="text-slate-400 text-sm mb-3">
              Redirecting you to the home page in{" "}
              <span className="font-bold text-orange-500 text-base">{countdown}</span>
              {" "}seconds...
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/")}
              className="rounded-xl h-11 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              Go Home Now
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => {
                if (countdownRef.current) clearInterval(countdownRef.current)
                setFormData({})
                setSubmitted(false)
                setCurrentStep(0)
                setCountdown(10)
              }}
            >
              Submit another response
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalSteps = form.fields.length
  const currentField = form.fields[currentStep]

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (currentField?.isRequired && !formData[currentField.labelKey]) {
      toast.error("This field is required")
      return
    }
    if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1)
  }

  const handleBack = () => {
    setCurrentStep(s => Math.max(0, s - 1))
  }

  const handleSubmit = async (e?: React.FormEvent, forceListValidation = false) => {
    e?.preventDefault()
    
    if (forceListValidation) {
      for (const field of form.fields) {
        if (field.isRequired && !formData[field.labelKey]) {
          toast.error(`"${field.label}" is required`)
          return
        }
      }
    } else {
      if (currentField?.isRequired && !formData[currentField.labelKey]) {
        toast.error("This field is required")
        return
      }
    }

    const values = form.fields.map(field => ({
      formFieldId: field.id,
      value: formData[field.labelKey] ?? "",
    }))

    try {
      await submitFormAsync({ formId, values })
      setSubmitted(true)
      toast.success("Form submitted successfully!")
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit form. Please try again.")
    }
  }

  const renderFieldInput = (field: typeof currentField) => {
    if (!field) return null
    const value = formData[field.labelKey] || ""
    const options = ((field as any).options as Array<{ label: string; value: string }>) ?? [];

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder || "Type your answer..."}
            required={field.isRequired}
            value={value}
            onChange={(e) => handleFieldChange(field.labelKey, e.target.value)}
            disabled={isSubmitting}
            rows={5}
            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-[16px] text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
          />
        )
      case "select":
      case "radio":
      case "YES_NO":
      case "multi_select":
        const opts = field.type === "YES_NO" 
          ? [{label: "Yes", value: "yes"}, {label: "No", value: "no"}]
          : options.length > 0 ? options : [{label: "Option 1", value: "opt1"}, {label: "Option 2", value: "opt2"}];
          
        return (
          <div className="space-y-3">
            {opts.map((opt, i) => {
              const optVal = opt.value || opt.label;
              const isSelected = field.type === "multi_select" 
                ? value.split(',').includes(optVal)
                : value === optVal;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (field.type === "multi_select") {
                      const arr = value ? value.split(',') : [];
                      if (arr.includes(optVal)) {
                        handleFieldChange(field.labelKey, arr.filter(x => x !== optVal).join(','));
                      } else {
                        handleFieldChange(field.labelKey, [...arr, optVal].join(','));
                      }
                    } else {
                      handleFieldChange(field.labelKey, optVal)
                    }
                  }}
                  disabled={isSubmitting}
                  className={`w-full flex items-center gap-4 px-5 py-4 border-2 rounded-xl text-left transition-all ${
                    isSelected ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${field.type === 'multi_select' ? 'rounded' : 'rounded-full'} border-2 ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                    {isSelected && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                  </div>
                  <span className={`text-[16px] ${isSelected ? "text-orange-900 font-medium" : "text-slate-700"}`}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>
        )
      case "rating":
        return (
          <div className="flex flex-wrap gap-3 py-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isSelected = parseInt(value) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleFieldChange(field.labelKey, String(star))}
                  disabled={isSubmitting}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-[20px] font-bold transition-all ${
                    isSelected ? "border-orange-500 bg-orange-500 text-white shadow-md scale-110" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 shadow-sm hover:scale-105"
                  }`}
                >
                  {star}
                </button>
              )
            })}
          </div>
        )
      case "checkbox":
        return (
          <button
            type="button"
            onClick={() => handleFieldChange(field.labelKey, value === "true" ? "false" : "true")}
            disabled={isSubmitting}
            className={`w-full flex items-center gap-4 px-5 py-5 border-2 rounded-xl text-left transition-all ${
              value === "true" ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
            }`}
          >
            <div className={`w-6 h-6 rounded shrink-0 border-2 flex items-center justify-center ${value === "true" ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
              {value === "true" && <span className="material-symbols-outlined text-white text-[18px]">check</span>}
            </div>
            <span className={`text-[16px] ${value === "true" ? "text-orange-900 font-medium" : "text-slate-700"}`}>
              {field.placeholder || "Yes, I agree"}
            </span>
          </button>
        )
      case "date":
        return (
          <input
            type="date"
            required={field.isRequired}
            value={value}
            onChange={(e) => handleFieldChange(field.labelKey, e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-4 text-[16px] text-slate-700 shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />
        )
      case "number":
      case "email":
      case "phone":
      case "text":
      default:
        return (
          <input
            type={field.type === "email" ? "email" : field.type === "number" ? "number" : field.type === "phone" ? "tel" : "text"}
            placeholder={field.placeholder || "Type your answer..."}
            required={field.isRequired}
            value={value}
            onChange={(e) => handleFieldChange(field.labelKey, e.target.value)}
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if ((form as any).layout === "list") {
                  // handled by submit button
                } else {
                  if (currentStep >= totalSteps - 1) handleSubmit();
                  else handleNext();
                }
              }
            }}
            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-4 text-[16px] text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-2xl flex items-center gap-3 mb-6 px-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="6" height="6" rx="1" fill="#ffffff" />
            <rect x="10" y="2" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
            <rect x="2" y="10" width="6" height="6" rx="1" fill="#ffffff" opacity="0.6" />
            <rect x="10" y="10" width="6" height="6" rx="1" fill="#ffffff" />
          </svg>
        </div>
        <span className="font-bold text-slate-700 text-lg">{form.title}</span>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
        {/* Top progress bar */}
        <div className="h-1.5 w-full bg-slate-100">
          <div className="h-full bg-orange-500 transition-all duration-500 ease-out" style={{ width: totalSteps > 0 ? `${((currentStep + 1) / totalSteps) * 100}%` : '0%' }} />
        </div>

        <div className="flex-1 flex flex-col px-8 py-10 sm:px-12 sm:py-14 overflow-y-auto">
          {totalSteps === 0 ? (
            <div className="flex flex-col items-center justify-center h-full m-auto text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-200 mb-4">draft</span>
              <p className="text-slate-500 text-lg">This form has no fields yet.</p>
            </div>
          ) : (form as any).layout === "list" ? (
            <div className="flex flex-col h-full">
              {form.description && (
                <p className="text-[16px] text-slate-500 mb-10 leading-relaxed border-b border-slate-100 pb-8">{form.description}</p>
              )}
              <div className="flex-1 flex flex-col gap-12">
                {form.fields.map((field, idx) => (
                  <div key={field.id} className="">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2 leading-tight">
                      {idx + 1}. {field.label}
                      {field.isRequired && <span className="text-red-500 ml-2">*</span>}
                    </h2>
                    {field.description && (
                      <p className="text-[14px] text-slate-500 mb-4 leading-relaxed">{field.description}</p>
                    )}
                    <div className="mt-4">
                      {renderFieldInput(field)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end pt-10 mt-10 border-t border-slate-200">
                <Button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)} 
                  disabled={isSubmitting}
                  className="rounded-xl px-8 h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[15px] shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? <Spinner className="mr-2 size-4" /> : null}
                  Submit <span className="material-symbols-outlined text-[20px] ml-1.5">check</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[12px] text-slate-400 mb-5 font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-geist-mono)" }}>
                Step {currentStep + 1} of {totalSteps}
              </p>
              
              <h2 className="text-3xl font-semibold text-slate-900 mb-3 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                {currentField?.label}
                {currentField?.isRequired && <span className="text-red-500 ml-2">*</span>}
              </h2>
              
              {currentField?.description && (
                <p className="text-[16px] text-slate-500 mb-8 leading-relaxed">{currentField.description}</p>
              )}

              <div className="flex-1 flex flex-col justify-start mt-4">
                {renderFieldInput(currentField)}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-10 mt-auto">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleBack} 
                  disabled={currentStep === 0 || isSubmitting}
                  className="rounded-xl px-5 h-12 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px] mr-1.5">arrow_back</span> Back
                </Button>
                
                {currentStep >= totalSteps - 1 ? (
                  <Button 
                    type="button" 
                    onClick={() => handleSubmit()} 
                    disabled={isSubmitting}
                    className="rounded-xl px-8 h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[15px] shadow-md hover:shadow-lg transition-all"
                  >
                    {isSubmitting ? <Spinner className="mr-2 size-4" /> : null}
                    Submit <span className="material-symbols-outlined text-[20px] ml-1.5">check</span>
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={handleNext} 
                    disabled={isSubmitting}
                    className="rounded-xl px-8 h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[15px] shadow-md hover:shadow-lg transition-all"
                  >
                    Next <span className="material-symbols-outlined text-[20px] ml-1.5">arrow_forward</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[12px] text-slate-400 font-medium">Powered by MakeForms</p>
      </div>
    </div>
  )
}
