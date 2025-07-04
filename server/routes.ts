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
  searchFiltersSchema,
  insertGovernorateSchema,
  insertDirectorateSchema,
  insertPropertyTypeSchema
} from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

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
  // Trust proxy for rate limiting (required for production behind load balancers)
  app.set('trust proxy', 1);
  
  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://*.unsplash.com"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        childSrc: ["'none'"],
        workerSrc: ["'none'"],
        frameSrc: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Stricter rate limiting for sensitive endpoints
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

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
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'strict'
    }
  }));

  // Input validation middleware
  const validateInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }
    next();
  };

  // Admin login route with strict rate limiting and validation
  app.post("/api/admin/login", 
    strictLimiter,
    [
      body('username').trim().isLength({ min: 1, max: 50 }).escape(),
      body('password').isLength({ min: 1, max: 100 })
    ],
    validateInput,
    async (req: express.Request, res: express.Response) => {
      try {
        const { username, password } = req.body;

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
      
      // Get the old property to clean up old images if images are being changed
      const oldProperty = await storage.getPropertyById(id);
      if (oldProperty && propertyData.images) {
        // Clean up images that are no longer in the new array
        const oldImages = oldProperty.images || [];
        const newImages = propertyData.images || [];
        oldImages.forEach(oldImage => {
          if (!newImages.includes(oldImage)) {
            cleanupOldImage(oldImage);
          }
        });
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
      
      // Get the property to clean up its images before deletion
      const property = await storage.getPropertyById(id);
      if (property && property.images) {
        property.images.forEach(image => cleanupOldImage(image));
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

  // Admin governorates management
  app.get("/api/admin/governorates", isAdmin, async (req, res) => {
    try {
      const governorates = await storage.getAllGovernorates();
      res.json(governorates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch governorates" });
    }
  });

  app.post("/api/admin/governorates", isAdmin, async (req, res) => {
    try {
      const result = insertGovernorateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid governorate data", errors: result.error.issues });
      }

      const governorate = await storage.createGovernorate(result.data);
      res.status(201).json(governorate);
    } catch (error) {
      res.status(500).json({ message: "Failed to create governorate" });
    }
  });

  app.put("/api/admin/governorates/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertGovernorateSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid governorate data", errors: result.error.issues });
      }

      const governorate = await storage.updateGovernorate(id, result.data);
      if (!governorate) {
        return res.status(404).json({ message: "Governorate not found" });
      }

      res.json(governorate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update governorate" });
    }
  });

  app.delete("/api/admin/governorates/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGovernorate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Governorate not found" });
      }
      
      res.json({ message: "Governorate deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete governorate" });
    }
  });

  // Admin directorates management
  app.get("/api/admin/directorates", isAdmin, async (req, res) => {
    try {
      const { governorateId } = req.query;
      let directorates;
      
      if (governorateId) {
        directorates = await storage.getDirectoratesByGovernorate(parseInt(governorateId as string));
      } else {
        directorates = await storage.getAllDirectorates();
      }
      
      res.json(directorates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch directorates" });
    }
  });

  app.post("/api/admin/directorates", isAdmin, async (req, res) => {
    try {
      const result = insertDirectorateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid directorate data", errors: result.error.issues });
      }

      const directorate = await storage.createDirectorate(result.data);
      res.status(201).json(directorate);
    } catch (error) {
      res.status(500).json({ message: "Failed to create directorate" });
    }
  });

  app.put("/api/admin/directorates/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertDirectorateSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid directorate data", errors: result.error.issues });
      }

      const directorate = await storage.updateDirectorate(id, result.data);
      if (!directorate) {
        return res.status(404).json({ message: "Directorate not found" });
      }

      res.json(directorate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update directorate" });
    }
  });

  app.delete("/api/admin/directorates/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDirectorate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Directorate not found" });
      }
      
      res.json({ message: "Directorate deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete directorate" });
    }
  });

  // Public governorates endpoint (for search filters)
  app.get("/api/governorates", async (req, res) => {
    try {
      const governorates = await storage.getAllGovernorates();
      res.json(governorates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch governorates" });
    }
  });

  // Public directorates endpoint (for search filters)
  app.get("/api/directorates", async (req, res) => {
    try {
      const { governorateId } = req.query;
      let directorates;
      
      if (governorateId) {
        directorates = await storage.getDirectoratesByGovernorate(parseInt(governorateId as string));
      } else {
        directorates = await storage.getAllDirectorates();
      }
      
      res.json(directorates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch directorates" });
    }
  });

  // Property Types API routes
  app.get("/api/property-types", async (req, res) => {
    try {
      const propertyTypes = await storage.getActivePropertyTypes();
      res.json(propertyTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property types" });
    }
  });

  // Admin property types management
  app.get("/api/admin/property-types", isAdmin, async (req, res) => {
    try {
      const propertyTypes = await storage.getAllPropertyTypes();
      res.json(propertyTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property types" });
    }
  });

  app.post("/api/admin/property-types", isAdmin, async (req, res) => {
    try {
      const validatedData = insertPropertyTypeSchema.parse(req.body);
      const newPropertyType = await storage.createPropertyType(validatedData);
      res.status(201).json(newPropertyType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create property type" });
    }
  });

  app.put("/api/admin/property-types/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPropertyTypeSchema.partial().parse(req.body);
      const updatedPropertyType = await storage.updatePropertyType(id, validatedData);
      
      if (!updatedPropertyType) {
        return res.status(404).json({ message: "Property type not found" });
      }
      
      res.json(updatedPropertyType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update property type" });
    }
  });

  app.delete("/api/admin/property-types/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePropertyType(id);
      
      if (!success) {
        return res.status(404).json({ message: "Property type not found" });
      }
      
      res.json({ message: "Property type deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property type" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
