"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useVerifyEmailToken } from "~/hooks/api/auth"
import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import Link from "next/link"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const { verifyEmailTokenAsync } = useVerifyEmailToken()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("No verification token found in URL.")
      return
    }

    verifyEmailTokenAsync({ token })
      .then(() => {
        setStatus("success")
      })
      .catch((err: any) => {
        setStatus("error")
        setErrorMessage(err?.message || "Failed to verify email. Token may be invalid or expired.")
      })
  }, [token, verifyEmailTokenAsync])

  return (
    <div
      className="w-full max-w-md rounded-2xl p-8 shadow-xl text-center flex flex-col gap-6"
      style={{
        background: "oklch(1 0.005 80)",
        border: "1px solid oklch(0.88 0.025 75)",
      }}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl shadow bg-white mx-auto p-1">
        <img src="/punjab-pic.png" alt="MakeForms Logo" className="w-full h-full object-contain" />
      </div>

      {status === "loading" && (
        <div className="py-6 flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <h1 className="text-xl font-bold text-foreground">Verifying your email...</h1>
          <p className="text-sm text-muted-foreground">Please wait a moment while we activate your account.</p>
        </div>
      )}

      {status === "success" && (
        <div className="py-4 flex flex-col items-center gap-4">
          <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Email Verified!</h1>
          <p className="text-sm text-muted-foreground">
            Your email address has been successfully verified. You can now use all features of MakeForms.
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all mt-2"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="py-4 flex flex-col items-center gap-4">
          <div className="size-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">Verification Failed</h1>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 w-full">
            {errorMessage}
          </p>
          <Link
            href="/login"
            className="text-sm font-semibold hover:underline mt-2"
            style={{ color: "oklch(0.55 0.16 50)" }}
          >
            Return to Sign In
          </Link>
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div
      className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10"
      style={{
        background: "linear-gradient(135deg, oklch(0.98 0.012 80) 0%, oklch(0.95 0.025 75) 40%, oklch(0.97 0.018 145) 100%)",
      }}
    >
      <Suspense fallback={
        <div className="w-full max-w-md rounded-2xl p-8 shadow-xl text-center bg-white">
          <div className="size-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
