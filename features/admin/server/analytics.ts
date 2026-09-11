"use server"

import { db } from "@/lib/db/drizzle"
import { user, quizzes, userQuizzes, polls } from "@/lib/db/schema"
import { sql, gte } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth-session"

import { getLocale } from "next-intl/server"

export async function getAdminPlatformMetrics() {
  await requireAdmin();

  const [
    [totalUsers],
    [totalQuizzes],
    [totalAttempts],
    [totalPolls],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(user),
    db.select({ count: sql<number>`count(*)` }).from(quizzes),
    db.select({ count: sql<number>`count(*)` }).from(userQuizzes),
    db.select({ count: sql<number>`count(*)` }).from(polls),
  ]);

  return {
    users: totalUsers?.count || 0,
    quizzes: totalQuizzes?.count || 0,
    attempts: totalAttempts?.count || 0,
    polls: totalPolls?.count || 0,
  };
}

export async function getAdminGrowthData(days: number = 30) {
  await requireAdmin();
  const locale = await getLocale();
  
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  
  // Fetch users created in the last X days
  const recentUsers = await db.select({ createdAt: user.createdAt }).from(user)
    .where(gte(user.createdAt, startDate));
    
  // Fetch attempts created in the last X days
  const recentAttempts = await db.select({ startedAt: userQuizzes.startedAt }).from(userQuizzes)
    .where(gte(userQuizzes.startedAt, startDate));

  // Initialize data array
  const dataMap = new Map<string, { date: string; signups: number; attempts: number }>();
  
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toLocaleDateString(locale || 'en', { month: 'short', day: 'numeric' });
    dataMap.set(d.toDateString(), { date: dateStr, signups: 0, attempts: 0 });
  }
  
  // Bin users
  recentUsers.forEach(u => {
    const dateKey = new Date(u.createdAt).toDateString();
    if (dataMap.has(dateKey)) {
      dataMap.get(dateKey)!.signups++;
    }
  });

  // Bin attempts
  recentAttempts.forEach(a => {
    const dateKey = new Date(a.startedAt).toDateString();
    if (dataMap.has(dateKey)) {
      dataMap.get(dateKey)!.attempts++;
    }
  });

  return Array.from(dataMap.values());
}

export async function getAdminPlanBreakdown() {
  await requireAdmin();

  const [result] = await db
    .select({
      pro: sql<number>`coalesce(sum(case when ${user.plan} = 'pro' then 1 else 0 end), 0)`,
      free: sql<number>`coalesce(sum(case when ${user.plan} = 'pro' then 0 else 1 end), 0)`,
    })
    .from(user);

  return {
    pro: Number(result?.pro ?? 0),
    free: Number(result?.free ?? 0),
  };
}
