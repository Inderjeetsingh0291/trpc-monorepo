"use client"

import * as React from "react"
import {
  IconClipboardText,
  IconWorld,
  IconInbox,
  IconHelp,
  IconMessageCircle,
  IconBolt,
  IconChartBar,
  IconSparkles,
  IconCreditCard,
} from "@tabler/icons-react"
import { usePathname } from "next/navigation"

import { NavUser } from "~/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"

const data = {
  user: {
    name: "inder",
    email: "inderjeet8314@gmail.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconChartBar,
    },
    {
      title: "My Forms",
      url: "/dashboard/forms",
      icon: IconChartBar,
    },
    {
      title: "Public Forms",
      url: "/dashboard/public-forms",
      icon: IconWorld,
    },
    {
      title: "Your Submissions",
      url: "/dashboard/submissions",
      icon: IconInbox,
    },
    {
      title: "Pricing",
      url: "/dashboard/pricing",
      icon: IconCreditCard,
    },
    {
      title: "API Docs",
      url: "/docs",
      icon: IconBolt,
    },
  ],
  navSecondary: [
    {
      title: "Help & Support",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Feedback",
      url: "http://localhost:3000/form/f212dde1-5ba9-4ab3-9bed-82da87e6fd08",
      icon: IconMessageCircle,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Sidebar Header — Logo with Punjab Saffron */}
      <SidebarHeader className="border-b border-sidebar-border/60 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-2! h-auto hover:bg-sidebar-accent/60"
            >
              <a href="/dashboard/forms" className="flex items-center gap-3">
                {/* Emblem: Punjab Pic */}
                <div
                  className="flex size-9 items-center justify-center rounded-xl shadow-lg bg-white overflow-hidden p-0.5"
                >
                  <img src="/Punjab-removebg-preview.png" alt="Punjab Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="truncate font-semibold text-lg" style={{ fontFamily: "var(--font-geist-sans)" }}>
                    MakeForms
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/50 font-medium uppercase tracking-widest">
                    Punjab Edition
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {/* Main Navigation */}
        <div className="px-3">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
            Navigation
          </p>
          <SidebarMenu className="gap-1">
            {data.navMain.map((item) => {
              const isActive = pathname === item.url
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`
                      h-10 rounded-xl font-medium transition-all duration-200
                      hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                      ${isActive
                        ? "bg-gradient-to-r from-[oklch(0.62_0.19_48)] to-[oklch(0.7_0.2_60)] text-white shadow-lg hover:text-white"
                        : "text-sidebar-foreground/70"
                      }
                    `}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3">
                      <item.icon className={`size-4 ${isActive ? "text-white" : "text-sidebar-foreground/50"}`} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </div>

        {/* Decorative divider — phulkari inspired */}
        <div className="mx-3 my-4 flex items-center gap-2 opacity-30">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[oklch(0.62_0.19_48)] to-transparent" />
          <IconSparkles className="size-3 text-[oklch(0.62_0.19_48)]" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[oklch(0.62_0.19_48)] to-transparent" />
        </div>

        {/* Secondary Navigation */}
        <div className="px-3">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
            Support
          </p>
          <SidebarMenu className="gap-1">
            {data.navSecondary.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="h-10 rounded-xl text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <a href={item.url} className="flex items-center gap-3 px-3">
                    <item.icon className="size-4 text-sidebar-foreground/40" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      {/* Footer — Plan card with Punjab saffron style */}
      {/* <SidebarFooter className="border-t border-sidebar-border/60 px-3 pt-4 pb-4 gap-3">
        <div
          className="flex flex-col gap-3 rounded-xl p-4"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 18%), oklch(0.5 0.14 145 / 12%))",
            border: "1px solid oklch(0.62 0.19 48 / 25%)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[oklch(0.78_0.16_55)] uppercase tracking-widest">
              Starter Plan
            </span>
            <IconBolt className="size-4 text-[oklch(0.7_0.19_55)]" />
          </div>
          <div className="flex items-center justify-between text-xs text-sidebar-foreground/50">
            <span>3 forms left</span>
            <span>0 / 3</span>
          </div>
          <Progress
            value={0}
            className="h-1.5 bg-sidebar-accent/50"
            style={{ ["--progress-fill" as string]: "oklch(0.62 0.19 48)" }}
          />
          <Button
            variant="outline"
            className="h-8 w-full border-[oklch(0.62_0.19_48)/40%] text-[oklch(0.78_0.16_55)] text-xs font-semibold hover:bg-[oklch(0.62_0.19_48)/15%] hover:border-[oklch(0.62_0.19_48)/60%] transition-all"
          >
            <IconBolt className="mr-1.5 size-3.5" />
            Upgrade to Pro
          </Button>
        </div>
        <NavUser user={data.user} />
      </SidebarFooter> */}
      <SidebarFooter className="border-t border-sidebar-border/60 px-3 pt-4 pb-4">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
