"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AudioMetadata, MusicAnalysisRecord } from "@/types/music"
import { Music2, Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MAX_UPLOAD_MB, MAX_UPLOAD_BYTES } from "@/lib/upload-limits"

const ACCEPTED = [".mp3", ".wav", ".flac", ".m4a", ".ogg", ".aac"]

// Parse audio metadata in the browser so the full file never has to be
// uploaded (which would hit Vercel's ~4.5 MB request-body limit).
async function extractMetadata(file: File): Promise<AudioMetadata> {
  const empty: AudioMetadata = {
    durationSeconds: null,
    bitrate: null,
    sampleRate: null,
    channels: null,
    audioFormat: null,
    bpm: null,
    embeddedTags: {},
  }
  try {
    const { parseBlob } = await import("music-metadata")
    const parsed = await parseBlob(file)
    return {
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
  } catch {
    // Non-fatal: proceed with empty metadata.
    return empty
  }
}

export default function MusicAnalyzerForm() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [fields, setFields] = useState({
    songTitle: "",
    artistName: "",
    genre: "",
    targetAudience: "",
  })

  function validateFile(f: File): string | null {
    const ext = "." + f.name.split(".").pop()?.toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      return `Unsupported format. Accepted: ${ACCEPTED.join(", ")}`
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      return `File too large. Maximum size is ${MAX_UPLOAD_MB} MB.`
    }
    return null
  }

  function handleFileSelect(f: File) {
    const err = validateFile(f)
    if (err) {
      setFileError(err)
      setFile(null)
      return
    }
    setFileError(null)
    setFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setIsAnalyzing(true)
    try {
      const metadata = await extractMetadata(file)

      const res = await fetch("/api/music/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          songTitle: fields.songTitle || null,
          artistName: fields.artistName || null,
          genre: fields.genre || null,
          targetAudience: fields.targetAudience || null,
          metadata,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(data.error ?? `Error ${res.status}`)
      }

      const data = await res.json() as { analysis: MusicAnalysisRecord }
      router.push(`/history/${data.analysis.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed"
      toast.error(message)
      setIsAnalyzing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Drop zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : file
            ? "border-emerald-500 bg-emerald-500/5"
            : "border-muted-foreground/30 hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <Music2 className="h-8 w-8 text-emerald-500 shrink-0" />
            <div className="text-left">
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              className="ml-2 p-1 rounded-full hover:bg-muted transition-colors"
              onClick={(e) => { e.stopPropagation(); setFile(null) }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-10 w-10 text-muted-foreground/50" />
            <div>
              <p className="font-medium">Drop your audio file here</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                or click to browse · {ACCEPTED.join(", ")} · max {MAX_UPLOAD_MB} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {fileError && (
        <p className="text-sm text-destructive -mt-4">{fileError}</p>
      )}

      {/* Optional metadata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="songTitle">Song Title</Label>
          <Input
            id="songTitle"
            placeholder="My Track"
            value={fields.songTitle}
            onChange={(e) => setFields((f) => ({ ...f, songTitle: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="artistName">Artist Name</Label>
          <Input
            id="artistName"
            placeholder="Your name / band"
            value={fields.artistName}
            onChange={(e) => setFields((f) => ({ ...f, artistName: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="genre">Genre</Label>
          <Input
            id="genre"
            placeholder="e.g. Afrobeats, Hip-Hop, Pop"
            value={fields.genre}
            onChange={(e) => setFields((f) => ({ ...f, genre: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            placeholder="e.g. Young adults 18-25 in the UK"
            value={fields.targetAudience}
            onChange={(e) => setFields((f) => ({ ...f, targetAudience: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Additional Context <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Textarea
          id="description"
          placeholder="Describe your song's vibe, inspiration, or any specific marketing goals..."
          className="resize-none"
          rows={3}
          value={fields.targetAudience}
          onChange={(e) => setFields((f) => ({ ...f, targetAudience: e.target.value }))}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!file || isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing your track...
          </>
        ) : (
          <>
            <Music2 className="mr-2 h-4 w-4" />
            Analyze & Generate Marketing Plan
          </>
        )}
      </Button>
    </form>
  )
}
