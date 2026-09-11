import { getPublicQuizResult } from "@/features/quizzes/server/queries"
import { notFound } from "next/navigation"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Award, ArrowRight, Sparkles } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function PublicQuizResultPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, t] = await Promise.all([params, getTranslations("PublicResult")])

  const result = await getPublicQuizResult(id)

  if (!result || !result.quiz) {
    notFound()
  }

  const name = result.user?.name || result.guestName || t("someone")
  const totalPointsDisplay = result.score ?? 0

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary/20 flex flex-col relative overflow-hidden items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70"></div>
      
      <header className="h-16 border-b border-border/10 flex items-center px-6 backdrop-blur-md absolute top-0 w-full z-10">
        <Link href="/" className="font-black text-xl tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-3.5 shrink-0" />
          </div>
          Questify
        </Link>
      </header>

      <Card className="w-full max-w-2xl bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden z-10 mt-16">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        
        <div className="mx-auto w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Award className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
          {t.rich("score", {
            name,
            points: totalPointsDisplay,
            highlight: (chunks) => <span className="text-primary">{chunks}</span>,
          })}
        </h1>
        
        <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-md mx-auto">
          {t.rich("quiz", {
            title: result.quiz.title,
            highlight: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
          })}
        </p>

        <div className="border-t border-border/50 pt-8 mt-4 flex flex-col items-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">{t("challenge")}</p>
          <Link href={`/q/${result.quizId}`}>
            <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-10 text-lg font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/30 transition-all duration-300">
              {t("takeQuiz")} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
