"use server";

import { db } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-session";

export async function getUsersList() {
  await requireAdmin();
  return db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    banned: user.banned,
    createdAt: user.createdAt,
  }).from(user);
}

export async function updateUserRole(userId: string, role: "admin" | "user") {
  await requireAdmin();
  await db.update(user).set({ role }).where(eq(user.id, userId));
  revalidatePath("/[locale]/dashboard/admin/users", "page");
  return { success: true };
}

export async function updateUserPlan(userId: string, plan: "free" | "pro") {
  await requireAdmin();
  await db.update(user).set({ plan }).where(eq(user.id, userId));
  revalidatePath("/[locale]/dashboard/admin/users", "page");
  return { success: true };
}

export async function toggleUserBan(userId: string, banned: boolean) {
  const sessionUser = await requireAdmin();
  if (sessionUser.id === userId) throw new Error("You cannot ban yourself");
  await db.update(user).set({ banned }).where(eq(user.id, userId));
  revalidatePath("/[locale]/dashboard/admin/users", "page");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const sessionUser = await requireAdmin();
  if (sessionUser.id === userId) throw new Error("You cannot delete your own account");
  await db.delete(user).where(eq(user.id, userId));
  revalidatePath("/[locale]/dashboard/admin/users", "page");
  return { success: true };
}
