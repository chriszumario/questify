import { getQuizWithQuestions, getUserQuizAttemptCount } from "@/features/quizzes/server/queries"
import { QuizPlayer } from "@/features/quizzes/components/quiz-player"
import { notFound } from "next/navigation"
import { Sparkles } from "lucide-react"
import { getSession } from "@/lib/auth-session"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export default async function PlayQuizPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [quiz, session, t] = await Promise.all([
    getQuizWithQuestions(id),
    getSession(),
    getTranslations("Quizzes.access"),
  ])

  if (!quiz) {
    notFound()
  }

  const isOwnerPreview = session?.user.id === quiz.userId;

  if (!quiz.isPublished && !isOwnerPreview) {
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

  // Check auth requirement
  if (quiz.requireAuth && !session?.user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/50 rounded-2xl p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-2xl font-bold">{t("authTitle")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("authDescription", { title: quiz.title })}
          </p>
          <Link href="/sign-in" className="block w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors">
            {t("signIn")}
          </Link>
        </div>
      </div>
    );
  }

  const attemptsUsed = session?.user && quiz.maxAttempts
    ? await getUserQuizAttemptCount(quiz.id, session.user.id)
    : 0;

  if (session?.user && quiz.maxAttempts && attemptsUsed >= quiz.maxAttempts) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border/50 rounded-2xl p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          </div>
          <h2 className="text-2xl font-bold">{t("attemptLimitTitle")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("attemptLimitDescription", {
              attemptsUsed,
              maxAttempts: quiz.maxAttempts,
            })}
          </p>
          <Link href="/dashboard/activity" className="block w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors">
            {t("viewActivity")}
          </Link>
        </div>
      </div>
    );
  }

  const attemptStatus = session?.user && quiz.maxAttempts
    ? {
        remaining: quiz.maxAttempts - attemptsUsed,
        maxAttempts: quiz.maxAttempts,
      }
    : undefined;

  const safeQuestions = quiz.questions.map(q => ({
    id: q.id,
    content: q.content,
    type: q.type as "multiple_choice" | "true_false",
    points: q.points,
    answers: q.answers.map(a => ({
      id: a.id,
      content: a.content,
    }))
  }))

  return (
    <div className="h-[100dvh] bg-background text-foreground selection:bg-primary/20 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70"></div>
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70"></div>
      
      {/* Navbar Minimalista */}
      <header className="h-16 border-b border-border/10 flex items-center px-6 backdrop-blur-md absolute top-0 w-full z-10">
        <div className="font-black text-xl tracking-tighter flex items-center gap-2">
          <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-3.5 shrink-0" />
          </div>
          Questify
        </div>
      </header>
      
      <main className="flex-1 flex flex-col relative z-0 mt-16 overflow-hidden">
        <QuizPlayer
          quiz={{ id: quiz.id, title: quiz.title, description: quiz.description, timeLimit: quiz.timeLimit }} 
          questions={safeQuestions} 
          isAuthenticated={Boolean(session?.user)}
          attemptStatus={attemptStatus}
        />
      </main>
    </div>
  )
}
