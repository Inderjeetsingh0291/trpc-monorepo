"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "~/trpc/client"
import { Spinner } from "~/components/ui/spinner"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  const { data: user, isLoading, error } = trpc.auth.getLoggedInUserInfo.useQuery(undefined, {
    retry: false, // Don't retry on UNAUTHORIZED — redirect immediately
  })

  const isUnauthenticated = !isLoading && (!user || error)

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace("/login")
    }
  }, [isUnauthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8 text-orange-500" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (isUnauthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-8 text-orange-500" />
      </div>
    )
  }

  return <>{children}</>
}
