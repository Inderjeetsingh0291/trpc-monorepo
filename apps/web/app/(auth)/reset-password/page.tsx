"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useResetPassword } from "~/hooks/api/auth"
import { Button } from "~/components/ui/button"
import Link from "next/link"

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const { resetPasswordAsync, isPending } = useResetPassword()

  const { register, handleSubmit, watch } = useForm()
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const watchedPassword = watch("password", "")
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

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
    setSuccessMessage("")

    if (!token) {
      setServerError("Reset token missing in URL.")
      return
    }

    if (!PASSWORD_REGEX.test(data.password)) {
      setServerError("Password does not meet requirement standards.")
      return
    }

    if (data.password !== data.confirmPassword) {
      setServerError("Passwords do not match.")
      return
    }

    try {
      const result = await resetPasswordAsync({
        token,
        password: data.password,
      })
      setSuccessMessage(result.message || "Password updated successfully!")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      setServerError(err?.message || "Failed to reset password. Token may be expired.")
    }
  }

  if (!token) {
    return (
      <div className="max-w-md w-full rounded-2xl p-6 border border-red-200 bg-red-50 text-center space-y-4">
        <h2 className="text-lg font-bold text-red-700">Invalid Password Reset Link</h2>
        <p className="text-sm text-red-600">
          No reset token was provided. Please request a new password reset link.
        </p>
        <Link href="/forgot-password" className="inline-block text-sm font-semibold text-red-700 underline">
          Go to Forgot Password
        </Link>
      </div>
    )
  }

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-6 shadow-xl flex flex-col gap-6"
      style={{
        background: "oklch(1 0.005 80)",
        border: "1px solid oklch(0.88 0.025 75)",
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl shadow-lg mb-1 bg-white overflow-hidden p-1">
          <img src="/punjab-pic.png" alt="MakeForms Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "oklch(0.18 0.04 30)" }}>
          Set New Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new secure password below
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {successMessage ? (
        <div className="flex flex-col gap-4 text-center py-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
          <p className="text-xs text-muted-foreground">
            Redirecting you to Sign In in 3 seconds...
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all mt-1"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            Sign In Now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="text-sm font-semibold text-foreground/80">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-border/60 bg-background/80 px-4 text-sm transition-all focus:outline-none focus:border-[oklch(0.62_0.19_48)] focus:ring-2 focus:ring-[oklch(0.62_0.19_48)]/20"
              {...register("password")}
            />

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
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-new-password" className="text-sm font-semibold text-foreground/80">
              Confirm New Password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              required
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-border/60 bg-background/80 px-4 text-sm transition-all focus:outline-none focus:border-[oklch(0.62_0.19_48)] focus:ring-2 focus:ring-[oklch(0.62_0.19_48)]/20"
              {...register("confirmPassword")}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || passwordErrors.length > 0}
            className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg mt-1"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            {isPending ? "Resetting Password..." : "Update Password"}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div
      className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10"
      style={{
        background: "linear-gradient(135deg, oklch(0.98 0.012 80) 0%, oklch(0.95 0.025 75) 40%, oklch(0.97 0.018 145) 100%)",
      }}
    >
      <Suspense fallback={
        <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl text-center bg-white">
          <div className="size-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}
