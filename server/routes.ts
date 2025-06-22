import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSchema, 
  insertNewsletterSchema, 
  insertEntrustmentSchema, 
  insertPropertyRequestSchema,
  searchFiltersSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
