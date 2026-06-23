import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// TEMPORARY DIAGNOSTIC — verifies Prisma can reach the database. Reverted after.
export async function GET() {
  try {
    const count = await db.user.count()
    return NextResponse.json({ ok: true, userCount: count })
  } catch (e) {
    const err = e as Error
    return NextResponse.json({
      ok: false,
      name: err?.name ?? null,
      message: err?.message ?? String(e),
      stack: String(err?.stack ?? "").slice(0, 1800),
    })
  }
}
