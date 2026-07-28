"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "~/components/ui/spinner"

export default function NewFormPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/forms?create=true")
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div
        className="flex size-14 items-center justify-center rounded-2xl shadow-md bg-white"
        style={{ boxShadow: "0 0 25px oklch(0.62 0.19 48 / 20%)" }}
      >
        <Spinner className="size-6 text-[oklch(0.62_0.19_48)]" />
      </div>
    </div>
  )
}
