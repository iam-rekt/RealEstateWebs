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

// In-memory storage implementation - production ready with zero dependencies
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
      passwordHash: hashedPassword,
      createdAt: new Date()
    };
    
    this.admins.set(admin.id, admin);
  }

  private initializeSampleProperties() {
    const sampleProperties = [
      {
        id: this.currentPropertyId++,
        title: "أرض سكنية في عبدون",
        description: "أرض سكنية جميلة مع إطلالة على المدينة في منطقة عبدون المرموقة. موقع مميز للاستثمار العقاري الفاخر.",
        price: "200000",
        size: 800,
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "land",
        location: "عبدون، عمان",
        address: "دوار عبدون، عمان",
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: true,
        available: true,
        createdAt: new Date()
      },
      {
        id: this.currentPropertyId++,
        title: "مزرعة فاخرة في الصويفية",
        description: "مزرعة فاخرة مع أرض واسعة في منطقة الصويفية. مناسبة للعائلات الباحثة عن الراحة والأناقة في قلب عمان.",
        price: "450000",
        size: 2500,
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "farm",
        location: "الصويفية، عمان",
        address: "شارع الثقافة، الصويفية",
        imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: false,
        available: true,
        createdAt: new Date()
      },
      {
        id: this.currentPropertyId++,
        title: "أرض زراعية في جبل عمان",
        description: "أرض زراعية خصبة في منطقة جبل عمان التاريخية. مناسبة للاستثمار الزراعي أو إقامة مزرعة صغيرة.",
        price: "95000",
        size: 1200,
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "farm",
        location: "جبل عمان، عمان",
        address: "شارع الرينبو، جبل عمان",
        imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: true,
        available: true,
        createdAt: new Date()
      },
      {
        id: this.currentPropertyId++,
        title: "قطعة أرض تجارية في دابوق",
        description: "قطعة أرض تجارية مميزة في منطقة دابوق الراقية. موقع ممتاز للاستثمار التجاري أو إقامة مشروع سكني فاخر.",
        price: "320000",
        size: 1000,
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "land",
        location: "دابوق، عمان",
        address: "شارع دابوق الرئيسي، عمان",
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: true,
        available: true,
        createdAt: new Date()
      },
      {
        id: this.currentPropertyId++,
        title: "أرض تجارية في جبل اللويبدة",
        description: "أرض تجارية أصيلة في منطقة جبل اللويبدة النابضة بالحياة. فرصة استثمارية ممتازة في المنطقة الثقافية.",
        price: "175000",
        size: 650,
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "land",
        location: "جبل اللويبدة، عمان",
        address: "الدوار الأول، جبل اللويبدة",
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: false,
        available: true,
        createdAt: new Date()
      },
      {
        id: this.currentPropertyId++,
        title: "قطعة أرض في الشميساني",
        description: "قطعة أرض عصرية في الحي التجاري الشميساني. تصميم مفتوح مع وسائل الراحة الحديثة والوصول إلى المدينة.",
        price: "150000",
        size: 550,
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "land",
        location: "الشميساني، عمان",
        address: "شارع الشريف عبد الحميد شرف، الشميساني",
        imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: false,
        available: true,
        createdAt: new Date()
      }
    ];

    for (const property of sampleProperties) {
      this.properties.set(property.id, property as Property);
    }
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
      if (!property.available) return false;
      
      if (filters.minPrice && parseFloat(property.price) < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && parseFloat(property.price) > parseFloat(filters.maxPrice)) return false;
      if (filters.minSize && property.size < parseInt(filters.minSize)) return false;
      if (filters.maxSize && property.size > parseInt(filters.maxSize)) return false;
      if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
      if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) return false;
      if (filters.bathrooms && property.bathrooms < parseInt(filters.bathrooms)) return false;
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      
      return true;
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
    const property: Property = {
      id: this.currentPropertyId++,
      ...insertProperty,
      featured: insertProperty.featured ?? false,
      available: insertProperty.available ?? true,
      createdAt: new Date()
    };
    
    this.properties.set(property.id, property);
    return property;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const contact: Contact = {
      id: this.currentContactId++,
      ...insertContact,
      phone: insertContact.phone ?? null,
      createdAt: new Date()
    };
    
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async subscribeNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    // Check for existing email
    for (const newsletter of this.newsletters.values()) {
      if (newsletter.email === insertNewsletter.email) {
        throw new Error("Email already subscribed to newsletter");
      }
    }
    
    const newsletter: Newsletter = {
      id: this.currentNewsletterId++,
      ...insertNewsletter,
      createdAt: new Date()
    };
    
    this.newsletters.set(newsletter.id, newsletter);
    return newsletter;
  }

  async createEntrustment(insertEntrustment: InsertEntrustment): Promise<Entrustment> {
    const entrustment: Entrustment = {
      id: this.currentEntrustmentId++,
      ...insertEntrustment,
      size: insertEntrustment.size ?? null,
      bedrooms: insertEntrustment.bedrooms ?? null,
      bathrooms: insertEntrustment.bathrooms ?? null,
      createdAt: new Date()
    };
    
    this.entrustments.set(entrustment.id, entrustment);
    return entrustment;
  }

  async createPropertyRequest(insertPropertyRequest: InsertPropertyRequest): Promise<PropertyRequest> {
    const propertyRequest: PropertyRequest = {
      id: this.currentPropertyRequestId++,
      ...insertPropertyRequest,
      phone: insertPropertyRequest.phone ?? null,
      propertyType: insertPropertyRequest.propertyType ?? null,
      location: insertPropertyRequest.location ?? null,
      minPrice: insertPropertyRequest.minPrice ?? null,
      maxPrice: insertPropertyRequest.maxPrice ?? null,
      minSize: insertPropertyRequest.minSize ?? null,
      maxSize: insertPropertyRequest.maxSize ?? null,
      bedrooms: insertPropertyRequest.bedrooms ?? null,
      bathrooms: insertPropertyRequest.bathrooms ?? null,
      createdAt: new Date()
    };
    
    this.propertyRequests.set(propertyRequest.id, propertyRequest);
    return propertyRequest;
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;
    
    const updated: Property = {
      ...existing,
      ...propertyData,
    };
    
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    return this.newsletters.delete(id);
  }

  async getAllEntrustments(): Promise<Entrustment[]> {
    return Array.from(this.entrustments.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async deleteEntrustment(id: number): Promise<boolean> {
    return this.entrustments.delete(id);
  }

  async getAllPropertyRequests(): Promise<PropertyRequest[]> {
    return Array.from(this.propertyRequests.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async deletePropertyRequest(id: number): Promise<boolean> {
    return this.propertyRequests.delete(id);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(admin.passwordHash, saltRounds);
    
    const newAdmin: Admin = {
      id: this.currentAdminId++,
      ...admin,
      passwordHash: hashedPassword,
      createdAt: new Date()
    };
    
    this.admins.set(newAdmin.id, newAdmin);
    return newAdmin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    for (const admin of this.admins.values()) {
      if (admin.username === username) {
        return admin;
      }
    }
    return undefined;
  }

  async verifyAdmin(username: string, password: string): Promise<Admin | undefined> {
    const admin = await this.getAdminByUsername(username);
    if (!admin) return undefined;
    
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    return isValid ? admin : undefined;
  }

  // Site settings storage
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
      id: existing?.id ?? this.currentSiteSettingsId++,
      settingKey: key,
      settingValue: value,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date()
    };
    
    this.siteSettings.set(key, setting);
    return setting;
  }
}

export const storage = new MemStorage();