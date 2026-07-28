import { CookieOptions, Response, Request } from "express";
import { TRPCContext } from "../context";

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const TWELVE_HOURS = 12 * ONE_HOUR;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 12 * ONE_MONTH;

const defaultCookieOption: CookieOptions = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TWELVE_HOURS,
};

export function createCookieFactory(res: Response) {
    return function createCookie(
        name: string, value: string, options: CookieOptions = defaultCookieOption
    ) {
        res.cookie(name, value, options );
    }
}

export function getCookieFactory(req: any) {
    return function getCookie(name: string) {
        return req.cookies[name];
    }
}

export function clearCookieFactory(res: Response) {
    return function clearCookie(name: string) {
        res.clearCookie(name);
    }
}

// Authentication cookies
const AUTHENTICATION_COOKIE_NAME = "authentication-token";

export function setAuthenticationCookie(ctx: TRPCContext, accessToken: string) {
    ctx.createCookie(AUTHENTICATION_COOKIE_NAME, accessToken);
}

export function getAuthenticationCookie(ctx: TRPCContext) {
    return ctx.getCookie(AUTHENTICATION_COOKIE_NAME);
}

export function clearAuthenticationCookie(ctx: TRPCContext) {
    ctx.clearCookie(AUTHENTICATION_COOKIE_NAME);
}