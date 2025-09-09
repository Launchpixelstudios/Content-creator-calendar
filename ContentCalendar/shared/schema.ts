import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with subscription info
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default('free'), // 'free', 'active', 'cancelled', 'past_due'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Content items table
export const contentItems = pgTable("content_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  platform: text("platform").notNull(), // 'social', 'email', 'blog'
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull().default('draft'), // 'draft', 'scheduled', 'posted'
  templateId: varchar("template_id").references(() => contentTemplates.id),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentItemSchema = createInsertSchema(contentItems).omit({
  id: true,
  userId: true,
  reminderSent: true,
  createdAt: true,
}).extend({
  scheduledDate: z.string().transform((val) => new Date(val)),
  platform: z.enum(['social', 'email', 'blog']),
  status: z.enum(['draft', 'scheduled', 'posted']),
  templateId: z.string().optional(),
});

export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type ContentItem = typeof contentItems.$inferSelect;

// Content templates table
export const contentTemplates = pgTable("content_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(), // Pre-filled content/prompt
  platform: text("platform").notNull(), // 'social', 'email', 'blog'
  category: text("category").notNull(), // 'marketing', 'educational', 'promotional', etc.
  isPremium: boolean("is_premium").default(false), // Restrict to paid users
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentTemplateSchema = createInsertSchema(contentTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertContentTemplate = z.infer<typeof insertContentTemplateSchema>;
export type ContentTemplate = typeof contentTemplates.$inferSelect;

// Email reminders table
export const emailReminders = pgTable("email_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentItemId: varchar("content_item_id").references(() => contentItems.id),
  userId: varchar("user_id").references(() => users.id),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sent: boolean("sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmailReminderSchema = createInsertSchema(emailReminders).omit({
  id: true,
  sent: true,
  createdAt: true,
});

export type InsertEmailReminder = z.infer<typeof insertEmailReminderSchema>;
export type EmailReminder = typeof emailReminders.$inferSelect;
