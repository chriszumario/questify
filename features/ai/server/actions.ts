"use server"

import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { db } from "@/lib/db/drizzle"
import { quizzes, questions, answers, polls, pollOptions } from "@/lib/db/schema"
import { redirect } from "@/i18n/routing"
import { requireUser } from "@/lib/auth-session"
import { getAISettings } from "@/features/admin/server/settings"
import { and, count, eq, gte } from "drizzle-orm"
import { getLocale } from "next-intl/server"

const quizSchema = z.object({
  title: z.string().describe("A catchy title for the quiz"),
  description: z.string().describe("A short description of what the quiz covers"),
  questions: z.array(z.object({
    content: z.string().describe("The question text"),
    type: z.literal("multiple_choice"),
    points: z.number().describe("Points to award, usually 1 or 10"),
    answers: z.array(z.object({
      content: z.string().describe("The answer option text"),
      isCorrect: z.boolean()
    })).length(4).describe("Must provide exactly 4 options, only 1 should be correct")
  }).refine(
    (question) => question.answers.filter((answer) => answer.isCorrect).length === 1,
    "Each question must have exactly one correct answer"
  ))
})

const pollSchema = z.object({
  question: z.string().describe("An engaging question for the poll"),
  options: z.array(z.string()).min(2).max(6).describe("The options for the poll, minimum 2, maximum 6")
})

const generationRequestSchema = z.object({
  topic: z.string().trim().min(3).max(2000),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  count: z.number().int().min(1).max(100),
  type: z.enum(["quiz", "poll"]),
  language: z.string().trim().min(2).max(50),
  category: z.string().trim().min(2).max(100),
});

export async function generateContentWithAI(data: {
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  count: number;
  type: "quiz" | "poll";
  language: string;
  category: string;
}) {
  const user = await requireUser();
  const input = generationRequestSchema.parse(data);
  const settings = await getAISettings();

  if (!settings.enabled) {
    throw new Error("AI Content Generation is currently disabled by administrators.");
  }

  if (input.type === "quiz" && input.count > settings.maxQuestions) {
    throw new Error(`Cannot generate more than ${settings.maxQuestions} questions.`);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [[quizzesToday], [pollsToday]] = await Promise.all([
    db.select({ value: count() }).from(quizzes).where(
      and(eq(quizzes.userId, user.id), eq(quizzes.generatedByAi, true), gte(quizzes.createdAt, startOfDay))
    ),
    db.select({ value: count() }).from(polls).where(
      and(eq(polls.userId, user.id), eq(polls.generatedByAi, true), gte(polls.createdAt, startOfDay))
    ),
  ]);

  if ((quizzesToday.value + pollsToday.value) >= settings.dailyLimit) {
    throw new Error(`You have reached the daily limit of ${settings.dailyLimit} generations.`);
  }

  const aiModel = settings.provider === "openai" ? openai(settings.model) : google(settings.model);

  if (input.type === "quiz") {
    // Generate Quiz
    const { object } = await generateObject({
      model: aiModel,
      schema: quizSchema,
      prompt: `Generate a multiple choice quiz about the following topic: "${input.topic}".
      Difficulty level: ${input.difficulty}.
      Language: ${input.language}.
      Category: ${input.category}.
      Generate exactly ${input.count} questions.
      Make sure the questions are accurate and the distractors (wrong answers) are plausible.
      Always provide exactly 4 answers per question, and exactly 1 correct answer.
      Important: Ensure all content (title, description, questions, answers) is written in ${input.language}.`,
    });

    if (object.questions.length !== input.count) {
      throw new Error("The AI returned an unexpected number of questions. Please try again.");
    }

    const questionsToInsert: Array<{
      id: string;
      quizId: string;
      content: string;
      type: string;
      points: number;
      order: number;
    }> = [];

    const answersToInsert: Array<{
      questionId: string;
      content: string;
      isCorrect: boolean;
    }> = [];

    for (let i = 0; i < object.questions.length; i++) {
      const q = object.questions[i];
      const questionId = crypto.randomUUID();

      questionsToInsert.push({
        id: questionId,
        quizId: "",
        content: q.content,
        type: "multiple_choice",
        points: q.points || 1,
        order: i,
      });

      if (q.answers && q.answers.length > 0) {
        for (const a of q.answers) {
          answersToInsert.push({
            questionId,
            content: a.content,
            isCorrect: a.isCorrect,
          });
        }
      }
    }

    const quiz = await db.transaction(async (transaction) => {
      const [createdQuiz] = await transaction.insert(quizzes).values({
        userId: user.id,
        title: object.title,
        description: object.description,
        category: input.category,
        isPublished: false,
        generatedByAi: true,
      }).returning();

      await transaction.insert(questions).values(
        questionsToInsert.map((question) => ({ ...question, quizId: createdQuiz.id }))
      );
      await transaction.insert(answers).values(answersToInsert);
      return createdQuiz;
    });
    redirect({ href: `/dashboard/quizzes/${quiz.id}/edit`, locale: await getLocale() });
  } else {
    // Generate Poll
    const { object } = await generateObject({
      model: aiModel,
      schema: pollSchema,
      prompt: `Generate a single engaging poll question about the following topic: "${input.topic}".
      Language: ${input.language}.
      Category: ${input.category}.
      Generate between 2 to 6 plausible options for users to vote on.
      Important: Ensure all content (question, options) is written in ${input.language}.`,
    });

    const poll = await db.transaction(async (transaction) => {
      const [createdPoll] = await transaction.insert(polls).values({
        userId: user.id,
        question: object.question,
        isPublished: false,
        generatedByAi: true,
      }).returning();

      await transaction.insert(pollOptions).values(
        object.options.map(o => ({
          pollId: createdPoll.id,
          text: o,
        }))
      );
      return createdPoll;
    });
    redirect({ href: `/dashboard/polls/${poll.id}/edit`, locale: await getLocale() });
  }
}
