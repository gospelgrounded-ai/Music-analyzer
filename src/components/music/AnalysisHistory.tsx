"use client"

import Link from "next/link"
import useSWR from "swr"
import type { AnalysisHistoryItem } from "@/types/music"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Music2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0",
        score >= 75 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
        : score >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      )}
    >
      {score}
    </span>
  )
}

export default function AnalysisHistory() {
  const { data, isLoading, error } = useSWR<AnalysisHistoryItem[]>(
    "/api/music/history",
    fetcher
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">Failed to load history.</p>
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Music2 className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No analyses yet. Upload your first track above.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <Link key={item.id} href={`/history/${item.id}`}>
          <Card className="hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <ScoreBadge score={item.overallScore} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.songTitle ?? item.fileName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {[item.artistName, item.genre].filter(Boolean).join(" · ") ||
                    item.fileName}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
