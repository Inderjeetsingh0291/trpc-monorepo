import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import {createCookieFactory, getCookieFactory, clearCookieFactory} from './utils/cookie';

export interface TRPCCtxUser {
    id: string,
}

export interface TRPCContext {
    createCookie: ReturnType<typeof createCookieFactory>,
    getCookie: ReturnType<typeof getCookieFactory>,
    clearCookie: ReturnType<typeof clearCookieFactory>

    user?: TRPCCtxUser
    ip?: string
}

export async function createContext({
    req, res
}: CreateExpressContextOptions
): Promise<TRPCContext> {
    const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "unknown"

    const ctx: TRPCContext = {
        createCookie: createCookieFactory(res),
        getCookie: getCookieFactory(req),
        clearCookie: clearCookieFactory(res),
        user: undefined,
        ip,
    }
    return ctx
}

export function createFetchContext(req: Request, responseHeaders: Headers): TRPCContext {
    const cookieHeader = req.headers.get("cookie") || ""
    const parsedCookies: Record<string, string> = {}
    cookieHeader.split(";").forEach((c) => {
        const [k, ...v] = c.trim().split("=")
        if (k) parsedCookies[k] = v.join("=")
    })

    return {
        createCookie: (name, value, options = {}) => {
            let cookieStr = `${name}=${value}; Path=${options.path || "/"}; HttpOnly; SameSite=${options.sameSite || "Lax"}`
            if (options.maxAge) {
                cookieStr += `; Max-Age=${Math.floor(options.maxAge / 1000)}`
            }
            if (options.secure || process.env.NODE_ENV === "production") {
                cookieStr += "; Secure"
            }
            responseHeaders.append("Set-Cookie", cookieStr)
        },
        getCookie: (name) => parsedCookies[name],
        clearCookie: (name) => {
            responseHeaders.append(
                "Set-Cookie",
                `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`
            )
        },
        user: undefined,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    }
}

export type Context = Awaited<ReturnType<typeof createContext>>;

