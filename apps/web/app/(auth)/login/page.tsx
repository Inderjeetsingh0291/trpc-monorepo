import { LoginForm } from "~/components/login-form"

export default function Page() {
  return (
    <div
      className="relative flex min-h-svh w-full items-center justify-center overflow-hidden p-6 md:p-10"
      style={{
        background: "linear-gradient(135deg, oklch(0.98 0.012 80) 0%, oklch(0.95 0.025 75) 40%, oklch(0.97 0.018 145) 100%)",
      }}
    >
      {/* Background decorative elements — wheat field / phulkari dots */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Saffron glow top-right */}
        <div
          className="absolute -top-40 -right-40 size-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.62 0.19 48)" }}
        />
        {/* Green glow bottom-left */}
        <div
          className="absolute -bottom-40 -left-40 size-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.5 0.14 145)" }}
        />
        {/* Phulkari dots pattern */}
        <div className="absolute top-10 left-10 grid grid-cols-6 gap-3 opacity-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="size-1.5 rounded-full"
              style={{ background: i % 3 === 0 ? "oklch(0.62 0.19 48)" : i % 3 === 1 ? "oklch(0.5 0.14 145)" : "oklch(0.7 0.15 75)" }}
            />
          ))}
        </div>
        <div className="absolute bottom-10 right-10 grid grid-cols-6 gap-3 opacity-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="size-1.5 rounded-full"
              style={{ background: i % 3 === 0 ? "oklch(0.62 0.19 48)" : i % 3 === 1 ? "oklch(0.5 0.14 145)" : "oklch(0.7 0.15 75)" }}
            />
          ))}
        </div>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
