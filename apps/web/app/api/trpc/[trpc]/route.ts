import { serverRouter, createFetchContext, fetchRequestHandler } from "@repo/trpc/server"

const handler = async (req: Request) => {
  const responseHeaders = new Headers()
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: serverRouter,
    createContext: () => createFetchContext(req, responseHeaders),
  })

  responseHeaders.forEach((value, key) => {
    response.headers.append(key, value)
  })

  return response
}

export { handler as GET, handler as POST }
