"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { useSignIn } from "~/hooks/api/auth"

interface LoginFormValues {
  email: string
  password: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signInUserWithEmailAndPasswordAsync } = useSignIn()
  const router = useRouter()
  const { register, handleSubmit } = useForm<LoginFormValues>()

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    console.log("Form values:", values)
    const { id } = await signInUserWithEmailAndPasswordAsync({
      email: values.email,
      password: values.password,
    })
    router.replace("/dashboard")
  }

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
          ਸੁਆਗਤ ਹੈ
        </h1>
        <p className="text-sm text-muted-foreground">Welcome back — sign in to InderForms</p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-6 shadow-lg"
        style={{
          background: "oklch(1 0.005 80)",
          border: "1px solid oklch(0.88 0.025 75)",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email" className="font-semibold text-foreground/80">
                Email Address
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-xl border-border/60 bg-background/80 transition-all focus:border-[oklch(0.62_0.19_48)] focus:ring-[oklch(0.62_0.19_48)/30%]"
                {...register("email", { required: true })}
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password" className="font-semibold text-foreground/80">
                  Password
                </FieldLabel>
                <a
                  href="#"
                  className="text-xs font-medium hover:underline underline-offset-4"
                  style={{ color: "oklch(0.55 0.16 50)" }}
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                className="h-11 rounded-xl border-border/60 bg-background/80 transition-all focus:border-[oklch(0.62_0.19_48)] focus:ring-[oklch(0.62_0.19_48)/30%]"
                {...register("password", { required: true })}
              />
            </Field>

            <Field className="gap-3 pt-1">
              <Button
                type="submit"
                className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                  border: "none",
                }}
              >
                Sign In
              </Button>
              <FieldDescription className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="font-semibold hover:underline underline-offset-4"
                  style={{ color: "oklch(0.55 0.16 50)" }}
                >
                  Create one
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </div>

      {/* Phulkari decorative footer */}
      <div className="flex items-center justify-center gap-2 opacity-40">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[oklch(0.62_0.19_48)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          ਇੰਦਰ ਫਾਰਮਜ਼
        </span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[oklch(0.62_0.19_48)]" />
      </div>
    </div>
  )
}
