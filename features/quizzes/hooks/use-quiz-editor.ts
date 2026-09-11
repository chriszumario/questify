"use client";

import * as React from "react";
import {
  saveQuizQuestions,
  toggleQuizPublish,
} from "@/features/quizzes/server/actions";
import {
  saveQuestionsSchema,
  type QuizQuestionInput,
} from "@/features/quizzes/schemas/quiz.schema";

function createQuestion(order: number): QuizQuestionInput {
  return {
    id: crypto.randomUUID(),
    content: "",
    type: "multiple_choice",
    points: 1,
    order,
    answers: [
      { id: crypto.randomUUID(), content: "", isCorrect: true },
      { id: crypto.randomUUID(), content: "", isCorrect: false },
    ],
  };
}

interface UseQuizEditorOptions {
  quizId: string;
  initialQuestions: QuizQuestionInput[];
  initialIsPublished?: boolean;
  translateValidation: (key: string) => string;
}

interface UseQuizEditorReturn {
  questions: QuizQuestionInput[];
  isPending: boolean;
  isSaved: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  isPublished: boolean;
  addQuestion: () => void;
  removeQuestion: (index: number) => void;
  moveQuestion: (fromIndex: number, toIndex: number) => void;
  updateQuestion: (index: number, content: string) => void;
  addAnswer: (questionIndex: number) => void;
  removeAnswer: (questionIndex: number, answerIndex: number) => void;
  updateAnswer: (
    questionIndex: number,
    answerIndex: number,
    content: string,
  ) => void;
  toggleCorrectAnswer: (questionIndex: number, answerIndex: number) => void;
  handleSave: () => void;
  handleTogglePublish: (checked: boolean) => void;
}

export function useQuizEditor({
  quizId,
  initialQuestions,
  initialIsPublished = false,
  translateValidation,
}: UseQuizEditorOptions): UseQuizEditorReturn {
  const [questions, setQuestions] = React.useState<QuizQuestionInput[]>(
    initialQuestions.length > 0 ? initialQuestions : [createQuestion(0)],
  );
  const [isPending, startTransition] = React.useTransition();
  const [isSaved, setIsSaved] = React.useState(false);
  const [isPublished, setIsPublished] = React.useState(initialIsPublished);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );

  const markUnsaved = () => {
    setIsSaved(false);
    setError(null);
    setFieldErrors({});
  };

  const validateQuestions = () => {
    const result = saveQuestionsSchema.safeParse({ questions });
    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const nextErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.slice(1).join(".");
      if (path && !nextErrors[path]) {
        nextErrors[path] = translateValidation(issue.message);
      }
    }
    setFieldErrors(nextErrors);
    setError(translateValidation("fixErrors"));
    return false;
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createQuestion(prev.length)]);
    markUnsaved();
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((question, order) => ({ ...question, order })),
    );
    markUnsaved();
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    setQuestions((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated.map((q, idx) => ({ ...q, order: idx }));
    });
    markUnsaved();
  };

  const updateQuestion = (index: number, content: string) => {
    setQuestions((prev) =>
      prev.map((question, questionIndex) =>
        questionIndex === index ? { ...question, content } : question,
      ),
    );
    markUnsaved();
  };

  const addAnswer = (questionIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex] = {
        ...updated[questionIndex],
        answers: [
          ...updated[questionIndex].answers,
          { id: crypto.randomUUID(), content: "", isCorrect: false },
        ],
      };
      return updated;
    });
    markUnsaved();
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex] = {
        ...updated[questionIndex],
        answers: updated[questionIndex].answers.filter(
          (_, i) => i !== answerIndex,
        ),
      };
      return updated;
    });
    markUnsaved();
  };

  const updateAnswer = (
    questionIndex: number,
    answerIndex: number,
    content: string,
  ) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const answers = [...updated[questionIndex].answers];
      answers[answerIndex] = { ...answers[answerIndex], content };
      updated[questionIndex] = { ...updated[questionIndex], answers };
      return updated;
    });
    markUnsaved();
  };

  const toggleCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex] = {
        ...updated[questionIndex],
        answers: updated[questionIndex].answers.map((answer, i) => ({
          ...answer,
          isCorrect: i === answerIndex,
        })),
      };
      return updated;
    });
    markUnsaved();
  };

  const handleSave = () => {
    setError(null);
    if (!validateQuestions()) return;
    startTransition(async () => {
      try {
        await saveQuizQuestions(quizId, { questions });
        setIsSaved(true);
      } catch (saveError: unknown) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Unable to save the questions.",
        );
      }
    });
  };

  const handleTogglePublish = (checked: boolean) => {
    setError(null);
    if (checked && !validateQuestions()) return;
    setIsPublished(checked);
    startTransition(async () => {
      try {
        if (checked) {
          await saveQuizQuestions(quizId, { questions });
          setIsSaved(true);
        }
        await toggleQuizPublish(quizId, checked);
      } catch (publishError: unknown) {
        setIsPublished(!checked);
        setError(
          publishError instanceof Error
            ? publishError.message
            : "Unable to update publication status.",
        );
      }
    });
  };

  return {
    questions,
    isPending,
    isSaved,
    error,
    fieldErrors,
    isPublished,
    addQuestion,
    removeQuestion,
    moveQuestion,
    updateQuestion,
    addAnswer,
    removeAnswer,
    updateAnswer,
    toggleCorrectAnswer,
    handleSave,
    handleTogglePublish,
  };
}
