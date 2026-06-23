import LoginForm from "@/components/auth/LoginForm"
import { Music2 } from "lucide-react"

export const metadata = { title: "Sign In — Music Analyzer" }

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="mb-8 flex items-center gap-2">
        <Music2 className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold">Music Analyzer</span>
      </div>
      <LoginForm />
    </main>
  )
}
