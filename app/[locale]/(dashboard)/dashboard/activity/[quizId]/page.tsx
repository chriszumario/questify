import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth-session"
import { getParticipantAttemptDetails } from "@/features/quizzes/server/queries"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, Trophy, ArrowLeft } from "lucide-react"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export default async function ActivityReviewPage({
  params,
  searchParams
}: {
  params: Promise<{ quizId: string }>
  searchParams: Promise<{ attemptId?: string }>
}) {
  const [t, { quizId }, { attemptId }, user] = await Promise.all([
    getTranslations('Dashboard.activity'),
    params,
    searchParams,
    requireUser(),
  ])

  if (!attemptId) {
    notFound()
  }

  // Fetch the user's detailed attempt
  const userAttempt = await getParticipantAttemptDetails(attemptId, user.id)

  if (!userAttempt || !userAttempt.quiz || userAttempt.quizId !== quizId) {
    notFound()
  }

  const quiz = userAttempt.quiz
  const userAnswers = userAttempt.userAnswers

  return (
    <div className="flex flex-col space-y-8 h-full w-full max-w-4xl mx-auto py-8">
      <Link href="/dashboard/activity" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-1" /> {t('backToActivity')}
      </Link>

      <div className="bg-card/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl shadow-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{quiz.title}</h2>
          <p className="text-muted-foreground mt-1 font-medium">{t('reviewSubtitle')}</p>
        </div>
        <div className="flex items-center gap-4 bg-primary/10 text-primary px-6 py-4 rounded-xl">
          <Trophy className="w-8 h-8" />
          <div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">{t('finalScore')}</p>
            <p className="text-3xl font-black">{t('pts', { score: userAttempt.score || 0 })}</p>
          </div>
        </div>
      </div>

      {!userAnswers || userAnswers.length === 0 ? (
        <div className="p-8 text-center border rounded-2xl bg-muted/20">
          <p className="text-muted-foreground font-medium">{t('noDetails')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const userAnswer = userAnswers.find(ua => ua.questionId === question.id)
            const correctAns = question.answers.find(a => a.isCorrect)
            const isQuestionCorrect = userAnswer?.answerId === correctAns?.id

            return (
              <Card key={question.id} className="bg-card/40 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-xl shadow-black/5 overflow-hidden">
                <div className={`px-6 py-4 border-b border-border/40 flex items-start gap-4 ${isQuestionCorrect ? "bg-emerald-500/5" : "bg-destructive/5"}`}>
                  <div className="mt-1">
                    {isQuestionCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('question', { number: index + 1, points: question.points })}</p>
                    <h3 className="text-xl font-medium">{question.content}</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {question.answers.map((answer) => {
                      const isCorrect = answer.isCorrect
                      const isSelected = userAnswer?.answerId === answer.id

                      let stylingClass = "bg-background border-border/50 text-foreground"
                      let Icon = <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />

                      if (isCorrect) {
                        stylingClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                        Icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      } else if (isSelected && !isCorrect) {
                        stylingClass = "bg-destructive/10 border-destructive/30 text-destructive"
                        Icon = <XCircle className="w-5 h-5 text-destructive shrink-0" />
                      }

                      return (
                        <div
                          key={answer.id}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${stylingClass}`}
                        >
                          <div className="flex items-center gap-3">
                            {Icon}
                            <span className="font-medium">{answer.content}</span>
                          </div>
                          {isSelected && (
                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">{t('yourAnswer')}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
