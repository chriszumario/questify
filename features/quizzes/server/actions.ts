"use server";

import { db } from "@/lib/db/drizzle";
import {
  quizzes,
  questions as questionsSchema,
  answers as answersSchema,
  userQuizzes,
  userAnswers as userAnswersSchema,
} from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import { and, count, eq, notInArray } from "drizzle-orm";
import {
  createQuizSchema,
  saveQuestionsSchema,
  submitQuizSchema,
  type CreateQuizInput,
  type QuizQuestionInput,
} from "@/features/quizzes/schemas/quiz.schema";
import type { UserAnswerPayload, SubmitQuizResult } from "@/features/quizzes/types";
import { getSession, requireUser } from "@/lib/auth-session";

function revalidateQuizPaths(locale: string, quizId: string) {
  revalidatePath(`/${locale}/dashboard/quizzes`);
  revalidatePath(`/${locale}/dashboard/quizzes/${quizId}/edit`);
}

export async function createQuiz(data: CreateQuizInput) {
  const user = await requireUser();
  const input = createQuizSchema.parse(data);

  const [quiz] = await db
    .insert(quizzes)
    .values({
      userId: user.id,
      title: input.title,
      description: input.description,
      timeLimit: input.timeLimitMinutes
        ? input.timeLimitMinutes * 60
        : null,
      isPublished: input.isPublished,
      requireAuth: input.requireAuth,
      maxAttempts: input.requireAuth ? (input.maxAttempts ?? 1) : null,
    })
    .returning();

  const locale = await getLocale();
  redirect({ href: `/dashboard/quizzes/${quiz.id}/edit`, locale });
}

export async function saveQuizQuestions(
  quizId: string,
  data: { questions: QuizQuestionInput[] }
) {
  const user = await requireUser();
  const input = saveQuestionsSchema.parse(data);

  const quiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, quizId), eq(quizzes.userId, user.id)),
    with: { questions: { with: { answers: true } } },
  });

  if (!quiz) throw new Error("Quiz not found or unauthorized");

  const existingQuestions = new Map(quiz.questions.map((question) => [question.id, question]));
  const existingAnswerQuestionIds = new Map(
    quiz.questions.flatMap((question) => question.answers.map((answer) => [answer.id, question.id] as const))
  );
  const resolvedQuestions = input.questions.map((question) => ({
    ...question,
    id: question.id ?? crypto.randomUUID(),
    answers: question.answers.map((answer) => ({ ...answer, id: answer.id ?? crypto.randomUUID() })),
  }));

  for (const question of resolvedQuestions) {
    for (const answer of question.answers) {
      const currentQuestionId = existingAnswerQuestionIds.get(answer.id);
      if (currentQuestionId && currentQuestionId !== question.id) throw new Error("Invalid quiz answer");
    }
  }

  await db.transaction(async (transaction) => {
    const retainedQuestionIds = resolvedQuestions
      .filter((question) => existingQuestions.has(question.id))
      .map((question) => question.id);

    if (retainedQuestionIds.length > 0) {
      await transaction.delete(questionsSchema).where(
        and(eq(questionsSchema.quizId, quizId), notInArray(questionsSchema.id, retainedQuestionIds))
      );
    } else {
      await transaction.delete(questionsSchema).where(eq(questionsSchema.quizId, quizId));
    }

    for (const question of resolvedQuestions) {
      const questionValues = {
        content: question.content,
        type: question.type,
        points: question.points,
        order: question.order,
      };

      if (existingQuestions.has(question.id)) {
        await transaction.update(questionsSchema).set(questionValues).where(
          and(eq(questionsSchema.id, question.id), eq(questionsSchema.quizId, quizId))
        );
      } else {
        await transaction.insert(questionsSchema).values({ id: question.id, quizId, ...questionValues });
      }

      const existingQuestion = existingQuestions.get(question.id);
      if (existingQuestion) {
        const retainedAnswerIds = question.answers
          .filter((answer) => existingAnswerQuestionIds.get(answer.id) === question.id)
          .map((answer) => answer.id);
        if (retainedAnswerIds.length > 0) {
          await transaction.delete(answersSchema).where(
            and(eq(answersSchema.questionId, question.id), notInArray(answersSchema.id, retainedAnswerIds))
          );
        } else {
          await transaction.delete(answersSchema).where(eq(answersSchema.questionId, question.id));
        }
      }

      for (const answer of question.answers) {
        const answerValues = { content: answer.content, isCorrect: answer.isCorrect };
        if (existingAnswerQuestionIds.get(answer.id) === question.id) {
          await transaction.update(answersSchema).set(answerValues).where(
            and(eq(answersSchema.id, answer.id), eq(answersSchema.questionId, question.id))
          );
        } else {
          await transaction.insert(answersSchema).values({ id: answer.id, questionId: question.id, ...answerValues });
        }
      }
    }
  });

  revalidateQuizPaths(await getLocale(), quizId);

  return { success: true };
}

