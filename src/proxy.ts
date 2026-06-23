import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// TEMPORARY DIAGNOSTIC PROXY — reports presence (booleans only, never values)
// of required env vars on Vercel, and otherwise passes every request through.
// This is deployed briefly to confirm the production runtime config, then
// reverted to the real auth-protecting proxy.
export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/__diag") {
    return NextResponse.json({
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      AUTH_URL: !!process.env.AUTH_URL,
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      VERCEL: process.env.VERCEL ?? null,
      VERCEL_ENV: process.env.VERCEL_ENV ?? null,
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
