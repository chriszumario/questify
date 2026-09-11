import {
  sqliteTable,
  text,
  index,
  uniqueIndex,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  role: text("role").default("user").notNull(),
  banned: integer("banned", { mode: "boolean" }).default(false),
  plan: text("plan").default("free").notNull(), // 'free' or 'pro'
  polarSubscriptionId: text("polar_subscription_id"),
  subscriptionStatus: text("subscription_status"),
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }),
  subscriptionEventAt: integer("subscription_event_at", {
    mode: "timestamp_ms",
  }),

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
    uniqueIndex("account_issuer_accountId_uidx").on(
      table.issuer,
      table.accountId,
    ),
  ],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  quizzes: many(quizzes),
  userQuizzes: many(userQuizzes),
  polls: many(polls),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const quizzes = sqliteTable(
  "quizzes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").default("Other").notNull(),
    timeLimit: integer("time_limit"), // in seconds, null means unlimited
    isPublished: integer("is_published", { mode: "boolean" })
      .default(false)
      .notNull(),
    requireAuth: integer("require_auth", { mode: "boolean" })
      .default(false)
      .notNull(),
    maxAttempts: integer("max_attempts"),
    generatedByAi: integer("generated_by_ai", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("quiz_userId_idx").on(table.userId)],
);

export const questions = sqliteTable(
  "questions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    type: text("type").notNull().default("multiple_choice"), // e.g. multiple_choice, true_false
    points: integer("points").notNull().default(1),
    order: integer("order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("question_quizId_idx").on(table.quizId)],
);

export const answers = sqliteTable(
  "answers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("answer_questionId_idx").on(table.questionId)],
);

export const userQuizzes = sqliteTable(
  "user_quizzes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }), // Nullable for anonymous users
    guestName: text("guest_name"), // For anonymous users to identify themselves
    score: integer("score"),
    startedAt: integer("started_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("userQuiz_quizId_idx").on(table.quizId),
    index("userQuiz_userId_idx").on(table.userId),
  ],
);

export const quizRelations = relations(quizzes, ({ one, many }) => ({
  user: one(user, {
    fields: [quizzes.userId],
    references: [user.id],
  }),
  questions: many(questions),
  userQuizzes: many(userQuizzes),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  answers: many(answers),
}));

export const answerRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const userQuizRelations = relations(userQuizzes, ({ one, many }) => ({
  user: one(user, {
    fields: [userQuizzes.userId],
    references: [user.id],
  }),
  quiz: one(quizzes, {
    fields: [userQuizzes.quizId],
    references: [quizzes.id],
  }),
  userAnswers: many(userAnswers),
}));

export const userAnswers = sqliteTable(
  "user_answers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userQuizId: text("user_quiz_id")
      .notNull()
      .references(() => userQuizzes.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    answerId: text("answer_id").references(() => answers.id, {
      onDelete: "set null",
    }), // Nullable if the user skipped
  },
  (table) => [
    index("userAnswer_userQuizId_idx").on(table.userQuizId),
    uniqueIndex("uq_user_answer").on(table.userQuizId, table.questionId),
  ],
);

export const userAnswerRelations = relations(userAnswers, ({ one }) => ({
  userQuiz: one(userQuizzes, {
    fields: [userAnswers.userQuizId],
    references: [userQuizzes.id],
  }),
  question: one(questions, {
    fields: [userAnswers.questionId],
    references: [questions.id],
  }),
  answer: one(answers, {
    fields: [userAnswers.answerId],
    references: [answers.id],
  }),
}));

export const polls = sqliteTable(
  "polls",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    isPublished: integer("is_published", { mode: "boolean" })
      .default(false)
      .notNull(),
    generatedByAi: integer("generated_by_ai", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("poll_userId_idx").on(table.userId)],
);

export const pollOptions = sqliteTable(
  "poll_options",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pollId: text("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("pollOption_pollId_idx").on(table.pollId)],
);

export const pollVotes = sqliteTable(
  "poll_votes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pollId: text("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    pollOptionId: text("poll_option_id")
      .notNull()
      .references(() => pollOptions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("pollVote_pollId_idx").on(table.pollId),
    index("pollVote_optionId_idx").on(table.pollOptionId),
    uniqueIndex("uq_poll_vote").on(table.pollId, table.userId),
  ],
);

export const pollRelations = relations(polls, ({ one, many }) => ({
  user: one(user, {
    fields: [polls.userId],
    references: [user.id],
  }),
  options: many(pollOptions),
  votes: many(pollVotes),
}));

export const pollOptionRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(polls, {
    fields: [pollOptions.pollId],
    references: [polls.id],
  }),
  votes: many(pollVotes),
}));

export const pollVoteRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, {
    fields: [pollVotes.pollId],
    references: [polls.id],
  }),
  option: one(pollOptions, {
    fields: [pollVotes.pollOptionId],
    references: [pollOptions.id],
  }),
  user: one(user, {
    fields: [pollVotes.userId],
    references: [user.id],
  }),
}));

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(), // e.g., 'ai_provider', 'ai_model'
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});
