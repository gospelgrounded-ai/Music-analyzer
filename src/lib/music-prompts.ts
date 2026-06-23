import type { AudioMetadata } from "@/types/music"

interface PromptInput {
  fileName: string
  songTitle: string | null
  artistName: string | null
  genre: string | null
  targetAudience: string | null
  metadata: AudioMetadata
}

export const SYSTEM_PROMPT = `You are a professional music industry analyst and digital marketing strategist with 20+ years of experience. You analyze songs based on their technical metadata and contextual information, then provide a commercial success score with detailed reasoning and a comprehensive marketing plan.

You MUST respond with valid JSON only — no markdown code fences, no explanation outside the JSON object. The response must be parseable by JSON.parse().`

export function buildUserMessage(input: PromptInput): string {
  const { fileName, songTitle, artistName, genre, targetAudience, metadata } = input

  const durationStr = metadata.durationSeconds
    ? `${Math.floor(metadata.durationSeconds / 60)}m ${Math.round(metadata.durationSeconds % 60)}s`
    : "Unknown"

  const channelStr =
    metadata.channels === 2 ? "Stereo" : metadata.channels === 1 ? "Mono" : "Unknown"

  return `Analyze this song and return a JSON object matching the schema exactly.

## Song Information
- File name: ${fileName}
- Song title: ${songTitle ?? "Not provided"}
- Artist name: ${artistName ?? "Not provided"}
- Genre: ${genre ?? "Not provided"}
- Target audience (described by artist): ${targetAudience ?? "Not provided"}

## Technical Audio Metadata
- Duration: ${durationStr}
- Audio format/codec: ${metadata.audioFormat ?? "Unknown"}
- Bitrate: ${metadata.bitrate ? `${metadata.bitrate} kbps` : "Unknown"}
- Sample rate: ${metadata.sampleRate ? `${metadata.sampleRate} Hz` : "Unknown"}
- Channels: ${channelStr}
- BPM (from file tags): ${metadata.bpm ?? "Not tagged"}
- Embedded metadata tags: ${JSON.stringify(metadata.embeddedTags)}

## Scoring Rubric (each category 0–20 points)
1. Production Quality: Judge from bitrate (≥320 kbps = professional, 128 kbps = low quality), sample rate (44.1kHz+ = standard, 48kHz = broadcast), and format (FLAC/WAV = lossless, MP3/AAC = compressed). Consider production standards for the genre.
2. Commercial Appeal: Based on genre, target audience size, market trends in 2025/2026, and whether the song fits current chart patterns. Consider the "skip factor" — would listeners keep it on?
3. Genre Trend Fit: How well does this fit current trends? Pop/hip-hop/afrobeats/dance genres score higher if metrics suggest mainstream production. Niche genres can score high if the niche is growing.
4. Hook & Catchiness Potential: BPM between 90–130 typically scores higher for commercial genres. Consider whether the genre typically favors short hooky structures vs long-form. Evaluate potential for earworm quality.
5. Replay & Virality Factor: Assess potential for TikTok/Reels virality, replay value, and sharability based on genre conventions, BPM, and target audience behavior on social media.

## Required JSON Schema
{
  "successScore": {
    "overall": <integer 0-100, exact sum of the five category scores>,
    "productionQuality": { "score": <integer 0-20>, "reasoning": <string 1-2 sentences> },
    "commercialAppeal": { "score": <integer 0-20>, "reasoning": <string 1-2 sentences> },
    "genreTrendFit": { "score": <integer 0-20>, "reasoning": <string 1-2 sentences> },
    "hookCatchiness": { "score": <integer 0-20>, "reasoning": <string 1-2 sentences> },
    "replayVirality": { "score": <integer 0-20>, "reasoning": <string 1-2 sentences> }
  },
  "marketingPlan": {
    "targetAudienceProfile": <string: 3-4 sentences describing ideal listener demographics, psychographics, and listening habits>,
    "platformStrategies": [
      {
        "platform": "TikTok",
        "whatToPost": <string: specific content ideas for TikTok>,
        "howToPost": <string: format, duration, style, trending sounds/effects to use>,
        "whenToPost": <string: specific days and times with reasoning>,
        "hashtagsKeywords": [<string>, ...]
      },
      {
        "platform": "Instagram Reels",
        "whatToPost": <string>,
        "howToPost": <string>,
        "whenToPost": <string>,
        "hashtagsKeywords": [<string>, ...]
      },
      {
        "platform": "YouTube Shorts",
        "whatToPost": <string>,
        "howToPost": <string>,
        "whenToPost": <string>,
        "hashtagsKeywords": [<string>, ...]
      },
      {
        "platform": "Spotify & Apple Music",
        "whatToPost": <string: playlist pitching, pre-save campaigns, artist bio optimization>,
        "howToPost": <string: Spotify for Artists tools, SubmitHub, playlist curators to target>,
        "whenToPost": <string: release timing, Friday releases, pre-save timeline>,
        "hashtagsKeywords": [<string: keywords for playlist metadata>, ...]
      },
      {
        "platform": "Twitter/X",
        "whatToPost": <string>,
        "howToPost": <string>,
        "whenToPost": <string>,
        "hashtagsKeywords": [<string>, ...]
      }
    ],
    "contentCalendar": [
      { "week": 1, "theme": <string: week's campaign focus>, "actions": [<string>, <string>, <string>] },
      { "week": 2, "theme": <string>, "actions": [<string>, <string>, <string>] },
      { "week": 3, "theme": <string>, "actions": [<string>, <string>, <string>] },
      { "week": 4, "theme": <string>, "actions": [<string>, <string>, <string>] }
    ],
    "hookClipRecommendations": [
      <string: specific timestamp ranges or song section descriptions best suited for 15-30 second clips>,
      <string>,
      <string>
    ],
    "paidPromotionBudget": <string: 3-4 sentences covering budget tiers ($0, $50-200/month, $500+/month) and which platforms give best ROI for this genre>,
    "playlistPitchingStrategy": <string: 3-4 sentences covering how to pitch to independent playlist curators, Spotify editorial, Apple Music editorial, and blog/blog playlists>
  },
  "summary": <string: 2-3 sentences giving an honest overall assessment of commercial potential, highlighting the song's strongest asset and main challenge>
}`
}
