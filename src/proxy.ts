import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/auth.config"

// Build the auth helper from the edge-safe config only. This avoids importing
// the Prisma adapter / bcrypt (Node-only) into the proxy, which previously
// crashed before any route could be served.
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth?.user

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register")
  const isApiAuth = pathname.startsWith("/api/auth")

  if (pathname.startsWith("/api/dbcheck")) return NextResponse.next()
  if (isApiAuth) return NextResponse.next()
  if (isAuthPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/analyze", req.url))
    return NextResponse.next()
  }
  if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url))
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
