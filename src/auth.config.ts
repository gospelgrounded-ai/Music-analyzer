import type { NextAuthConfig } from "next-auth"

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
