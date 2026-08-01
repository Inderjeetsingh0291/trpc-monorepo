"use client"

import { IconTrendingDown, IconTrendingUp, IconForms, IconUsers, IconChartBar, IconStar } from "@tabler/icons-react"
import { useGetDashboardStats } from "~/hooks/api/form"
import { Skeleton } from "~/components/ui/skeleton"

export function SectionCards() {
  const { stats, isLoading } = useGetDashboardStats()

  const cards = [
    {
      label: "Total Forms",
      value: isLoading ? null : String(stats?.totalForms ?? 0),
      change: "Active & draft forms",
      trend: "up",
      icon: IconForms,
      accent: "oklch(0.62 0.19 48)",
      gradient: "from-[oklch(0.62_0.19_48)] to-[oklch(0.7_0.2_60)]",
      bg: "oklch(0.62 0.19 48 / 6%)",
    },
    {
      label: "Total Submissions",
      value: isLoading ? null : String(stats?.totalSubmissions ?? 0),
      change: "Across all forms",
      trend: "up",
      icon: IconChartBar,
      accent: "oklch(0.45 0.14 260)",
      gradient: "from-[oklch(0.45_0.14_260)] to-[oklch(0.55_0.16_280)]",
      bg: "oklch(0.45 0.14 260 / 6%)",
    },
    {
      label: "Active Forms",
      value: isLoading ? null : String(stats?.activeForms ?? 0),
      change: "Currently accepting responses",
      trend: "up",
      icon: IconStar,
      accent: "oklch(0.5 0.14 145)",
      gradient: "from-[oklch(0.5_0.14_145)] to-[oklch(0.6_0.14_160)]",
      bg: "oklch(0.5 0.14 145 / 6%)",
    },
    {
      label: "Recent Activity",
      value: isLoading ? null : String(stats?.recentSubmissions?.length ?? 0),
      change: "New recent responses",
      trend: "up",
      icon: IconUsers,
      accent: "oklch(0.65 0.18 25)",
      gradient: "from-[oklch(0.65_0.18_25)] to-[oklch(0.7_0.16_40)]",
      bg: "oklch(0.65 0.18 25 / 6%)",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const TrendIcon = card.trend === "up" ? IconTrendingUp : IconTrendingDown
        return (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${card.bg}, transparent)`,
              borderColor: `${card.accent.replace(")", " / 20%)")}`,
              backgroundColor: "oklch(1 0.005 80)",
            }}
          >
            {/* Top accent line */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.gradient} opacity-80`}
            />

            {/* Background glow */}
            <div
              className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full blur-3xl opacity-30 transition-opacity duration-300 group-hover:opacity-50"
              style={{ background: card.accent }}
            />

            {/* Header row */}
            <div className="relative z-10 flex items-start justify-between mb-5">
              <div
                className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-md`}
              >
                <Icon className="size-5 text-white" />
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  card.trend === "up"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                <TrendIcon className="size-3" />
                Live
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10">
              {card.value === null ? (
                <Skeleton className="h-9 w-20 mb-1" />
              ) : (
                <p className="text-3xl font-bold tracking-tight text-[oklch(0.14_0.04_30)]">
                  {card.value}
                </p>
              )}
              <p className="mt-1 text-sm font-semibold text-[oklch(0.4_0.04_40)]">
                {card.label}
              </p>
              <p className="mt-2 text-xs text-[oklch(0.55_0.03_50)]">
                {card.change}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
