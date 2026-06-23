import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import type { NextRequest, NextFetchEvent } from "next/server"
import { authConfig } from "@/auth.config"

// TEMPORARY DIAGNOSTIC PROXY.
// /__diag2 invokes the real NextAuth proxy middleware in a try/catch and
// returns the actual error, to capture what throws on Vercel. Reverted after.
const { auth } = NextAuth(authConfig)
const authMiddleware = auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth?.user
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register")
  const isApiAuth = pathname.startsWith("/api/auth")
  if (isApiAuth) return NextResponse.next()
  if (isAuthPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/analyze", req.url))
    return NextResponse.next()
  }
  if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url))
  return NextResponse.next()
}) as unknown as (
  req: NextRequest,
  ev: NextFetchEvent
) => Promise<Response>

export default async function proxy(req: NextRequest, ev: NextFetchEvent) {
  if (req.nextUrl.pathname === "/__diag2") {
    try {
      await authMiddleware(req, ev)
      return NextResponse.json({ ok: true })
    } catch (e) {
      const err = e as Error
      return NextResponse.json({
        ok: false,
        name: err?.name ?? null,
        message: err?.message ?? String(e),
        stack: String(err?.stack ?? "").slice(0, 1500),
      })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