export async function submitQuiz(
  quizId: string,
  payload: UserAnswerPayload[],
  guestName?: string | null
): Promise<SubmitQuizResult> {
  const input = submitQuizSchema.parse({ quizId, answers: payload, guestName });
  const session = await getSession();
  const authenticatedUserId = session?.user?.id ?? null;

  const quizRecord = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
  });

  if (!quizRecord) throw new Error("Quiz not found");
  const canPreviewDraft = session?.user?.id === quizRecord.userId;
  if (!quizRecord.isPublished && !canPreviewDraft) throw new Error("Quiz not found");

  if (quizRecord.requireAuth && !authenticatedUserId) {
    throw new Error("Authentication is required to take this quiz");
  }

  const quizQuestions = await db.query.questions.findMany({
    where: eq(questionsSchema.quizId, quizId),
    with: {
      answers: true,
    },
  });

  if (!quizQuestions.length) throw new Error("Quiz has no questions");

  const questionsById = new Map(quizQuestions.map((question) => [question.id, question]));
  const submittedAnswers = new Map<string, string>();

  for (const answer of input.answers) {
    if (submittedAnswers.has(answer.questionId)) {
      throw new Error("Only one answer can be submitted per question");
    }

    const question = questionsById.get(answer.questionId);
    if (!question) {
      throw new Error("Invalid quiz question");
    }

    if (!question.answers.some((candidate) => candidate.id === answer.answerId)) {
      throw new Error("Invalid answer for quiz question");
    }

    submittedAnswers.set(answer.questionId, answer.answerId);
  }

  const score = quizQuestions.reduce((total, question) => {
    const answerId = submittedAnswers.get(question.id);
    return question.answers.some((answer) => answer.id === answerId && answer.isCorrect)
      ? total + question.points
      : total;
  }, 0);

  const userQuiz = await db.transaction(async (transaction) => {
    if (quizRecord.maxAttempts && authenticatedUserId) {
      const [attempts] = await transaction
        .select({ value: count() })
        .from(userQuizzes)
        .where(and(eq(userQuizzes.quizId, quizId), eq(userQuizzes.userId, authenticatedUserId)));
      if (attempts.value >= quizRecord.maxAttempts) {
        const t = await getTranslations("Quizzes.access");
        throw new Error(t("attemptLimitDescription", {
          attemptsUsed: attempts.value,
          maxAttempts: quizRecord.maxAttempts,
        }));
      }
    }

    const [attempt] = await transaction
      .insert(userQuizzes)
      .values({
        userId: authenticatedUserId,
        guestName: authenticatedUserId ? null : (input.guestName || null),
        quizId,
        score,
        startedAt: new Date(),
        completedAt: new Date(),
      })
      .returning();

    if (submittedAnswers.size > 0) {
      await transaction.insert(userAnswersSchema).values(
        Array.from(submittedAnswers, ([questionId, answerId]) => ({
          userQuizId: attempt.id,
          questionId,
          answerId,
        }))
      );
    }

    return attempt;
  });

  return { success: true, score, userQuizId: userQuiz.id };
}

export async function deleteQuiz(quizId: string) {
  const user = await requireUser();

  await db
    .delete(quizzes)
    .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, user.id)));

  const locale = await getLocale();
  redirect({ href: "/dashboard/quizzes", locale });
}

export async function toggleQuizPublish(quizId: string, isPublished: boolean) {
  const user = await requireUser();

  if (isPublished) {
    const quiz = await db.query.quizzes.findFirst({
      where: and(eq(quizzes.id, quizId), eq(quizzes.userId, user.id)),
      with: { questions: { with: { answers: true } } },
    });

    if (!quiz) throw new Error("Quiz not found or unauthorized");
    if (quiz.questions.length === 0) throw new Error("Quiz must have at least one question");
    saveQuestionsSchema.parse({ questions: quiz.questions });
  }

  await db
    .update(quizzes)
    .set({ isPublished, updatedAt: new Date() })
    .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, user.id)));

  revalidateQuizPaths(await getLocale(), quizId);

  return { success: true };
}

export async function updateQuizSettings(
  quizId: string,
  data: Omit<CreateQuizInput, "isPublished">
) {
  const user = await requireUser();
  const input = createQuizSchema.omit({ isPublished: true }).parse(data);

  await db
    .update(quizzes)
    .set({
      title: input.title,
      description: input.description,
      timeLimit: input.timeLimitMinutes
        ? input.timeLimitMinutes * 60
        : null,
      requireAuth: input.requireAuth,
      maxAttempts: input.requireAuth ? (input.maxAttempts ?? 1) : null,
      updatedAt: new Date(),
    })
    .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, user.id)));

  revalidateQuizPaths(await getLocale(), quizId);

  return { success: true };
}
