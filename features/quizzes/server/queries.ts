import "server-only";

import { db } from "@/lib/db/drizzle";
import { quizzes, userQuizzes } from "@/lib/db/schema";
import { eq, desc, and, count, isNotNull } from "drizzle-orm";

export async function getUserQuizzes(userId: string) {
  return db.query.quizzes.findMany({
    where: eq(quizzes.userId, userId),
    orderBy: [desc(quizzes.updatedAt)],
  });
}

export async function getQuizWithQuestions(quizId: string, userId?: string) {
  return db.query.quizzes.findFirst({
    where: (quizzes, { and, eq }) => {
      let condition = eq(quizzes.id, quizId);
      if (userId) {
        condition = and(condition, eq(quizzes.userId, userId))!;
      }
      return condition;
    },
    with: {
      questions: {
        orderBy: (questions, { asc }) => [asc(questions.order)],
        with: {
          answers: {
            orderBy: (answers, { asc }) => [asc(answers.createdAt)],
          }
        }
      }
    }
  });
}

export async function getUserQuizAttemptCount(quizId: string, userId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(userQuizzes)
    .where(
      and(
        eq(userQuizzes.quizId, quizId),
        eq(userQuizzes.userId, userId),
      ),
    );

  return result?.value ?? 0;
}

export async function getQuizResults(quizId: string, userId: string) {
  return db.query.quizzes.findFirst({
    where: (quizzes, { and, eq }) => and(eq(quizzes.id, quizId), eq(quizzes.userId, userId)),
    with: {
      userQuizzes: {
        with: {
          user: true
        },
        orderBy: (userQuizzes, { desc }) => [desc(userQuizzes.completedAt)]
      }
    }
  });
}

export async function getParticipantActivity(userId: string) {
  return db.query.userQuizzes.findMany({
    where: eq(userQuizzes.userId, userId),
    orderBy: [desc(userQuizzes.completedAt)],
    with: {
      quiz: true,
      userAnswers: {
        with: {
          answer: true
        }
      }
    }
  });
}

export async function getParticipantAttemptDetails(attemptId: string, userId: string) {
  return db.query.userQuizzes.findFirst({
    where: and(eq(userQuizzes.id, attemptId), eq(userQuizzes.userId, userId)),
    with: {
      quiz: {
        with: {
          questions: {
            with: {
              answers: true
            }
          }
        }
      },
      userAnswers: true
    }
  });
}

export async function getPublicQuizResult(userQuizId: string) {
  const result = await db.query.userQuizzes.findFirst({
    where: eq(userQuizzes.id, userQuizId),
    with: {
      quiz: true,
      user: true
    }
  });

  return result?.quiz.isPublished ? result : null;
}

export async function getPublicQuizLeaderboard(quizId: string) {
  const quiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, quizId), eq(quizzes.isPublished, true)),
    columns: { id: true, title: true },
  });

  if (!quiz) return null;

  const attempts = await db.query.userQuizzes.findMany({
    where: and(eq(userQuizzes.quizId, quizId), isNotNull(userQuizzes.completedAt)),
    orderBy: [desc(userQuizzes.score), desc(userQuizzes.completedAt)],
    limit: 100,
    with: { user: true },
  });

  return { quiz, attempts };
}
