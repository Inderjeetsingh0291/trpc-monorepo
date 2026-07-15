import { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Documentation | MakeForms",
  description: "API Reference for MakeForms",
}

export default function DocsPage() {
  return (
    <div className="flex h-screen w-full flex-col">
      <iframe
        src="http://localhost:8000/docs"
        className="h-full w-full border-none"
        title="API Documentation"
        allow="clipboard-write"
      />
    </div>
  )
}
