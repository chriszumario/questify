import { getPollForPlay } from "@/features/polls/server/queries"
import { PollPlayer } from "@/features/polls/components/poll-player"
import { notFound } from "next/navigation"
import { Sparkles } from "lucide-react"
import { getSession } from "@/lib/auth-session"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export default async function PlayPollPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [poll, session, t] = await Promise.all([
    getPollForPlay(id),
    getSession(),
    getTranslations("Polls.access"),
  ])

  if (!poll) {
    notFound()
  }

  if (!poll.isPublished) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/50 rounded-2xl p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-muted text-muted-foreground flex items-center justify-center rounded-full mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-2xl font-bold">{t("draftTitle")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("draftDescription")}
          </p>
          <Link href="/" className="block w-full py-2.5 px-4 bg-secondary text-secondary-foreground font-medium rounded-full hover:bg-secondary/90 transition-colors">
            {t("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  // Strip votes or internal data before passing to client
  const safeOptions = poll.options.map(o => ({
    id: o.id,
    text: o.text,
  }))

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70"></div>
      <div className="absolute bottom-0 right-1/4 w-120 h-120 bg-indigo-500/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70"></div>

      {/* Navbar Minimalista */}
      <header className="h-16 border-b border-border/10 flex items-center px-6 backdrop-blur-md absolute top-0 w-full z-10">
        <div className="font-black text-xl tracking-tighter flex items-center gap-2">
          <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-3.5 shrink-0" />
          </div>
          Questify
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-0 mt-16 pt-12 items-center justify-center">
        <PollPlayer
          poll={{ id: poll.id, question: poll.question }}
          options={safeOptions}
          isAuthenticated={Boolean(session?.user)}
        />
      </main>
    </div>
  )
}
