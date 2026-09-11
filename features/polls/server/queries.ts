import "server-only";

import { db } from "@/lib/db/drizzle";
import { polls, pollOptions, pollVotes } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export async function getUserPolls(userId: string) {
  return db
    .select({
      id: polls.id,
      question: polls.question,
      isPublished: polls.isPublished,
      createdAt: polls.createdAt,
      updatedAt: polls.updatedAt,
      votesCount: sql<number>`(select count(*) from ${pollVotes} where ${pollVotes.pollId} = ${polls.id})`,
    })
    .from(polls)
    .where(eq(polls.userId, userId))
    .orderBy(desc(polls.updatedAt));
}

export async function getPollForEdit(pollId: string, userId: string) {
  return db.query.polls.findFirst({
    where: and(eq(polls.id, pollId), eq(polls.userId, userId)),
    with: { options: true },
  });
}

export async function getPollResults(pollId: string, userId: string) {
  const poll = await db.query.polls.findFirst({
    where: and(eq(polls.id, pollId), eq(polls.userId, userId)),
    columns: { id: true, question: true, isPublished: true },
  });
  if (!poll) return null;

  const options = await db
    .select({
      id: pollOptions.id,
      text: pollOptions.text,
      votes: sql<number>`count(${pollVotes.id})`,
    })
    .from(pollOptions)
    .leftJoin(pollVotes, eq(pollVotes.pollOptionId, pollOptions.id))
    .where(eq(pollOptions.pollId, pollId))
    .groupBy(pollOptions.id)
    .orderBy(desc(sql<number>`count(${pollVotes.id})`));

  return { ...poll, options };
}

export async function getPollForPlay(pollId: string) {
  return db.query.polls.findFirst({
    where: eq(polls.id, pollId),
    with: { options: true },
  });
}
