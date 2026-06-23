"use client"

import { cn } from "@/lib/utils"
import type { SuccessScore } from "@/types/music"

interface ScoreDisplayProps {
  score: SuccessScore
}

const CATEGORIES = [
  { key: "productionQuality" as const, label: "Production Quality" },
  { key: "commercialAppeal" as const, label: "Commercial Appeal" },
  { key: "genreTrendFit" as const, label: "Genre Trend Fit" },
  { key: "hookCatchiness" as const, label: "Hook & Catchiness" },
  { key: "replayVirality" as const, label: "Replay & Virality" },
]

function getScoreColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.75) return "bg-emerald-500"
  if (pct >= 0.5) return "bg-amber-500"
  return "bg-red-500"
}

function getOverallColor(score: number): string {
  if (score >= 75) return "text-emerald-500"
  if (score >= 50) return "text-amber-500"
  return "text-red-500"
}

function getOverallLabel(score: number): string {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Strong"
  if (score >= 55) return "Promising"
  if (score >= 40) return "Developing"
  return "Early Stage"
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (score.overall / 100) * circumference

  return (
    <div className="space-y-6">
      {/* Radial gauge */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-40 h-40">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full -rotate-90"
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted/30"
            />
            {/* Progress */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className={cn(
                "transition-all duration-1000 ease-out",
                score.overall >= 75
                  ? "stroke-emerald-500"
                  : score.overall >= 50
                  ? "stroke-amber-500"
                  : "stroke-red-500"
              )}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold tabular-nums", getOverallColor(score.overall))}>
              {score.overall}
            </span>
            <span className="text-xs text-muted-foreground font-medium">/ 100</span>
          </div>
        </div>
        <div className="text-center">
          <p className={cn("text-lg font-semibold", getOverallColor(score.overall))}>
            {getOverallLabel(score.overall)}
          </p>
          <p className="text-sm text-muted-foreground">Commercial Potential Score</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label }) => {
          const cat = score[key]
          const pct = (cat.score / 20) * 100
          return (
            <details key={key} className="group">
              <summary className="flex items-center gap-3 cursor-pointer list-none select-none">
                <span className="text-sm font-medium w-40 shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      getScoreColor(cat.score, 20)
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums w-10 text-right">
                  {cat.score}/20
                </span>
              </summary>
              <p className="mt-1.5 ml-40 text-xs text-muted-foreground leading-relaxed pb-1">
                {cat.reasoning}
              </p>
            </details>
          )
        })}
      </div>
    </div>
  )
}
