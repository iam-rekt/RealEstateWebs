import { 
  properties, 
  contacts, 
  newsletters, 
  entrustments, 
  propertyRequests,
  admins,
  siteSettings,
  type Property, 
  type InsertProperty,
  type Contact,
  type InsertContact,
  type Newsletter,
  type InsertNewsletter,
  type Entrustment,
  type InsertEntrustment,
  type PropertyRequest,
  type InsertPropertyRequest,
  type Admin,
  type InsertAdmin,
  type SiteSettings,
  type InsertSiteSettings,
  type SearchFilters
} from "@shared/schema";
import { eq, desc, like, and, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Properties
  getAllProperties(): Promise<Property[]>;
  getPropertyById(id: number): Promise<Property | undefined>;
  searchProperties(filters: SearchFilters): Promise<Property[]>;
  getFeaturedProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Contacts
  getAllContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  deleteContact(id: number): Promise<boolean>;
  
  // Newsletter
  getAllNewsletters(): Promise<Newsletter[]>;
  subscribeNewsletter(email: InsertNewsletter): Promise<Newsletter>;
  deleteNewsletter(id: number): Promise<boolean>;
  
  // Entrustments
  getAllEntrustments(): Promise<Entrustment[]>;
  createEntrustment(entrustment: InsertEntrustment): Promise<Entrustment>;
  deleteEntrustment(id: number): Promise<boolean>;
  
  // Property Requests
  getAllPropertyRequests(): Promise<PropertyRequest[]>;
  createPropertyRequest(request: InsertPropertyRequest): Promise<PropertyRequest>;
  deletePropertyRequest(id: number): Promise<boolean>;
  
  // Admin
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  verifyAdmin(username: string, password: string): Promise<Admin | undefined>;
  
  // Site Settings
  getSiteSetting(key: string): Promise<SiteSettings | undefined>;
  getAllSiteSettings(): Promise<SiteSettings[]>;
  updateSiteSetting(key: string, value: string): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  // Properties
  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async searchProperties(filters: SearchFilters): Promise<Property[]> {
    const conditions = [eq(properties.available, true)];
    
    if (filters.minPrice) {
      conditions.push(gte(properties.price, filters.minPrice));
    }
    if (filters.maxPrice) {
      conditions.push(lte(properties.price, filters.maxPrice));
    }
    if (filters.minSize) {
      conditions.push(gte(properties.size, parseInt(filters.minSize)));
    }
    if (filters.maxSize) {
      conditions.push(lte(properties.size, parseInt(filters.maxSize)));
    }
    if (filters.propertyType) {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }
    if (filters.bedrooms) {
      conditions.push(gte(properties.bedrooms, parseInt(filters.bedrooms)));
    }
    if (filters.bathrooms) {
      conditions.push(gte(properties.bathrooms, parseInt(filters.bathrooms)));
    }
    if (filters.location) {
      conditions.push(like(properties.location, `%${filters.location}%`));
    }

    return await db.select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.createdAt));
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return await db.select()
      .from(properties)
      .where(and(eq(properties.featured, true), eq(properties.available, true)))
      .orderBy(desc(properties.createdAt));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [created] = await db.insert(properties).values(property).returning();
    return created;
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db.update(properties)
      .set(propertyData)
      .where(eq(properties.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Contacts
  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [created] = await db.insert(contacts).values(contact).returning();
    return created;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Newsletter
  async getAllNewsletters(): Promise<Newsletter[]> {
    return await db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
  }

  async subscribeNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    // Check if email already exists
    const [existing] = await db.select()
      .from(newsletters)
      .where(eq(newsletters.email, newsletter.email));
    
    if (existing) {
      throw new Error("Email already subscribed to newsletter");
    }

    const [created] = await db.insert(newsletters).values(newsletter).returning();
    return created;
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    const result = await db.delete(newsletters).where(eq(newsletters.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Entrustments
  async getAllEntrustments(): Promise<Entrustment[]> {
    return await db.select().from(entrustments).orderBy(desc(entrustments.createdAt));
  }

  async createEntrustment(entrustment: InsertEntrustment): Promise<Entrustment> {
    const [created] = await db.insert(entrustments).values(entrustment).returning();
    return created;
  }

  async deleteEntrustment(id: number): Promise<boolean> {
    const result = await db.delete(entrustments).where(eq(entrustments.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Property Requests
  async getAllPropertyRequests(): Promise<PropertyRequest[]> {
    return await db.select().from(propertyRequests).orderBy(desc(propertyRequests.createdAt));
  }

  async createPropertyRequest(request: InsertPropertyRequest): Promise<PropertyRequest> {
    const [created] = await db.insert(propertyRequests).values(request).returning();
    return created;
  }

  async deletePropertyRequest(id: number): Promise<boolean> {
    const result = await db.delete(propertyRequests).where(eq(propertyRequests.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Admin
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(admin.passwordHash, saltRounds);
    
    const [created] = await db.insert(admins).values({
      ...admin,
      passwordHash: hashedPassword
    }).returning();
    return created;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async verifyAdmin(username: string, password: string): Promise<Admin | undefined> {
    const admin = await this.getAdminByUsername(username);
    if (!admin) return undefined;
    
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    return isValid ? admin : undefined;
  }

  // Site Settings
  async getSiteSetting(key: string): Promise<SiteSettings | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, key));
    return setting || undefined;
  }

  async getAllSiteSettings(): Promise<SiteSettings[]> {
    return await db.select().from(siteSettings);
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSettings> {
    const [setting] = await db
      .insert(siteSettings)
      .values({ 
        settingKey: key, 
        settingValue: value,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: siteSettings.settingKey,
        set: { 
          settingValue: value,
          updatedAt: new Date()
        }
      })
      .returning();
    return setting;
  }
}

// Keep MemStorage for backwards compatibility but implement new methods
export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private contacts: Map<number, Contact>;
  private newsletters: Map<number, Newsletter>;
  private entrustments: Map<number, Entrustment>;
  private propertyRequests: Map<number, PropertyRequest>;
  private admins: Map<number, Admin>;
  private currentPropertyId: number;
  private currentContactId: number;
  private currentNewsletterId: number;
  private currentEntrustmentId: number;
  private currentPropertyRequestId: number;
  private currentAdminId: number;

  constructor() {
    this.properties = new Map();
    this.contacts = new Map();
    this.newsletters = new Map();
    this.entrustments = new Map();
    this.propertyRequests = new Map();
    this.admins = new Map();
    this.currentPropertyId = 1;
    this.currentContactId = 1;
    this.currentNewsletterId = 1;
    this.currentEntrustmentId = 1;
    this.currentPropertyRequestId = 1;
    this.currentAdminId = 1;
    
    // Initialize with sample properties and admin
    this.initializeSampleProperties();
    this.initializeAdmin();
  }

  private async initializeAdmin() {
    // Create a default admin user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("admin123", saltRounds);
    
    const admin: Admin = {
      id: this.currentAdminId++,
      username: "admin",
      email: "admin@pin-point.gr",
      passwordHash: hashedPassword,
      createdAt: new Date(),
    };
    this.admins.set(admin.id, admin);
  }

  private initializeSampleProperties() {
    const sampleProperties: InsertProperty[] = [
      {
        title: "Modern Apartment in Abdoun",
        description: "Beautiful modern apartment with city views in the prestigious Abdoun area. Recently renovated with high-end finishes and modern amenities.",
        price: "120000",
        size: 120,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "apartment",
        location: "Abdoun, Amman",
        address: "Abdoun Circle, Amman",
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: true,
        available: true,
      },
      {
        title: "Luxury Villa in Sweifieh",
        description: "Stunning luxury villa with private garden in Sweifieh. Perfect for families seeking comfort and elegance in central Amman.",
        price: "250000",
        size: 250,
        bedrooms: 4,
        bathrooms: 3,
        propertyType: "villa",
        location: "Sweifieh, Amman",
        address: "Al-Thaqafa Street, Sweifieh",
        imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: false,
        available: true,
      },
      {
        title: "Cozy Studio in Jabal Amman",
        description: "Charming studio apartment in the historic Jabal Amman district. Walking distance to Rainbow Street and cultural attractions.",
        price: "45000",
        size: 45,
        bedrooms: 0,
        bathrooms: 1,
        propertyType: "studio",
        location: "Jabal Amman, Amman",
        address: "Rainbow Street, Jabal Amman",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: true,
        available: true,
      },
      {
        title: "Penthouse in Dabouq",
        description: "Exclusive penthouse with large terrace and panoramic views. Located in upscale Dabouq with premium amenities.",
        price: "180000",
        size: 180,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "apartment",
        location: "Dabouq, Amman",
        address: "Dabouq Main Street, Amman",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: true,
        available: true,
      },
      {
        title: "Traditional House in Jebel Lweibdeh",
        description: "Authentic traditional house with modern updates in vibrant Jebel Lweibdeh. Great investment opportunity in cultural district.",
        price: "85000",
        size: 95,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "house",
        location: "Jebel Lweibdeh, Amman",
        address: "First Circle, Jebel Lweibdeh",
        imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: false,
        available: true,
      },
      {
        title: "Modern Apartment in Shmeisani",
        description: "Contemporary apartment in business district Shmeisani. Open-plan design with modern conveniences and city access.",
        price: "95000",
        size: 85,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "apartment",
        location: "Shmeisani, Amman",
        address: "Al-Sharif Abdul Hamid Sharaf Street, Shmeisani",
        imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: false,
        available: true,
      },
    ];

    sampleProperties.forEach(property => {
      this.createProperty(property);
    });
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async searchProperties(filters: SearchFilters): Promise<Property[]> {
    const allProperties = Array.from(this.properties.values());
    
    return allProperties.filter(property => {
      const price = parseFloat(property.price);
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
      
      const minSize = filters.minSize ? parseInt(filters.minSize) : 0;
      const maxSize = filters.maxSize ? parseInt(filters.maxSize) : Infinity;
      
      const minBedrooms = filters.bedrooms ? parseInt(filters.bedrooms) : 0;
      const minBathrooms = filters.bathrooms ? parseInt(filters.bathrooms) : 0;
      
      return (
        property.available &&
        price >= minPrice &&
        price <= maxPrice &&
        property.size >= minSize &&
        property.size <= maxSize &&
        property.bedrooms >= minBedrooms &&
        property.bathrooms >= minBathrooms &&
        (!filters.propertyType || property.propertyType === filters.propertyType) &&
        (!filters.location || property.location.toLowerCase().includes(filters.location.toLowerCase()))
      );
    }).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return Array.from(this.properties.values())
      .filter(property => property.featured && property.available)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async subscribeNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    // Check if email already exists
    const existingNewsletter = Array.from(this.newsletters.values())
      .find(newsletter => newsletter.email === insertNewsletter.email);
    
    if (existingNewsletter) {
      throw new Error("Email already subscribed to newsletter");
    }

    const id = this.currentNewsletterId++;
    const newsletter: Newsletter = {
      ...insertNewsletter,
      id,
      createdAt: new Date(),
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }

  async createEntrustment(insertEntrustment: InsertEntrustment): Promise<Entrustment> {
    const id = this.currentEntrustmentId++;
    const entrustment: Entrustment = {
      ...insertEntrustment,
      id,
      createdAt: new Date(),
    };
    this.entrustments.set(id, entrustment);
    return entrustment;
  }

  async createPropertyRequest(insertPropertyRequest: InsertPropertyRequest): Promise<PropertyRequest> {
    const id = this.currentPropertyRequestId++;
    const propertyRequest: PropertyRequest = {
      ...insertPropertyRequest,
      id,
      createdAt: new Date(),
    };
    this.propertyRequests.set(id, propertyRequest);
    return propertyRequest;
  }

  // Additional methods required by IStorage interface
  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;

    const updated: Property = {
      ...existing,
      ...propertyData,
      id, // Ensure ID doesn't change
      createdAt: existing.createdAt,
    };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values());
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    return this.newsletters.delete(id);
  }

  async getAllEntrustments(): Promise<Entrustment[]> {
    return Array.from(this.entrustments.values());
  }

  async deleteEntrustment(id: number): Promise<boolean> {
    return this.entrustments.delete(id);
  }

  async getAllPropertyRequests(): Promise<PropertyRequest[]> {
    return Array.from(this.propertyRequests.values());
  }

  async deletePropertyRequest(id: number): Promise<boolean> {
    return this.propertyRequests.delete(id);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = this.currentAdminId++;
    const newAdmin: Admin = {
      ...admin,
      id,
      createdAt: new Date(),
    };
    this.admins.set(id, newAdmin);
    return newAdmin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async verifyAdmin(username: string, password: string): Promise<Admin | undefined> {
    const admin = await this.getAdminByUsername(username);
    if (!admin) return undefined;

    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    return isValid ? admin : undefined;
  }

  // Site Settings - stored in memory as key-value pairs
  private siteSettings = new Map<string, SiteSettings>();
  private currentSiteSettingsId = 1;

  async getSiteSetting(key: string): Promise<SiteSettings | undefined> {
    return this.siteSettings.get(key);
  }

  async getAllSiteSettings(): Promise<SiteSettings[]> {
    return Array.from(this.siteSettings.values());
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSettings> {
    const existing = this.siteSettings.get(key);
    const setting: SiteSettings = {
      id: existing?.id || this.currentSiteSettingsId++,
      settingKey: key,
      settingValue: value,
      updatedAt: new Date(),
    };
    this.siteSettings.set(key, setting);
    return setting;
  }
}

// Use in-memory storage instead of database for simple deployment
export const storage = new MemStorage();
