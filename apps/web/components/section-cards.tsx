import { IconTrendingDown, IconTrendingUp, IconForms, IconUsers, IconChartBar, IconStar } from "@tabler/icons-react"
import { Badge } from "~/components/ui/badge"

const cards = [
  {
    label: "Total Forms",
    value: "12",
    change: "+3 this month",
    trend: "up",
    icon: IconForms,
    gradient: "from-[oklch(0.62_0.19_48)] to-[oklch(0.7_0.2_60)]",
    glow: "oklch(0.62 0.19 48 / 20%)",
  },
  {
    label: "Total Submissions",
    value: "1,234",
    change: "+18% from last month",
    trend: "up",
    icon: IconChartBar,
    gradient: "from-[oklch(0.45_0.14_260)] to-[oklch(0.55_0.16_280)]",
    glow: "oklch(0.45 0.14 260 / 20%)",
  },
  {
    label: "Active Forms",
    value: "8",
    change: "-1 deactivated",
    trend: "down",
    icon: IconStar,
    gradient: "from-[oklch(0.5_0.14_145)] to-[oklch(0.6_0.14_160)]",
    glow: "oklch(0.5 0.14 145 / 20%)",
  },
  {
    label: "Respondents",
    value: "456",
    change: "+12.5% growth",
    trend: "up",
    icon: IconUsers,
    gradient: "from-[oklch(0.65_0.18_25)] to-[oklch(0.7_0.16_40)]",
    glow: "oklch(0.65 0.18 25 / 20%)",
  },
]

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const TrendIcon = card.trend === "up" ? IconTrendingUp : IconTrendingDown
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
            style={{
              background: "oklch(1 0.005 80)",
              border: "1px solid oklch(0.88 0.025 75)",
            }}
          >
            {/* Subtle top glow */}
            <div
              className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full blur-2xl opacity-60 transition-opacity group-hover:opacity-80"
              style={{ background: card.glow }}
            />

            {/* Icon + badge row */}
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div
                className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-sm`}
              >
                <Icon className="size-5 text-white" />
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  card.trend === "up"
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-rose-600 bg-rose-50"
                }`}
              >
                <TrendIcon className="size-3" />
                {card.trend === "up" ? "Up" : "Down"}
              </span>
            </div>

            {/* Value */}
            <div className="relative z-10">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                {card.change}
              </p>
            </div>

            {/* Bottom decorative bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.gradient} opacity-60`}
            />
          </div>
        )
      })}
    </div>
  )
}
