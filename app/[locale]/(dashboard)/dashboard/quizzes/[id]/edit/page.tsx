import { getQuizWithQuestions } from "@/features/quizzes/server/queries"
import { QuizEditor } from "@/features/quizzes/components/quiz-editor"
import { requireUser } from "@/lib/auth-session"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

export default async function EditQuizPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, t] = await Promise.all([
    requireUser(),
    getTranslations("Quizzes.editor"),
  ]);

  const quiz = await getQuizWithQuestions(id, user.id)

  if (!quiz) {
    notFound()
  }

  const mappedQuestions = quiz.questions.map(q => ({
    id: q.id,
    content: q.content,
    type: q.type as "multiple_choice" | "true_false",
    points: q.points,
    order: q.order,
    answers: q.answers.map(a => ({
      id: a.id,
      content: a.content,
      isCorrect: a.isCorrect
    }))
  }))

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">{t("editTitle", { title: quiz.title })}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("editDesc")}
        </p>
      </div>
      
      <QuizEditor 
        quizId={quiz.id} 
        initialQuestions={mappedQuestions} 
        initialIsPublished={quiz.isPublished}
        quizDetails={{
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          requireAuth: quiz.requireAuth,
          maxAttempts: quiz.maxAttempts,
        }}
      />
    </div>
  )
}
