import type { NextAuthConfig } from "next-auth"

// On Vercel, NEXTAUTH_URL was configured without a scheme (e.g.
// "music-analyzer-xxxx.vercel.app"), which made Auth.js throw
// `TypeError: Invalid URL` while resolving the session in the proxy.
// With `trustHost: true` Auth.js derives the URL from the incoming request,
// so we drop a malformed NEXTAUTH_URL / AUTH_URL rather than let it be parsed.
// (Proper long-term fix: correct or remove NEXTAUTH_URL in the Vercel env.)
for (const key of ["NEXTAUTH_URL", "AUTH_URL"] as const) {
  const value = process.env[key]
  if (value && !/^https?:\/\//i.test(value)) {
    delete process.env[key]
  }
}

// Edge-safe auth config shared between the proxy (runs before every request)
// and the full Node.js auth setup in `auth.ts`. It must NOT import Prisma,
// bcrypt, or any other Node-only module so it can be bundled into the proxy.
export const authConfig = {
  // Trust the host header. Required so Auth.js doesn't throw `UntrustedHost`
  // when running behind Vercel's proxy / in the Node proxy runtime.
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [],
} satisfies NextAuthConfig
