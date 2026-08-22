"use client"

import { ApiReferenceReact } from "@scalar/api-reference-react"
import "@scalar/api-reference-react/style.css"

export default function DocsPage() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <ApiReferenceReact
        configuration={{
          spec: {
            url: "/api/openapi.json",
          },
          theme: "purple",
          darkMode: true,
          hideDownloadButton: false,
          showSidebar: true,
        }}
      />
    </div>
  )
}
