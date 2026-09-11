"use client";

import * as React from "react";
import { submitQuiz } from "@/features/quizzes/server/actions";
import type { PlayerQuestion, PlayerQuiz, QuizGameResult, UserAnswerPayload } from "@/features/quizzes/types";

interface UseQuizPlayerOptions {
  quiz: PlayerQuiz;
  questions: PlayerQuestion[];
}

type AnswerOrder = Record<string, string[]>;

function createAnswerOrder(questions: PlayerQuestion[]): AnswerOrder {
  return Object.fromEntries(
    questions.map((question) => {
      const answerIds = question.answers.map((answer) => answer.id);

      for (let index = answerIds.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [answerIds[index], answerIds[randomIndex]] = [answerIds[randomIndex], answerIds[index]];
      }

      return [question.id, answerIds];
    }),
  );
}

function restoreAnswerOrder(value: unknown, questions: PlayerQuestion[]): AnswerOrder | null {
  if (!value || typeof value !== "object") return null;

  const savedOrder = value as Record<string, unknown>;
  const restoredEntries: [string, string[]][] = [];

  for (const question of questions) {
    const order = savedOrder[question.id];
    const validAnswerIds = new Set(question.answers.map((answer) => answer.id));

    if (
      !Array.isArray(order) ||
      order.length !== validAnswerIds.size ||
      !order.every((answerId) => typeof answerId === "string" && validAnswerIds.has(answerId)) ||
      new Set(order).size !== order.length
    ) {
      return null;
    }

    restoredEntries.push([question.id, order]);
  }

  return Object.fromEntries(restoredEntries);
}

interface UseQuizPlayerReturn {
  currentStep: number;
  userAnswers: Record<string, string>;
  answerOrder: AnswerOrder;
  result: QuizGameResult | null;
  guestName: string;
  timeLeft: number | null;
  isPending: boolean;
  error: string | null;
  handleStart: () => void;
  handleSelectAnswer: (questionId: string, answerId: string) => void;
  handleNext: () => void;
  setGuestName: (name: string) => void;
}

export function useQuizPlayer({ quiz, questions }: UseQuizPlayerOptions): UseQuizPlayerReturn {
  const [currentStep, setCurrentStep] = React.useState(-1);
  const [userAnswers, setUserAnswers] = React.useState<Record<string, string>>({});
  const [answerOrder, setAnswerOrder] = React.useState<AnswerOrder>({});
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<QuizGameResult | null>(null);
  const [guestName, setGuestName] = React.useState("");
  const [timeLeft, setTimeLeft] = React.useState<number | null>(quiz.timeLimit ?? null);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const isRestoredRef = React.useRef(false);
  const isSubmittingRef = React.useRef(false);
  const storageKey = `questify_quiz_${quiz.id}`;

  // Restore state from localStorage (runs once per quiz.id)
  React.useEffect(() => {
    isRestoredRef.current = false;
    const restoreTimer = window.setTimeout(() => {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
        const parsed: unknown = JSON.parse(saved);
        if (!parsed || typeof parsed !== "object") throw new Error("Invalid saved quiz");

        const savedQuiz = parsed as Record<string, unknown>;
        const restoredStartedAt = typeof savedQuiz.startedAt === "number" && Number.isFinite(savedQuiz.startedAt)
          ? savedQuiz.startedAt
          : null;
        const canRestoreAttempt =
          Number.isInteger(savedQuiz.currentStep) &&
          Number(savedQuiz.currentStep) >= 0 &&
          Number(savedQuiz.currentStep) < questions.length &&
          (!quiz.timeLimit || restoredStartedAt !== null);

        if (canRestoreAttempt) {
          setCurrentStep(Number(savedQuiz.currentStep));
          setAnswerOrder(
            restoreAnswerOrder(savedQuiz.answerOrder, questions) ?? createAnswerOrder(questions),
          );
        }
        if (savedQuiz.userAnswers && typeof savedQuiz.userAnswers === "object") {
          const validAnswers = Object.fromEntries(
            questions.flatMap((question) => {
              const answerId = (savedQuiz.userAnswers as Record<string, unknown>)[question.id];
              return typeof answerId === "string" && question.answers.some((answer) => answer.id === answerId)
                ? [[question.id, answerId]]
                : [];
            })
          );
          setUserAnswers(validAnswers);
        }
        if (typeof savedQuiz.guestName === "string") setGuestName(savedQuiz.guestName.slice(0, 80));
        if (restoredStartedAt !== null) {
          setStartedAt(restoredStartedAt);
          if (quiz.timeLimit) {
            const elapsed = Math.floor((Date.now() - restoredStartedAt) / 1000);
            setTimeLeft(Math.max(0, quiz.timeLimit - elapsed));
          }
        }
        } catch {
          localStorage.removeItem(storageKey);
        }
      }
      isRestoredRef.current = true;
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [questions, quiz.timeLimit, storageKey]);

  // Persist state to localStorage (debounced)
  React.useEffect(() => {
    if (!isRestoredRef.current) return;
    if (result) {
      localStorage.removeItem(storageKey);
      return;
    }
    if (currentStep >= 0) {
      const timer = setTimeout(() => {
        localStorage.setItem(storageKey, JSON.stringify({ currentStep, userAnswers, answerOrder, guestName, startedAt }));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, userAnswers, answerOrder, guestName, startedAt, result, storageKey]);

  const handleSubmit = React.useCallback(() => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const payload: UserAnswerPayload[] = Object.entries(userAnswers).map(
          ([questionId, answerId]) => ({ questionId, answerId })
        );
        const res = await submitQuiz(quiz.id, payload, guestName.trim() || null);
        setResult({ score: res.score, success: true, userQuizId: res.userQuizId });
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "Unable to submit the quiz");
      } finally {
        isSubmittingRef.current = false;
      }
    });
  }, [userAnswers, quiz.id, guestName]);

  const handleStart = React.useCallback(() => {
    if (questions.length === 0) return;
    setError(null);
    setUserAnswers({});
    setAnswerOrder(createAnswerOrder(questions));
    setCurrentStep(0);
    setStartedAt(Date.now());
    setTimeLeft(quiz.timeLimit ?? null);
  }, [questions, quiz.timeLimit]);

  const handleSelectAnswer = React.useCallback((questionId: string, answerId: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  }, []);

  const handleNext = React.useCallback(() => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, questions.length, handleSubmit]);

  React.useEffect(() => {
    if (!isRestoredRef.current || currentStep < 0 || result || !quiz.timeLimit || !startedAt) return;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, quiz.timeLimit! - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) handleSubmit();
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(timer);
  }, [currentStep, handleSubmit, quiz.timeLimit, result, startedAt]);

  return {
    currentStep,
    userAnswers,
    answerOrder,
    result,
    guestName,
    timeLeft,
    isPending,
    error,
    handleStart,
    handleSelectAnswer,
    handleNext,
    setGuestName,
  };
}
