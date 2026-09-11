import { CreateQuizForm } from "@/features/quizzes/components/create-quiz-form"
import { getTranslations } from "next-intl/server"

export default async function CreateQuizPage() {
  const t = await getTranslations('Quizzes.create');
  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 className="text-3xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('desc')}
        </p>
      </div>
      <CreateQuizForm />
    </div>
  )
}
