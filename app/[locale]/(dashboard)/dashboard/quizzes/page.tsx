import { getUserQuizzes } from "@/features/quizzes/server/queries"
import { requireUser } from "@/lib/auth-session"
import { Button } from "@/components/ui/button"
import { PlusCircle, LibraryBig } from "lucide-react"
import { Link } from "@/i18n/routing";
import { QuizCard } from "@/features/quizzes/components/quiz-card"
import { getTranslations } from "next-intl/server"

export default async function QuizzesPage() {
  const [t, user] = await Promise.all([getTranslations('Quizzes'), requireUser()]);

  const quizzes = await getUserQuizzes(user.id)

  return (
    <div className="flex flex-1 flex-col space-y-6 max-w-7xl mx-auto w-full p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('studioTitle')}
          </h2>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary/60 animate-pulse"></span>
            {t('studioDesc')}
          </p>
        </div>
        <Link href="/dashboard/quizzes/create">
          <Button className="rounded-full shadow-lg shadow-primary/25 bg-primary/90 hover:bg-primary hover:-translate-y-0.5 transition-all duration-200">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('createNew')}
          </Button>
        </Link>
      </div>

      {/* Grid or Empty State */}
      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-card/40 backdrop-blur-md rounded-2xl border border-dashed border-border/60 shadow-sm text-center p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20"></div>
            <LibraryBig className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">{t('noQuizzes')}</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            {t('noQuizzesDesc')}
          </p>
          <Link href="/dashboard/quizzes/create">
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 bg-primary/90 hover:bg-primary">
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('buildFirst')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
