import { CreatePollForm } from "@/features/polls/components/create-poll-form";
import { getTranslations } from "next-intl/server";

export default async function CreatePollPage() {
  const t = await getTranslations('Polls.create');
  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-base mt-2">
          {t('desc')}
        </p>
      </div>
      
      <CreatePollForm />
    </div>
  );
}
