import "server-only"

import { db } from "@/lib/db/drizzle"
import { quizzes, user, userQuizzes, polls, userAnswers, answers } from "@/lib/db/schema"
import { requireUser } from "@/lib/auth-session"
import type { CreatorActivityItem, CreatorChartPoint, CreatorMetrics } from "../types"
import { and, desc, eq, gte, sql } from "drizzle-orm"

export async function getCreatorMetrics(): Promise<CreatorMetrics> {
  const { id: userId } = await requireUser()

  const [quizCount, pollCount, playerCount, answerCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(quizzes).where(eq(quizzes.userId, userId)),
    db.select({ count: sql<number>`count(*)` }).from(polls).where(eq(polls.userId, userId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(userQuizzes)
      .innerJoin(quizzes, eq(userQuizzes.quizId, quizzes.id))
      .where(eq(quizzes.userId, userId)),
    db
      .select({
        total: sql<number>`count(${userAnswers.id})`,
        correct: sql<number>`coalesce(sum(case when ${answers.isCorrect} = 1 then 1 else 0 end), 0)`,
      })
      .from(userAnswers)
      .innerJoin(userQuizzes, eq(userAnswers.userQuizId, userQuizzes.id))
      .innerJoin(quizzes, eq(userQuizzes.quizId, quizzes.id))
      .leftJoin(answers, eq(userAnswers.answerId, answers.id))
      .where(eq(quizzes.userId, userId)),
  ])

  const totalAnswers = answerCount[0]?.total ?? 0
  const totalCorrect = answerCount[0]?.correct ?? 0
  const averageScore = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0

  return {
    quizzes: quizCount[0]?.count ?? 0,
    polls: pollCount[0]?.count ?? 0,
    players: playerCount[0]?.count ?? 0,
    averageScore,
    totalAnswers,
    totalCorrect,
  }
}

export async function getCreatorChartData(): Promise<CreatorChartPoint[]> {
  const { id: userId } = await requireUser()
  const now = new Date()
  const chartData: CreatorChartPoint[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
    chartData.push({ date: date.toISOString().slice(0, 10), attempts: 0 })
  }

  const recentAttempts = await db
    .select({ startedAt: userQuizzes.startedAt })
    .from(userQuizzes)
    .innerJoin(quizzes, eq(userQuizzes.quizId, quizzes.id))
    .where(and(eq(quizzes.userId, userId), gte(userQuizzes.startedAt, new Date(`${chartData[0].date}T00:00:00.000Z`))))

  const attemptsByDate = new Map(chartData.map((point) => [point.date, point]))
  for (const attempt of recentAttempts) {
    const point = attemptsByDate.get(attempt.startedAt.toISOString().slice(0, 10))
    if (point) point.attempts += 1
  }

  return chartData
}

export async function getCreatorRecentActivity(): Promise<CreatorActivityItem[]> {
  const { id: userId } = await requireUser()
  const activity = await db.select({
    id: userQuizzes.id,
    quizId: userQuizzes.quizId,
    guestName: userQuizzes.guestName,
    completedAt: userQuizzes.completedAt,
    startedAt: userQuizzes.startedAt,
    score: userQuizzes.score,
    quizTitle: quizzes.title,
    userName: user.name,
    userImage: user.image,
  })
  .from(userQuizzes)
  .innerJoin(quizzes, eq(userQuizzes.quizId, quizzes.id))
  .leftJoin(user, eq(userQuizzes.userId, user.id))
  .where(eq(quizzes.userId, userId))
  .orderBy(desc(userQuizzes.startedAt))
  .limit(5);

  return activity
}
