export interface ScoreCategory {
  score: number
  reasoning: string
}

export interface SuccessScore {
  overall: number
  productionQuality: ScoreCategory
  commercialAppeal: ScoreCategory
  genreTrendFit: ScoreCategory
  hookCatchiness: ScoreCategory
  replayVirality: ScoreCategory
}

export interface PlatformStrategy {
  platform: string
  whatToPost: string
  howToPost: string
  whenToPost: string
  hashtagsKeywords: string[]
}

export interface WeeklyCalendar {
  week: number
  theme: string
  actions: string[]
}

export interface MarketingPlan {
  targetAudienceProfile: string
  platformStrategies: PlatformStrategy[]
  contentCalendar: WeeklyCalendar[]
  hookClipRecommendations: string[]
  paidPromotionBudget: string
  playlistPitchingStrategy: string
}

export interface ClaudeAnalysisResult {
  successScore: SuccessScore
  marketingPlan: MarketingPlan
  summary: string
}

export interface AudioMetadata {
  durationSeconds: number | null
  bitrate: number | null
  sampleRate: number | null
  channels: number | null
  audioFormat: string | null
  bpm: number | null
  embeddedTags: Record<string, unknown>
}

export interface MusicAnalysisRecord {
  id: string
  fileName: string
  fileSize: number
  songTitle: string | null
  artistName: string | null
  genre: string | null
  targetAudience: string | null
  durationSeconds: number | null
  bitrate: number | null
  sampleRate: number | null
  channels: number | null
  audioFormat: string | null
  bpm: number | null
  result: ClaudeAnalysisResult
  overallScore: number
  createdAt: string
}

export interface AnalysisHistoryItem {
  id: string
  fileName: string
  songTitle: string | null
  artistName: string | null
  genre: string | null
  overallScore: number
  createdAt: string
}
