"use client"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useSignup } from "~/hooks/api/auth"
import { useState, useEffect } from "react"

// Source - https://stackoverflow.com/a/21456918
// Posted by Srinivas, modified by community. See post 'Timeline' for change history
// Retrieved 2026-08-15, License - CC BY-SA 4.0
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

export function SignupForm({
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit">) {
  const { createUserWithEmailAndPasswordAsync } = useSignup()
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm()
  const [serverError, setServerError] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  // Live password validation feedback
  const watchedPassword = watch("password", "")
  useEffect(() => {
    if (!watchedPassword) {
      setPasswordErrors([])
      return
    }
    const errors: string[] = []
    if (watchedPassword.length < 8) errors.push("At least 8 characters")
    if (!/[a-z]/.test(watchedPassword)) errors.push("One lowercase letter")
    if (!/[A-Z]/.test(watchedPassword)) errors.push("One uppercase letter")
    if (!/\d/.test(watchedPassword)) errors.push("One number")
    if (!/[@$!%*#?&]/.test(watchedPassword)) errors.push("One special character (@$!%*#?&)")
    setPasswordErrors(errors)
  }, [watchedPassword])

  const onSubmit = async (data: any) => {
    setServerError("")

    if (!PASSWORD_REGEX.test(data.password)) {
      setServerError("Password does not meet the requirements.")
      return
    }

    if (data.password !== data.confirmPassword) {
      setServerError("Passwords do not match.")
      return
    }

    try {
      await createUserWithEmailAndPasswordAsync({
        email: data.email,
        fullName: data.name,
        password: data.password,
      })
      router.replace("/dashboard")
    } catch (err: any) {
      setServerError(err?.message || "Failed to create account.")
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-5", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center mb-2">
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-md mb-1 bg-white overflow-hidden p-1"
          >
            <img src="/punjab-pic.png" alt="Punjab Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Make Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Create your MakeForms account and start building
          </p>
        </div>

        {/* Error message */}
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
            {serverError}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="name" className="font-semibold text-foreground/80">
            Full Name
          </FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Gurmeet Singh"
            required
            className="h-11 rounded-xl border-border/60 bg-background/80 transition-all focus:border-[oklch(0.62_0.19_48)] focus:ring-[oklch(0.62_0.19_48)/30%]"
            {...register("name")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email" className="font-semibold text-foreground/80">
            Email Address
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-11 rounded-xl border-border/60 bg-background/80 transition-all focus:border-[oklch(0.62_0.19_48)] focus:ring-[oklch(0.62_0.19_48)/30%]"
            {...register("email")}
          />
          <FieldDescription className="text-xs text-muted-foreground">
            We&apos;ll never share your email with anyone.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="password" className="font-semibold text-foreground/80">
            Password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            required
            className="h-11 rounded-xl border-border/60 bg-background/80 transition-all focus:border-[oklch(0.62_0.19_48)] focus:ring-[oklch(0.62_0.19_48)/30%]"
            {...register("password")}
          />
          {/* Live password requirements checklist */}
          <div className="mt-2 space-y-1">
            {[
              { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
              { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
              { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
              { label: "One number", test: (p: string) => /\d/.test(p) },
              { label: "One special character (@$!%*#?&)", test: (p: string) => /[@$!%*#?&]/.test(p) },
            ].map((rule) => {
              const passed = watchedPassword ? rule.test(watchedPassword) : false
              return (
                <div key={rule.label} className="flex items-center gap-2 text-xs transition-colors">
                  <div
                    className="size-3.5 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: passed ? "oklch(0.55 0.18 145)" : "oklch(0.9 0.01 60)",
                      border: passed ? "none" : "1px solid oklch(0.82 0.02 60)",
                    }}
                  >
                    {passed && (
                      <svg className="size-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span style={{ color: passed ? "oklch(0.45 0.12 145)" : "oklch(0.55 0.02 60)" }}>
                    {rule.label}
                  </span>
                </div>
              )
            })}
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password" className="font-semibold text-foreground/80">
            Confirm Password
          </FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            required
            className="h-11 rounded-xl border-border/60 bg-background/80 transition-all focus:border-[oklch(0.62_0.19_48)] focus:ring-[oklch(0.62_0.19_48)/30%]"
            {...register("confirmPassword")}
          />
        </Field>

        <Field className="pt-1">
          <Button
            type="submit"
            disabled={isSubmitting || passwordErrors.length > 0}
            className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
          <FieldDescription className="text-center text-sm text-muted-foreground pt-1">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold hover:underline underline-offset-4"
              style={{ color: "oklch(0.55 0.16 50)" }}
            >
              Sign in
            </a>
          </FieldDescription>
        </Field>

        {/* Phulkari decorative footer */}
        <div className="flex items-center justify-center gap-2 opacity-40 pt-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[oklch(0.62_0.19_48)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">MakeForms</span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[oklch(0.62_0.19_48)]" />
        </div>
      </FieldGroup>
    </form>
  )
}
