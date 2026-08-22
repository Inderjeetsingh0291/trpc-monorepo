"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useForgotPassword } from "~/hooks/api/auth"
import { Button } from "~/components/ui/button"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const { forgotPasswordAsync, isPending } = useForgotPassword()
  const { register, handleSubmit } = useForm<{ email: string }>()
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const onSubmit = async (data: { email: string }) => {
    setServerError("")
    setSuccessMessage("")
    try {
      const result = await forgotPasswordAsync({ email: data.email })
      setSuccessMessage(result.message || "A password reset link has been sent to your email.")
    } catch (err: any) {
      setServerError(err?.message || "Failed to process request. Please try again.")
    }
  }

  return (
    <div
      className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10"
      style={{
        background: "linear-gradient(135deg, oklch(0.98 0.012 80) 0%, oklch(0.95 0.025 75) 40%, oklch(0.97 0.018 145) 100%)",
      }}
    >
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
            Forgot Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your account email to receive a password reset link
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
              Didn&apos;t receive an email? Check your spam folder or try again.
            </p>
            <Link
              href="/login"
              className="text-sm font-semibold hover:underline underline-offset-4"
              style={{ color: "oklch(0.55 0.16 50)" }}
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reset-email" className="text-sm font-semibold text-foreground/80">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-border/60 bg-background/80 px-4 text-sm transition-all focus:outline-none focus:border-[oklch(0.62_0.19_48)] focus:ring-2 focus:ring-[oklch(0.62_0.19_48)]/20"
                {...register("email")}
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg mt-1"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                border: "none",
              }}
            >
              {isPending ? "Sending Link..." : "Send Reset Link"}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold hover:underline underline-offset-4"
                style={{ color: "oklch(0.55 0.16 50)" }}
              >
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
