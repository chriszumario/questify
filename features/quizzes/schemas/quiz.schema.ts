import { z } from "zod";

export const createQuizSchema = z.object({
  title: z.string().trim().min(3, "titleMinLength").max(100, "titleMaxLength"),
  description: z.string().trim().max(500, "descriptionMaxLength").optional(),
  timeLimitMinutes: z.number().int().min(1, "timeLimitMin").optional(),
  isPublished: z.boolean().optional().default(false),
  requireAuth: z.boolean().optional().default(false),
  maxAttempts: z.number().int().min(1, "maxAttemptsMin").optional(),
});

export const updateQuizSchema = createQuizSchema.extend({
  id: z.string().min(1),
});

export const quizAnswerSchema = z.object({
  id: z.uuid().optional(),
  content: z.string().trim().min(1, "answerContentRequired"),
  isCorrect: z.boolean(),
});

export const quizQuestionSchema = z
  .object({
    id: z.uuid().optional(),
    content: z.string().trim().min(1, "questionContentRequired"),
    type: z.enum(["multiple_choice", "true_false"]),
    points: z.number().int().min(1).default(1),
    order: z.number().int().min(0).default(0),
    answers: z.array(quizAnswerSchema).min(2, "atLeastTwoAnswersRequired"),
  })
  .superRefine((question, context) => {
    const correctAnswers = question.answers.filter(
      (answer) => answer.isCorrect,
    );

    if (correctAnswers.length !== 1) {
      context.addIssue({
        code: "custom",
        message: "exactlyOneCorrectAnswerRequired",
        path: ["answers"],
      });
    }
  });

export const saveQuestionsSchema = z.object({
  questions: z.array(quizQuestionSchema),
});

export const submitQuizSchema = z.object({
  quizId: z.string().min(1),
  guestName: z.string().trim().max(80).nullable().optional(),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answerId: z.string().min(1),
    }),
  ),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;
export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;
export type SaveQuestionsInput = z.infer<typeof saveQuestionsSchema>;
