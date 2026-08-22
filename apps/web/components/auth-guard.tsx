"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "~/trpc/client"
import { Spinner } from "~/components/ui/spinner"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  const { data: user, isLoading, error } = trpc.auth.getLoggedInUserInfo.useQuery(undefined, {
    retry: false, // Don't retry on UNAUTHORIZED — redirect immediately
  })

  const isUnauthenticated = !isLoading && (!user || error)

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace("/login")
    }
  }, [isUnauthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8 text-orange-500" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (isUnauthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-8 text-orange-500" />
      </div>
    )
  }

  // If user email is not verified, show verification required screen
  if (user && user.emailVerified === false) {
    return <UnverifiedEmailScreen email={user.email} />
  }

  return <>{children}</>
}

function UnverifiedEmailScreen({ email }: { email: string }) {
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const resendVerificationMutation = trpc.auth.resendVerificationEmail.useMutation()

  const handleResend = async () => {
    setResendStatus("sending")
    setErrorMessage("")
    try {
      await resendVerificationMutation.mutateAsync({
        email,
      })
      setResendStatus("sent")
    } catch (err: any) {
      console.error("[UnverifiedEmailScreen] Resend error:", err)
      setResendStatus("error")
      setErrorMessage(err?.message || "Failed to resend email. Please try again later.")
    }
  }

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, oklch(0.98 0.012 80) 0%, oklch(0.95 0.025 75) 40%, oklch(0.97 0.018 145) 100%)",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-xl text-center flex flex-col gap-6"
        style={{
          background: "oklch(1 0.005 80)",
          border: "1px solid oklch(0.88 0.025 75)",
        }}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl shadow mx-auto bg-amber-50 border border-amber-200 text-amber-600">
          <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify Your Email Address</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Access to the dashboard is restricted until your email address is verified. We&apos;ve sent a verification link to <strong className="text-foreground">{email}</strong>.
          </p>
        </div>

        {resendStatus === "sent" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Verification email resent successfully! Check your inbox.
          </div>
        ) : resendStatus === "error" ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage || "Failed to resend email. Please try again later."}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleResend}
            disabled={resendStatus === "sending"}
            className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            }}
          >
            {resendStatus === "sending" ? "Resending Email..." : "Resend Verification Email"}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="h-11 w-full rounded-xl font-semibold text-foreground bg-muted/50 border border-border/60 transition-all hover:bg-muted"
          >
            I&apos;ve Verified My Email (Refresh)
          </button>
        </div>
      </div>
    </div>
  )
}
