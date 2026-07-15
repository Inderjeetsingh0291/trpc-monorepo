"use client"

import { cn } from "~/lib/utils"
import { SignIn } from "@clerk/nextjs"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Punjab branded header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div
          className="flex size-14 items-center justify-center rounded-2xl shadow-lg mb-1 bg-white overflow-hidden p-1"
        >
          {/* Punjab Pic */}
          <img src="/punjab-pic.png" alt="Punjab Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "oklch(0.18 0.04 30)" }}>
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">Welcome back — sign in to MakeForms</p>
      </div>

      {/* Clerk SignIn */}
      <div className="flex justify-center w-full">
        <SignIn routing="hash" forceRedirectUrl="/dashboard" />
      </div>

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
