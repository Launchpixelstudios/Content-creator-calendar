import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentItemSchema, insertEmailReminderSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { sendContentReminder } from "./emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // PayPal routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Update user subscription status after PayPal payment
  app.post("/api/subscription/activate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { paypalOrderId } = req.body;
      
      // In a real app, you would verify the PayPal payment here
      // For now, we'll just activate the subscription
      await storage.updateUserStripeInfo(userId, paypalOrderId, paypalOrderId);
      
      res.json({ message: "Subscription activated successfully" });
    } catch (error) {
      console.error("Error activating subscription:", error);
      res.status(500).json({ message: "Failed to activate subscription" });
    }
  });

  // Content templates routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllContentTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getContentTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Get all content items (with optional user filtering)
  app.get("/api/content", async (req: any, res) => {
    try {
      const userId = req.isAuthenticated() ? req.user?.claims?.sub : undefined;
      const items = await storage.getAllContentItems(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content items" });
    }
  });

  // Get single content item
  app.get("/api/content/:id", async (req, res) => {
    try {
      const item = await storage.getContentItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Content item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content item" });
    }
  });

  // Create new content item
  app.post("/api/content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertContentItemSchema.parse(req.body);
      const item = await storage.createContentItem({ ...validatedData, userId });
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create content item" });
    }
  });

  // Update content item
  app.put("/api/content/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContentItemSchema.partial().parse(req.body);
      const item = await storage.updateContentItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Content item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update content item" });
    }
  });

  // Delete content item
  app.delete("/api/content/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteContentItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Content item not found" });
      }
      res.json({ message: "Content item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content item" });
    }
  });

  // Email reminders
  app.post("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEmailReminderSchema.parse({ ...req.body, userId });
      const reminder = await storage.createEmailReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  // Export content calendar
  app.get("/api/export/csv", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getAllContentItems(userId);
      
      // Generate CSV
      const csvHeader = "Title,Description,Platform,Scheduled Date,Status\n";
      const csvRows = items.map(item => 
        `"${item.title}","${item.description || ''}","${item.platform}","${item.scheduledDate}","${item.status}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="content-calendar.csv"');
      res.send(csvHeader + csvRows);
    } catch (error) {
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  // Send test reminder
  app.post("/api/test-reminder", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }
      
      const success = await sendContentReminder(
        user.email,
        "Test Content",
        new Date(),
        "social"
      );
      
      if (success) {
        res.json({ message: "Test reminder sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test reminder" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send test reminder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
