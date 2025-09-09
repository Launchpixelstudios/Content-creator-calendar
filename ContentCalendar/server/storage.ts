import {
  type User,
  type UpsertUser,
  type ContentItem,
  type InsertContentItem,
  type ContentTemplate,
  type InsertContentTemplate,
  type EmailReminder,
  type InsertEmailReminder,
  users,
  contentItems,
  contentTemplates,
  emailReminders,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined>;
  
  // Content item methods
  getAllContentItems(userId?: string): Promise<ContentItem[]>;
  getContentItem(id: string): Promise<ContentItem | undefined>;
  createContentItem(item: InsertContentItem & { userId: string }): Promise<ContentItem>;
  updateContentItem(id: string, item: Partial<InsertContentItem>): Promise<ContentItem | undefined>;
  deleteContentItem(id: string): Promise<boolean>;
  
  // Content template methods
  getAllContentTemplates(): Promise<ContentTemplate[]>;
  getContentTemplate(id: string): Promise<ContentTemplate | undefined>;
  createContentTemplate(template: InsertContentTemplate): Promise<ContentTemplate>;
  
  // Email reminder methods
  createEmailReminder(reminder: InsertEmailReminder): Promise<EmailReminder>;
  getPendingReminders(): Promise<EmailReminder[]>;
  markReminderAsSent(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: 'active',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Content item methods
  async getAllContentItems(userId?: string): Promise<ContentItem[]> {
    if (userId) {
      return await db.select().from(contentItems).where(eq(contentItems.userId, userId));
    }
    return await db.select().from(contentItems);
  }

  async getContentItem(id: string): Promise<ContentItem | undefined> {
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    return item;
  }

  async createContentItem(insertItem: InsertContentItem & { userId: string }): Promise<ContentItem> {
    const [item] = await db
      .insert(contentItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateContentItem(id: string, updateData: Partial<InsertContentItem>): Promise<ContentItem | undefined> {
    const [item] = await db
      .update(contentItems)
      .set(updateData)
      .where(eq(contentItems.id, id))
      .returning();
    return item;
  }

  async deleteContentItem(id: string): Promise<boolean> {
    const result = await db.delete(contentItems).where(eq(contentItems.id, id));
    return result.rowCount > 0;
  }

  // Content template methods
  async getAllContentTemplates(): Promise<ContentTemplate[]> {
    return await db.select().from(contentTemplates);
  }

  async getContentTemplate(id: string): Promise<ContentTemplate | undefined> {
    const [template] = await db.select().from(contentTemplates).where(eq(contentTemplates.id, id));
    return template;
  }

  async createContentTemplate(insertTemplate: InsertContentTemplate): Promise<ContentTemplate> {
    const [template] = await db
      .insert(contentTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  // Email reminder methods
  async createEmailReminder(insertReminder: InsertEmailReminder): Promise<EmailReminder> {
    const [reminder] = await db
      .insert(emailReminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }

  async getPendingReminders(): Promise<EmailReminder[]> {
    return await db
      .select()
      .from(emailReminders)
      .where(and(eq(emailReminders.sent, false)));
  }

  async markReminderAsSent(id: string): Promise<void> {
    await db
      .update(emailReminders)
      .set({ sent: true })
      .where(eq(emailReminders.id, id));
  }
}

export const storage = new DatabaseStorage();
