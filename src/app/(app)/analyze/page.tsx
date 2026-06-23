import MusicAnalyzerForm from "@/components/music/MusicAnalyzerForm"
import AnalysisHistory from "@/components/music/AnalysisHistory"
import { Separator } from "@/components/ui/separator"

export const metadata = { title: "Analyze — Music Analyzer" }

export default function AnalyzePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analyze Your Track</h1>
        <p className="text-muted-foreground mt-1">
          Upload your song to get an AI-powered success score and expert marketing plan.
        </p>
      </div>

      <MusicAnalyzerForm />

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Past Analyses</h2>
        <AnalysisHistory />
      </div>
    </div>
  )
}
