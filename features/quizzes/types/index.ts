// Quiz domain types derived from DB schema
export type QuestionType = "multiple_choice" | "true_false";

export interface QuizAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id?: string;
  content: string;
  type: QuestionType;
  points: number;
  order: number;
  answers: QuizAnswer[];
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  timeLimit: number | null;
  isPublished: boolean;
  requireAuth: boolean;
  maxAttempts: number | null;
  generatedByAi: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type QuizSummary = Pick<
  Quiz,
  "id" | "title" | "description" | "timeLimit" | "isPublished" | "createdAt" | "updatedAt"
>;

export interface QuizWithQuestions extends Quiz {
  questions: (QuizQuestion & { id: string; answers: QuizAnswer[] })[];
}

export interface QuizDetails {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  requireAuth: boolean;
  maxAttempts: number | null;
}

// For the player
export interface PlayerAnswer {
  id: string;
  content: string;
}

export interface PlayerQuestion {
  id: string;
  content: string;
  type: QuestionType;
  points?: number;
  answers: PlayerAnswer[];
}

export interface PlayerQuiz {
  id: string;
  title: string;
  description: string | null;
  timeLimit?: number | null;
}

// For submission
export interface UserAnswerPayload {
  questionId: string;
  answerId: string;
}

export interface SubmitQuizResult {
  success: boolean;
  score: number;
  userQuizId: string;
}

export interface QuizGameResult {
  score: number;
  success: boolean;
  userQuizId?: string;
}

// For results page
export interface UserQuizEntry {
  id: string;
  userId: string | null;
  guestName: string | null;
  score: number | null;
  startedAt: Date;
  completedAt: Date | null;
  user?: { name: string; email: string } | null;
}

export interface QuizWithResults extends Quiz {
  userQuizzes: UserQuizEntry[];
}
