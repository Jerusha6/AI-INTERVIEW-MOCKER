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