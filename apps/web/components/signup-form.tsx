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

export function SignupForm({
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit">) {
  const { createUserWithEmailAndPasswordAsync } = useSignup()
  const router = useRouter()
  const { register, handleSubmit } = useForm()

  const onSubmit = (data: any) => {
    const id = console.log("Form values:", data)
    createUserWithEmailAndPasswordAsync({
      email: data.email,
      fullName: data.name,
      password: data.password,
    })
    console.log(`User created with Id: ${id}`)
    router.replace("/dashboard")
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
          <FieldDescription className="text-xs text-muted-foreground">
            Must be at least 8 characters long.
          </FieldDescription>
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
            className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            Create Account
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
