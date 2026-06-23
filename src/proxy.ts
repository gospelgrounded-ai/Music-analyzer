import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// TEMPORARY DIAGNOSTIC — reveals the configured auth URL values (the app's own
// public URL, not secret) to confirm a malformed NEXTAUTH_URL. Reverted after.
export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/__diag3") {
    return NextResponse.json({
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
      AUTH_URL: process.env.AUTH_URL ?? null,
      VERCEL_URL: process.env.VERCEL_URL ?? null,
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
