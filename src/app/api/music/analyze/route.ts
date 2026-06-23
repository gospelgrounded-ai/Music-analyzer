import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/music-prompts"
import type { AudioMetadata, ClaudeAnalysisResult } from "@/types/music"
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload-limits"

export const maxDuration = 60
export const dynamic = "force-dynamic"

// The audio file is parsed for metadata in the browser and never uploaded —
// only this small JSON payload reaches the server. That sidesteps Vercel's
// ~4.5 MB serverless request-body limit, so songs of any size are supported.
const metadataSchema = z.object({
  durationSeconds: z.number().nullable(),
  bitrate: z.number().nullable(),
  sampleRate: z.number().nullable(),
  channels: z.number().nullable(),
  audioFormat: z.string().nullable(),
  bpm: z.number().nullable(),
  embeddedTags: z.record(z.string(), z.unknown()).default({}),
})

const bodySchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().nonnegative().max(MAX_UPLOAD_BYTES),
  songTitle: z.string().max(200).nullish(),
  artistName: z.string().max(200).nullish(),
  genre: z.string().max(200).nullish(),
  targetAudience: z.string().max(2000).nullish(),
  metadata: metadataSchema,
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0]
      const msg = issue.path[0] === "fileSize"
        ? `File too large. Maximum size is ${MAX_UPLOAD_MB} MB.`
        : issue.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { fileName, fileSize, metadata } = body
  const songTitle = body.songTitle || null
  const artistName = body.artistName || null
  const genre = body.genre || null
  const targetAudience = body.targetAudience || null

  if (!fileName.match(/\.(mp3|wav|flac|m4a|ogg|aac)$/i)) {
    return NextResponse.json(
      { error: "Unsupported format. Please upload MP3, WAV, FLAC, M4A, OGG, or AAC." },
      { status: 400 }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Analysis service not configured" }, { status: 503 })
  }

  const userMessage = buildUserMessage({
    fileName,
    songTitle,
    artistName,
    genre,
    targetAudience,
    metadata,
  })

  let claudeResult: ClaudeAnalysisResult
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default
    const anthropic = new Anthropic({ apiKey })
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    })
    const rawText = message.content[0].type === "text" ? message.content[0].text : "{}"
    claudeResult = JSON.parse(rawText) as ClaudeAnalysisResult
  } catch (err) {
    console.error("[MUSIC_CLAUDE]", err)
    return NextResponse.json({ error: "Analysis generation failed. Please try again." }, { status: 502 })
  }

  try {
    const record = await db.musicAnalysis.create({
      data: {
        userId: session.user.id,
        fileName,
        fileSize,
        songTitle,
        artistName,
        genre,
        targetAudience,
        durationSeconds: metadata.durationSeconds,
        bitrate: metadata.bitrate,
        sampleRate: metadata.sampleRate,
        channels: metadata.channels,
        audioFormat: metadata.audioFormat,
        bpm: metadata.bpm,
        embeddedTags: JSON.stringify(metadata.embeddedTags),
        result: JSON.stringify(claudeResult),
        overallScore: claudeResult.successScore.overall,
      },
    })

    return NextResponse.json(
      { analysis: { ...record, result: claudeResult } },
      { status: 201 }
    )
  } catch (err) {
    console.error("[MUSIC_DB]", err)
    return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 })
  }
}
