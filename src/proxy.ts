import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isApiAuth = pathname.startsWith("/api/auth")

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
