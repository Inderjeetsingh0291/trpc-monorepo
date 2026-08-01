"use client"

import { SectionCards } from "~/components/section-cards"
import {
  IconPlus,
  IconForms,
  IconArrowRight,
  IconActivity,
  IconClock,
  IconFileText,
  IconCheck,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"
import { useGetDashboardStats } from "~/hooks/api/form"
import { Skeleton } from "~/components/ui/skeleton"
import PricingPage from "./pricing/page"
import { usePullRefresh } from "~/hooks/use-pull-refresh"
import { PullRefreshIndicator } from "~/components/pull-refresh-indicator"
import { trpc } from "~/trpc/client"

/* ─── Quick Action Card ─── */
function QuickAction({
  href,
  icon: Icon,
  label,
  desc,
  gradient,
}: {
  href: string
  icon: React.ElementType
  label: string
  desc: string
  accent: string
  gradient: string
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 rounded-xl border border-[oklch(0.88_0.025_75)] bg-[oklch(1_0.005_80)] px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
    >
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}
      >
        <Icon className="size-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[oklch(0.18_0.04_30)] truncate">{label}</p>
        <p className="text-xs text-[oklch(0.5_0.04_50)] mt-0.5 truncate">{desc}</p>
      </div>
      <IconArrowRight className="size-4 text-[oklch(0.7_0.03_50)] transition-transform group-hover:translate-x-1" />
      {/* hover accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
    </Link>
  )
}

/* ─── Recent Activity Feed ─── */
function RecentActivityFeed() {
  const { stats, isLoading } = useGetDashboardStats()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    )
  }

  const recent = stats?.recentSubmissions ?? []

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <IconActivity className="size-8 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No recent submissions</p>
        <p className="text-xs text-muted-foreground/70">Submissions to your forms will appear here in real-time.</p>
      </div>
    )
  }

  return (
    <div>
      {recent.map((sub) => (
        <div key={sub.id} className="flex items-start gap-3 py-3 border-b border-[oklch(0.92_0.01_75)] last:border-0">
          <div
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.5_0.14_145)/12%] text-[oklch(0.5_0.14_145)]"
          >
            <IconCheck className="size-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[oklch(0.25_0.04_30)] font-medium leading-snug truncate">
              New submission for <Link href={`/dashboard/forms/${sub.formId}/submissions`} className="font-semibold text-[oklch(0.62_0.19_48)] hover:underline">{sub.formTitle}</Link>
            </p>
            <p className="text-xs text-[oklch(0.6_0.03_50)] mt-0.5 flex items-center gap-1">
              <IconClock className="size-3" />
              {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "Just now"}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  const utils = trpc.useUtils()

  const { isPulling, pullDistance, isRefreshing, threshold } = usePullRefresh({
    onRefresh: async () => {
      // Invalidate all tRPC queries to refetch fresh data
      await utils.form.invalidate()
    },
  })

  return (
    <div className="flex flex-col gap-6 py-6">

      {/* Pull-to-refresh indicator */}
      <PullRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        threshold={threshold}
      />

      {/* ── Page Header ── */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[oklch(0.14_0.04_30)]">
              Dashboard
            </h1>
            <p className="text-sm text-[oklch(0.5_0.04_50)] mt-0.5">
              Welcome back — here&apos;s what&apos;s happening with your forms.
            </p>
          </div>
          <Link
            href="/dashboard/forms?create=true"
            className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.62_0.19_48)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[oklch(0.55_0.16_48)] hover:shadow-lg hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <IconPlus className="size-4" />
            New Form
          </Link>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <SectionCards />

      {/* ── Quick Actions + Activity ── */}
      <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 xl:grid-cols-[1fr_340px]">

        {/* Quick Actions */}
        <div className="rounded-2xl border border-[oklch(0.88_0.025_75)] bg-[oklch(1_0.005_80)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[oklch(0.18_0.04_30)]">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickAction
              href="/dashboard/forms"
              icon={IconForms}
              label="View All Forms"
              desc="Manage your form collection"
              accent="oklch(0.62 0.19 48)"
              gradient="from-[oklch(0.62_0.19_48)] to-[oklch(0.7_0.2_60)]"
            />
            <QuickAction
              href="/dashboard/forms"
              icon={IconPlus}
              label="Create New Form"
              desc="Build from scratch"
              accent="oklch(0.5 0.14 145)"
              gradient="from-[oklch(0.5_0.14_145)] to-[oklch(0.6_0.14_160)]"
            />
            <QuickAction
              href="/dashboard/public-forms"
              icon={IconUsers}
              label="Public Gallery"
              desc="Browse community forms"
              accent="oklch(0.45 0.14 260)"
              gradient="from-[oklch(0.45_0.14_260)] to-[oklch(0.55_0.16_280)]"
            />
            <QuickAction
              href="/docs"
              icon={IconFileText}
              label="API Documentation"
              desc="Integrate via REST API"
              accent="oklch(0.65 0.18 25)"
              gradient="from-[oklch(0.65_0.18_25)] to-[oklch(0.7_0.16_40)]"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-[oklch(0.88_0.025_75)] bg-[oklch(1_0.005_80)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <IconActivity className="size-4 text-[oklch(0.62_0.19_48)]" />
            <h2 className="text-base font-bold text-[oklch(0.18_0.04_30)]">Recent Submissions</h2>
          </div>
          <RecentActivityFeed />
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <PricingPage />
      </div>

    </div>
  )
}
