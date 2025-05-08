import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const practiceSession = pgTable("practice_session", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  topic: text("topic").notNull(), // 'binary' or 'subnet'
  subtype: text("subtype").notNull(), // e.g., 'bin2dec', 'basic', 'vlsm'
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  difficulty: text("difficulty").notNull(),
  timeSpent: integer("time_spent").notNull(), // in seconds
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertPracticeSessionSchema = createInsertSchema(practiceSession).omit({
  id: true,
  timestamp: true,
});

export type InsertPracticeSession = z.infer<typeof insertPracticeSessionSchema>;
export type PracticeSession = typeof practiceSession.$inferSelect;

// For API responses
export const progressSummarySchema = z.object({
  binaryProgress: z.object({
    mastery: z.number(),
    correct: z.number(),
    total: z.number(),
  }),
  subnettingProgress: z.object({
    mastery: z.number(),
    correct: z.number(),
    total: z.number(),
  }),
  vlsmProgress: z.object({
    mastery: z.number(),
    correct: z.number(),
    total: z.number(),
  }),
  recentActivity: z.array(
    z.object({
      id: z.number(),
      topic: z.string(),
      subtype: z.string(),
      score: z.number(),
      totalQuestions: z.number(),
      difficulty: z.string(),
      timeSpent: z.number(),
      timestamp: z.date(),
    })
  ),
});

export type ProgressSummary = z.infer<typeof progressSummarySchema>;
