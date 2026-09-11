import { CreatePollForm } from "@/features/polls/components/create-poll-form";
import { getPollForEdit } from "@/features/polls/server/queries";
import { requireUser } from "@/lib/auth-session";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function EditPollPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const [t, user] = await Promise.all([getTranslations('Polls.edit'), requireUser()]);

  const poll = await getPollForEdit(id, user.id);

  if (!poll) {
    notFound();
  }

  const initialData = {
    id: poll.id,
    question: poll.question,
    isPublished: poll.isPublished,
    options: poll.options.map(o => ({
      id: o.id,
      text: o.text
    }))
  };

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
      
      <CreatePollForm initialData={initialData} />
    </div>
  );
}
