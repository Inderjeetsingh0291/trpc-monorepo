import { NextResponse } from "next/server"
import { generateOpenApiDocument } from "trpc-to-openapi"
import { serverRouter } from "@repo/trpc/server"

export async function GET() {
  const defaultHost = process.env.NODE_ENV === "production" ? "https://make-forms.vercel.app" : "http://localhost:3000"
  const hostUrl = process.env.NEXT_PUBLIC_APP_URL || defaultHost

  const openApiDocument = generateOpenApiDocument(serverRouter, {
    title: "MakeForms API Reference",
    description: "Complete OpenAPI specification and documentation for MakeForms platform.",
    version: "1.0.0",
    baseUrl: `${hostUrl}/api`,
  })

  return NextResponse.json(openApiDocument)
}
