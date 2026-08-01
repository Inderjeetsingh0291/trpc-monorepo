import { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Documentation | MakeForms",
  description: "API Reference for MakeForms",
}

export default function DocsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === "production" ? "https://makeforms.onrender.com" : "http://localhost:8000")
  const docsUrl = `${apiUrl}/docs`

  return (
    <div className="flex h-screen w-full flex-col">
      <iframe
        src={docsUrl}
        className="h-full w-full border-none"
        title="API Documentation"
        allow="clipboard-write"
      />
    </div>
  )
}
