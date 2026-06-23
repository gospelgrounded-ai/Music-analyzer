import type { PlatformStrategy } from "@/types/music"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Hash, ImageIcon, Lightbulb } from "lucide-react"

const PLATFORM_ICONS: Record<string, string> = {
  TikTok: "🎵",
  "Instagram Reels": "📸",
  "YouTube Shorts": "▶️",
  "Spotify & Apple Music": "🎧",
  "Twitter/X": "🐦",
}

interface PlatformCardProps {
  strategy: PlatformStrategy
}

export default function PlatformCard({ strategy }: PlatformCardProps) {
  const icon = PLATFORM_ICONS[strategy.platform] ?? "📱"

  return (
    <Card className="h-full">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-xl">{icon}</span>
          {strategy.platform}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="flex gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
              What to Post
            </p>
            <p className="text-sm">{strategy.whatToPost}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <ImageIcon className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
              How to Post
            </p>
            <p className="text-sm">{strategy.howToPost}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Clock className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
              When to Post
            </p>
            <p className="text-sm">{strategy.whenToPost}</p>
          </div>
        </div>

        {strategy.hashtagsKeywords.length > 0 && (
          <div className="flex gap-2">
            <Hash className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Tags & Keywords
              </p>
              <div className="flex flex-wrap gap-1">
                {strategy.hashtagsKeywords.slice(0, 8).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal">
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
