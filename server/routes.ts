import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { upload, processImage, cleanupOldImage } from "./upload";
import path from "path";
import { 
  insertContactSchema, 
  insertNewsletterSchema, 
  insertEntrustmentSchema, 
  insertPropertyRequestSchema,
  insertPropertySchema,
  searchFiltersSchema 
} from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    admin?: { id: number; username: string };
  }
}

// Admin middleware
const isAdmin = (req: any, res: any, next: any) => {
  if (!req.session?.admin) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session for admin auth using memory store
  const MemStore = MemoryStore(session);
  app.use(session({
    store: new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'admin-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const admin = await storage.verifyAdmin(username, password);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.admin = { id: admin.id, username: admin.username };
      res.json({ message: "Login successful", admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout route
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
  
  // Serve static files from public directory (for logo, etc.)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Image upload route
  app.post("/api/admin/upload", isAdmin, upload.single('image'), processImage);

  // Check admin auth status
  app.get("/api/admin/auth", (req, res) => {
    if (req.session?.admin) {
      res.json({ authenticated: true, admin: req.session.admin });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Public endpoint for site settings (for footer and contact info)
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      // Convert array of settings to flat object for easy frontend access
      const flatSettings = settings.reduce((acc: Record<string, string>, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
      }, {});
      res.json(flatSettings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/featured", async (req, res) => {
    try {
      const properties = await storage.getFeaturedProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const property = await storage.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties/search", async (req, res) => {
    try {
      const filters = searchFiltersSchema.parse(req.body);
      const properties = await storage.searchProperties(filters);
      res.json(properties);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid search filters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to search properties" });
    }
  });

  // Contact form
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json({ message: "Contact form submitted successfully", contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter", async (req, res) => {
    try {
      const newsletterData = insertNewsletterSchema.parse(req.body);
      const newsletter = await storage.subscribeNewsletter(newsletterData);
      res.status(201).json({ message: "Successfully subscribed to newsletter", newsletter });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address", errors: error.errors });
      }
      if (error instanceof Error && error.message === "Email already subscribed to newsletter") {
        return res.status(409).json({ message: "This email is already subscribed to our newsletter" });
      }
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Entrustment request
  app.post("/api/entrustments", async (req, res) => {
    try {
      const entrustmentData = insertEntrustmentSchema.parse(req.body);
      const entrustment = await storage.createEntrustment(entrustmentData);
      res.status(201).json({ message: "Entrustment request submitted successfully", entrustment });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid entrustment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit entrustment request" });
    }
  });

  // Property request
  app.post("/api/property-requests", async (req, res) => {
    try {
      const propertyRequestData = insertPropertyRequestSchema.parse(req.body);
      const propertyRequest = await storage.createPropertyRequest(propertyRequestData);
      res.status(201).json({ message: "Property request submitted successfully", propertyRequest });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit property request" });
    }
  });

  // Admin protected routes
  
  // Admin property management
  app.post("/api/admin/properties", isAdmin, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);
      res.status(201).json({ message: "Property created successfully", property });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/admin/properties/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const propertyData = insertPropertySchema.partial().parse(req.body);
      
      // Get the old property to clean up old image if imageUrl is being changed
      const oldProperty = await storage.getPropertyById(id);
      if (oldProperty && propertyData.imageUrl && oldProperty.imageUrl !== propertyData.imageUrl) {
        cleanupOldImage(oldProperty.imageUrl);
      }
      
      const property = await storage.updateProperty(id, propertyData);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json({ message: "Property updated successfully", property });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/admin/properties/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the property to clean up its image before deletion
      const property = await storage.getPropertyById(id);
      if (property && property.imageUrl) {
        cleanupOldImage(property.imageUrl);
      }
      
      const success = await storage.deleteProperty(id);
      
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Admin contacts management
  app.get("/api/admin/contacts", isAdmin, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.delete("/api/admin/contacts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContact(id);
      
      if (!success) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Admin newsletters management
  app.get("/api/admin/newsletters", isAdmin, async (req, res) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      res.json(newsletters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsletter subscriptions" });
    }
  });

  app.delete("/api/admin/newsletters/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNewsletter(id);
      
      if (!success) {
        return res.status(404).json({ message: "Newsletter subscription not found" });
      }
      
      res.json({ message: "Newsletter subscription deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete newsletter subscription" });
    }
  });

  // Admin entrustments management
  app.get("/api/admin/entrustments", isAdmin, async (req, res) => {
    try {
      const entrustments = await storage.getAllEntrustments();
      res.json(entrustments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entrustments" });
    }
  });

  app.delete("/api/admin/entrustments/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEntrustment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Entrustment not found" });
      }
      
      res.json({ message: "Entrustment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete entrustment" });
    }
  });

  // Admin property requests management
  app.get("/api/admin/property-requests", isAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllPropertyRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property requests" });
    }
  });

  app.delete("/api/admin/property-requests/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePropertyRequest(id);
      
      if (!success) {
        return res.status(404).json({ message: "Property request not found" });
      }
      
      res.json({ message: "Property request deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property request" });
    }
  });

  // Site Settings API routes
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      const settingsObj = settings.reduce((acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
      }, {} as Record<string, string>);
      res.json(settingsObj);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.get("/api/admin/site-settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.post("/api/admin/site-settings", isAdmin, async (req, res) => {
    try {
      const { settings } = req.body;
      
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ message: "Invalid settings data" });
      }

      const updatedSettings = [];
      for (const [key, value] of Object.entries(settings)) {
        if (typeof value === 'string') {
          const setting = await storage.updateSiteSetting(key, value);
          updatedSettings.push(setting);
        }
      }

      res.json({ 
        message: "Site settings updated successfully", 
        settings: updatedSettings 
      });
    } catch (error) {
      console.error("Failed to update site settings:", error);
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
