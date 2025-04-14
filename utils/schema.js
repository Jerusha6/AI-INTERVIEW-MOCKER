import { pgTable, text, serial, varchar } from "drizzle-orm/pg-core";
// 49:48
export const MockInterview = pgTable("mockInterview", {
  id: serial("id").primaryKey(),
  mockId: varchar("mockId").notNull(),
  jsonMockResp: text("jsonMockResp").notNull(),
  jobPosition: varchar("jobPosition").notNull(),
  jobDesc: varchar("jobDesc").notNull(),
  jobExp: varchar("jobExp").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt").notNull().default("CURRENT_TIMESTAMP"),
});

// 2.46.11

export const UserAnswer = pgTable("userAnswer", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockId").notNull(),
  question: varchar("question").notNull(),
  correctAns:varchar('correctAns'),
  userAns:text('userAns'),
  feedback:text('feedback'),
  rating:varchar('rating'),
  userEmail:varchar('userEmail'),
  createdAt:varchar('createdAt'),
});
