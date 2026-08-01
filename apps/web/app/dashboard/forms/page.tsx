"use client"

import { PlusIcon, GlobeIcon, StarIcon, UsersIcon } from "lucide-react"
import { CreateFormDialog } from "./_components/create-form-dialog"
import { FormsTable } from "./_components/forms-table"

const templates = [
  {
    label: "Blank Form",
    desc: "Start from scratch",
    icon: PlusIcon,
    gradient: "from-[oklch(0.62_0.19_48)] to-[oklch(0.7_0.2_60)]",
    bg: "oklch(0.62 0.19 48 / 10%)",
    iconColor: "oklch(0.62 0.19 48)",
    dashed: true,
  },
  {
    label: "Contact Us",
    desc: "Capture leads",
    icon: GlobeIcon,
    gradient: "from-[oklch(0.45_0.14_260)] to-[oklch(0.55_0.16_280)]",
    bg: "oklch(0.45 0.14 260 / 10%)",
    iconColor: "oklch(0.45 0.14 260)",
    url: "/form/443ab44c-5be8-4c3f-9c75-05f1cce2902e",
    dashed: false,
  },
  {
    label: "Feedback",
    desc: "Gather insights",
    icon: UsersIcon,
    gradient: "from-[oklch(0.5_0.14_145)] to-[oklch(0.6_0.14_160)]",
    bg: "oklch(0.5 0.14 145 / 10%)",
    iconColor: "oklch(0.5 0.14 145)",
    url: "/form/035c6430-b79b-467d-aaa7-d2d2db448d02",
    dashed: false,
  },
]

export default function FormsPage() {
  return (
    <div className="flex flex-col gap-8 py-4 md:py-6 px-4 lg:px-8 max-w-6xl">

      {/* Page header with Punjab banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 shadow-sm"
        style={{
          background: "linear-gradient(135deg, oklch(0.165 0.05 30) 0%, oklch(0.22 0.06 35) 60%, oklch(0.2 0.05 145) 100%)",
        }}
      >
        {/* Glow effects */}
        <div
          className="pointer-events-none absolute top-0 right-0 size-48 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.62 0.19 48)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 size-32 rounded-full blur-3xl opacity-15"
          style={{ background: "oklch(0.5 0.14 145)" }}
        />

        {/* Phulkari dot pattern */}
        <div className="pointer-events-none absolute right-8 top-4 grid grid-cols-4 gap-2 opacity-10">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="size-1 rounded-full bg-white"
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5"
                style={{
                  background: "oklch(0.62 0.19 48 / 20%)",
                  color: "oklch(0.78 0.16 55)",
                  border: "1px solid oklch(0.62 0.19 48 / 30%)",
                }}
              >
                Forms
              </span>
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "oklch(0.95 0.015 75)" }}
            >
              My Forms
            </h1>
            <p style={{ color: "oklch(0.65 0.03 60)" }} className="text-sm">
              Build, share, and manage your forms with the spirit of Punjab.
            </p>
          </div>
          <CreateFormDialog />
        </div>

        {/* Bottom rainbow bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: "linear-gradient(90deg, oklch(0.62 0.19 48), oklch(0.5 0.14 145), oklch(0.7 0.15 75), oklch(0.62 0.19 48))",
          }}
        />
      </div>

      {/* Templates section */}
      <div className="flex flex-col gap-4">
        <h2
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "oklch(0.5 0.04 50)" }}
        >
          Start from a template
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((t) => {
            const Icon = t.icon
            return (
              <div
                key={t.label}
                onClick={() => {
                  if (t.label === "Blank Form") {
                    document.getElementById("create-form-button")?.click()
                  } else if (t.url) {
                    window.open(t.url, "_blank")
                  }
                }}
                className="relative group overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: "oklch(1 0.005 80)",
                  border: t.dashed
                    ? `1.5px dashed oklch(0.62 0.19 48 / 40%)`
                    : "1px solid oklch(0.88 0.025 75)",
                }}
              >
                {/* Corner glow */}
                <div
                  className="absolute -top-4 -right-4 size-16 rounded-full blur-xl opacity-50 transition-opacity group-hover:opacity-80"
                  style={{ background: t.bg }}
                />
                <div className="relative z-10 flex flex-col p-5 h-36">
                  <div
                    className="flex size-10 items-center justify-center rounded-xl mb-auto shadow-sm"
                    style={{ background: t.bg, border: `1px solid ${t.iconColor}30` }}
                  >
                    <Icon className="size-5" style={{ color: t.iconColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{t.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent forms section */}
      <div className="flex flex-col gap-4">
        <h2
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "oklch(0.5 0.04 50)" }}
        >
          Recent forms
        </h2>
        <FormsTable />
      </div>
    </div>
  )
}
