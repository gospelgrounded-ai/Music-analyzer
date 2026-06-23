"use client"

import type { MarketingPlan } from "@/types/music"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PlatformCard from "./PlatformCard"
import { CheckCircle2, DollarSign, Music2, Users } from "lucide-react"

interface MarketingPlanTabsProps {
  plan: MarketingPlan
}

export default function MarketingPlanTabs({ plan }: MarketingPlanTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="platforms">Platforms</TabsTrigger>
        <TabsTrigger value="calendar">30-Day Plan</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview" className="mt-4 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Target Audience Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{plan.targetAudienceProfile}</p>
          </CardContent>
        </Card>

        {plan.hookClipRecommendations.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Music2 className="h-4 w-4 text-primary" />
                Best Clip Moments for Short-Form Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {plan.hookClipRecommendations.map((rec, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary font-bold text-sm shrink-0">{i + 1}.</span>
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Platforms */}
      <TabsContent value="platforms" className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {plan.platformStrategies.map((strategy) => (
            <PlatformCard key={strategy.platform} strategy={strategy} />
          ))}
        </div>
      </TabsContent>

      {/* 30-Day Calendar */}
      <TabsContent value="calendar" className="mt-4 space-y-4">
        {plan.contentCalendar.map((week) => (
          <Card key={week.week}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Week {week.week}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  — {week.theme}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {week.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      {/* Budget & Playlists */}
      <TabsContent value="budget" className="mt-4 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-primary" />
              Paid Promotion Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{plan.paidPromotionBudget}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Music2 className="h-4 w-4 text-primary" />
              Playlist Pitching Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{plan.playlistPitchingStrategy}</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
