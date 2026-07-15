import { SignupForm } from "~/components/signup-form"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left panel — Punjab visual panel */}
      <div
        className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(160deg, oklch(0.165 0.05 30) 0%, oklch(0.22 0.06 35) 50%, oklch(0.18 0.04 145) 100%)",
        }}
      >
        {/* Animated saffron glow orb */}
        <div
          className="absolute top-20 right-20 size-64 rounded-full blur-3xl opacity-25 animate-pulse"
          style={{ background: "oklch(0.62 0.19 48)" }}
        />
        <div
          className="absolute bottom-20 left-20 size-48 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: "oklch(0.5 0.14 145)", animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full blur-3xl opacity-10"
          style={{ background: "oklch(0.7 0.15 75)" }}
        />

        {/* Phulkari dot grid */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="grid grid-cols-12 gap-8">
            {Array.from({ length: 96 }).map((_, i) => (
              <div
                key={i}
                className="size-1 rounded-full bg-white"
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          {/* Large Punjab Pic */}
          <div
            className="flex size-24 items-center justify-center rounded-3xl shadow-2xl bg-white overflow-hidden p-2"
          >
            <img src="/punjab-pic.png" alt="Punjab Logo" className="w-full h-full object-contain" />
          </div>

          <div className="flex flex-col gap-3">
            <h2
              className="text-4xl font-bold tracking-tight"
              style={{ color: "oklch(0.95 0.015 75)" }}
            >
              MakeForms
            </h2>

            <p className="text-sm max-w-xs leading-relaxed" style={{ color: "oklch(0.65 0.03 60)" }}>
              Build beautiful forms inspired by the rich culture of Punjab. Collect responses with pride and warmth.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-xs">
            {["Form Builder", "Analytics", "Submissions", "Share Forms"].map((f) => (
              <span
                key={f}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: "oklch(0.62 0.19 48 / 20%)",
                  color: "oklch(0.78 0.16 55)",
                  border: "1px solid oklch(0.62 0.19 48 / 30%)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom border gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: "linear-gradient(90deg, oklch(0.62 0.19 48), oklch(0.5 0.14 145), oklch(0.7 0.15 75), oklch(0.62 0.19 48))",
          }}
        />
      </div>

      {/* Right panel — Signup form */}
      <div
        className="relative flex flex-col gap-4 p-6 md:p-10 overflow-hidden"
        style={{ background: "oklch(0.98 0.012 80)" }}
      >
        {/* Subtle background glow */}
        <div
          className="pointer-events-none absolute top-0 right-0 size-64 rounded-full blur-3xl opacity-10"
          style={{ background: "oklch(0.62 0.19 48)" }}
        />

        {/* Logo top */}
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2.5 font-medium">
            <div
              className="flex size-9 items-center justify-center rounded-lg shadow bg-white overflow-hidden p-0.5"
            >
              <img src="/punjab-pic.png" alt="Punjab Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-bold" style={{ color: "oklch(0.18 0.04 30)" }}>
              MakeForms
            </span>
          </a>
        </div>

        {/* Form */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-lg"
            style={{
              background: "oklch(1 0.005 80)",
              border: "1px solid oklch(0.88 0.025 75)",
            }}
          >
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  )
}
