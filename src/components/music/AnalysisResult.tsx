"use client"

import type { MusicAnalysisRecord } from "@/types/music"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ScoreDisplay from "./ScoreDisplay"
import MarketingPlanTabs from "./MarketingPlanTabs"
import { FileMusic, Sparkles } from "lucide-react"

interface AnalysisResultProps {
  analysis: MusicAnalysisRecord
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—"
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const { result } = analysis

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm leading-relaxed">{result.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Song meta */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileMusic className="h-4 w-4 text-primary" />
            {analysis.songTitle ?? analysis.fileName}
            {analysis.artistName && (
              <span className="text-sm font-normal text-muted-foreground">
                by {analysis.artistName}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {analysis.genre && <span>Genre: {analysis.genre}</span>}
            {analysis.durationSeconds && (
              <span>Duration: {formatDuration(analysis.durationSeconds)}</span>
            )}
            {analysis.bitrate && <span>Bitrate: {analysis.bitrate} kbps</span>}
            {analysis.sampleRate && <span>Sample rate: {analysis.sampleRate} Hz</span>}
            {analysis.bpm && <span>BPM: {analysis.bpm}</span>}
            {analysis.audioFormat && <span>Format: {analysis.audioFormat}</span>}
            <span>File size: {formatBytes(analysis.fileSize)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Success Score</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreDisplay score={result.successScore} />
        </CardContent>
      </Card>

      {/* Marketing plan */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Marketing Plan</h3>
        <MarketingPlanTabs plan={result.marketingPlan} />
      </div>
    </div>
  )
}
