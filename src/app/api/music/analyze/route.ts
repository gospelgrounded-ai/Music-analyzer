import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/music-prompts"
import type { AudioMetadata, ClaudeAnalysisResult } from "@/types/music"

export const maxDuration = 60
export const dynamic = "force-dynamic"

const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/flac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/ogg",
  "audio/aac",
  "audio/x-wav",
])
const MAX_BYTES = 4 * 1024 * 1024 // 4 MB (Vercel free tier limit)

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type) && !file.name.match(/\.(mp3|wav|flac|m4a|ogg|aac)$/i)) {
    return NextResponse.json(
      { error: "Unsupported format. Please upload MP3, WAV, FLAC, M4A, OGG, or AAC." },
      { status: 400 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_BYTES / 1024 / 1024}MB.` },
      { status: 413 }
    )
  }

  const songTitle = formData.get("songTitle")?.toString() || null
  const artistName = formData.get("artistName")?.toString() || null
  const genre = formData.get("genre")?.toString() || null
  const targetAudience = formData.get("targetAudience")?.toString() || null

  const buffer = Buffer.from(await file.arrayBuffer())

  // Extract audio metadata
  let metadata: AudioMetadata = {
    durationSeconds: null,
    bitrate: null,
    sampleRate: null,
    channels: null,
    audioFormat: null,
    bpm: null,
    embeddedTags: {},
  }

  try {
    const { parseBuffer } = await import("music-metadata")
    const parsed = await parseBuffer(buffer, { mimeType: file.type })
    metadata = {
      durationSeconds: parsed.format.duration ?? null,
      bitrate: parsed.format.bitrate ? Math.round(parsed.format.bitrate / 1000) : null,
      sampleRate: parsed.format.sampleRate ?? null,
      channels: parsed.format.numberOfChannels ?? null,
      audioFormat: parsed.format.codec ?? parsed.format.container ?? null,
      bpm: parsed.common.bpm ?? null,
      embeddedTags: {
        title: parsed.common.title ?? null,
        artist: parsed.common.artist ?? null,
        album: parsed.common.album ?? null,
        genre: parsed.common.genre ?? null,
        year: parsed.common.year ?? null,
      },
    }
  } catch (err) {
    console.error("[MUSIC_METADATA]", err)
    // Non-fatal: proceed with empty metadata
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Analysis service not configured" }, { status: 503 })
  }

  const userMessage = buildUserMessage({
    fileName: file.name,
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
        fileName: file.name,
        fileSize: file.size,
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
