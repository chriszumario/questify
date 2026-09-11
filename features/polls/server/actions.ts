"use server";

import { db } from "@/lib/db/drizzle";
import { polls, pollOptions, pollVotes } from "@/lib/db/schema";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { and, eq, notInArray } from "drizzle-orm";
import {
  createPollSchema,
  updatePollSchema,
  type CreatePollInput,
  type UpdatePollInput,
} from "@/features/polls/schemas/poll.schema";
import { requireUser } from "@/lib/auth-session";

export async function createPoll(data: CreatePollInput) {
  const user = await requireUser();
  const input = createPollSchema.parse(data);

  await db.transaction(async (transaction) => {
    const [poll] = await transaction
      .insert(polls)
      .values({
        userId: user.id,
        question: input.question,
        isPublished: input.isPublished,
      })
      .returning();

    await transaction.insert(pollOptions).values(
      input.options.map((option) => ({ pollId: poll.id, text: option.text }))
    );
  });

  const locale = await getLocale();
  redirect({ href: "/dashboard/polls", locale });
}

export async function submitPollVote(pollId: string, optionId: string) {
  const user = await requireUser();

  const poll = await db.query.polls.findFirst({ where: eq(polls.id, pollId) });
  if (!poll?.isPublished) throw new Error("Poll not found");

  const option = await db.query.pollOptions.findFirst({
    where: and(eq(pollOptions.id, optionId), eq(pollOptions.pollId, pollId)),
  });
  if (!option) throw new Error("Invalid poll option");

  const insertedVotes = await db
    .insert(pollVotes)
    .values({ pollId, pollOptionId: optionId, userId: user.id })
    .onConflictDoNothing({ target: [pollVotes.pollId, pollVotes.userId] })
    .returning({ id: pollVotes.id });

  if (insertedVotes.length === 0) throw new Error("You have already voted in this poll");

  return { success: true };
}

export async function deletePoll(pollId: string) {
  const user = await requireUser();

  await db
    .delete(polls)
    .where(and(eq(polls.id, pollId), eq(polls.userId, user.id)));

  const locale = await getLocale();
  redirect({ href: "/dashboard/polls", locale });
}

export async function updatePoll(pollId: string, data: Omit<UpdatePollInput, "id">) {
  const user = await requireUser();
  const input = updatePollSchema.parse({ ...data, id: pollId });

  const poll = await db.query.polls.findFirst({
    where: and(eq(polls.id, pollId), eq(polls.userId, user.id)),
  });

  if (!poll) throw new Error("Poll not found");

  const currentOptions = await db.query.pollOptions.findMany({
    where: eq(pollOptions.pollId, pollId),
  });
  const currentOptionIds = new Set(currentOptions.map((option) => option.id));
  const existingOptionIds = input.options.flatMap((option) => option.id ? [option.id] : []);

  if (existingOptionIds.some((id) => !currentOptionIds.has(id))) {
    throw new Error("Invalid poll option");
  }

  await db.transaction(async (transaction) => {
    await transaction
      .update(polls)
      .set({ question: input.question, isPublished: input.isPublished, updatedAt: new Date() })
      .where(and(eq(polls.id, pollId), eq(polls.userId, user.id)));

    if (existingOptionIds.length > 0) {
      await transaction.delete(pollOptions).where(
        and(eq(pollOptions.pollId, pollId), notInArray(pollOptions.id, existingOptionIds))
      );
    } else {
      await transaction.delete(pollOptions).where(eq(pollOptions.pollId, pollId));
    }

    for (const option of input.options) {
      if (option.id) {
        await transaction
          .update(pollOptions)
          .set({ text: option.text })
          .where(and(eq(pollOptions.id, option.id), eq(pollOptions.pollId, pollId)));
      } else {
        await transaction.insert(pollOptions).values({ pollId, text: option.text });
      }
    }
  });

  const locale = await getLocale();
  redirect({ href: "/dashboard/polls", locale });
}
