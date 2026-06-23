import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import type { ClaudeAnalysisResult, MusicAnalysisRecord } from "@/types/music"
import AnalysisResult from "@/components/music/AnalysisResult"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const record = await db.musicAnalysis.findUnique({
    where: { id },
    select: { songTitle: true, artistName: true },
  })
  if (!record) return { title: "Analysis — Music Analyzer" }
  const name = [record.songTitle, record.artistName].filter(Boolean).join(" by ") || "Analysis"
  return { title: `${name} — Music Analyzer` }
}

export default async function HistoryDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const record = await db.musicAnalysis.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!record) notFound()

  let result: ClaudeAnalysisResult
  try {
    result = JSON.parse(record.result) as ClaudeAnalysisResult
  } catch {
    notFound()
  }

  const analysis: MusicAnalysisRecord = {
    id: record.id,
    fileName: record.fileName,
    fileSize: record.fileSize,
    songTitle: record.songTitle,
    artistName: record.artistName,
    genre: record.genre,
    targetAudience: record.targetAudience,
    durationSeconds: record.durationSeconds,
    bitrate: record.bitrate,
    sampleRate: record.sampleRate,
    channels: record.channels,
    audioFormat: record.audioFormat,
    bpm: record.bpm,
    result,
    overallScore: record.overallScore,
    createdAt: record.createdAt.toISOString(),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/analyze">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            {record.songTitle ?? record.fileName}
          </h1>
          {record.artistName && (
            <p className="text-sm text-muted-foreground">by {record.artistName}</p>
          )}
        </div>
      </div>

      <AnalysisResult analysis={analysis} />
    </div>
  )
}
