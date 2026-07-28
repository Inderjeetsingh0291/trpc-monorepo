"use client"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useSignIn } from "~/hooks/api/auth"
import { useState } from "react"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signInUserWithEmailAndPasswordAsync, isError, error } = useSignIn()
  const router = useRouter()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()
  const [serverError, setServerError] = useState("")

  const onSubmit = async (data: any) => {
    setServerError("")
    try {
      await signInUserWithEmailAndPasswordAsync({
        email: data.email,
        password: data.password,
      })
      router.replace("/dashboard")
    } catch (err: any) {
      setServerError(err?.message || "Invalid email or password. Please try again.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl shadow-lg mb-1 bg-white overflow-hidden p-1">
          <img src="/punjab-pic.png" alt="Punjab Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "oklch(0.18 0.04 30)" }}>
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">Sign in to your MakeForms account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Error message */}
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-sm font-semibold text-foreground/80">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-11 w-full rounded-xl border border-border/60 bg-background/80 px-4 text-sm transition-all focus:outline-none focus:border-[oklch(0.62_0.19_48)] focus:ring-2 focus:ring-[oklch(0.62_0.19_48)]/20"
            {...register("email")}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="text-sm font-semibold text-foreground/80">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-border/60 bg-background/80 px-4 text-sm transition-all focus:outline-none focus:border-[oklch(0.62_0.19_48)] focus:ring-2 focus:ring-[oklch(0.62_0.19_48)]/20"
            {...register("password")}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] mt-1"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            border: "none",
          }}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold hover:underline underline-offset-4"
            style={{ color: "oklch(0.55 0.16 50)" }}
          >
            Create account
          </Link>
        </p>
      </form>

      {/* Phulkari decorative footer */}
      <div className="flex items-center justify-center gap-2 opacity-40">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[oklch(0.62_0.19_48)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          MakeForms
        </span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[oklch(0.62_0.19_48)]" />
      </div>
    </div>
  )
}
