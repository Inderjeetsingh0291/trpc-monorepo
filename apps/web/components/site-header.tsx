import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { IconFlame } from "@tabler/icons-react"

export function SiteHeader() {
  return (
    <header
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
      style={{ borderColor: "oklch(0.88 0.025 75)" }}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 bg-border/60"
        />
        {/* Breadcrumb / title with subtle Punjab accent */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-[oklch(0.18_0.05_40)] text-lg tracking-tight">
            MakeForms
          </span>
          <span
            className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 15%), oklch(0.5 0.14 145 / 10%))",
              color: "oklch(0.55 0.16 50)",
              border: "1px solid oklch(0.62 0.19 48 / 25%)",
            }}
          >
            <IconFlame className="size-2.5" />
            Punjab
          </span>
        </div>

        {/* Right side — decorative phulkari dots */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: "oklch(0.62 0.19 48)" }}
            />
            <span
              className="size-2 rounded-full"
              style={{ background: "oklch(0.5 0.14 145)" }}
            />
            <span
              className="size-2 rounded-full"
              style={{ background: "oklch(0.7 0.15 75)" }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
