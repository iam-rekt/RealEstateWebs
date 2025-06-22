import { 
  properties, 
  contacts, 
  newsletters, 
  entrustments, 
  propertyRequests,
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
  type SearchFilters
} from "@shared/schema";

export interface IStorage {
  // Properties
  getAllProperties(): Promise<Property[]>;
  getPropertyById(id: number): Promise<Property | undefined>;
  searchProperties(filters: SearchFilters): Promise<Property[]>;
  getFeaturedProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Newsletter
  subscribeNewsletter(email: InsertNewsletter): Promise<Newsletter>;
  
  // Entrustments
  createEntrustment(entrustment: InsertEntrustment): Promise<Entrustment>;
  
  // Property Requests
  createPropertyRequest(request: InsertPropertyRequest): Promise<PropertyRequest>;
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private contacts: Map<number, Contact>;
  private newsletters: Map<number, Newsletter>;
  private entrustments: Map<number, Entrustment>;
  private propertyRequests: Map<number, PropertyRequest>;
  private currentPropertyId: number;
  private currentContactId: number;
  private currentNewsletterId: number;
  private currentEntrustmentId: number;
  private currentPropertyRequestId: number;

  constructor() {
    this.properties = new Map();
    this.contacts = new Map();
    this.newsletters = new Map();
    this.entrustments = new Map();
    this.propertyRequests = new Map();
    this.currentPropertyId = 1;
    this.currentContactId = 1;
    this.currentNewsletterId = 1;
    this.currentEntrustmentId = 1;
    this.currentPropertyRequestId = 1;
    
    // Initialize with sample properties
    this.initializeSampleProperties();
  }

  private initializeSampleProperties() {
    const sampleProperties: InsertProperty[] = [
      {
        title: "Modern Apartment in Kolonaki",
        description: "Beautiful modern apartment with city views in the prestigious Kolonaki area. Recently renovated with high-end finishes and modern amenities.",
        price: "450000",
        size: 120,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "apartment",
        location: "Kolonaki, Athens",
        address: "Patriarchou Ioakim 15, Kolonaki 106 75",
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: true,
        available: true,
      },
      {
        title: "Luxury Villa in Glyfada",
        description: "Stunning luxury villa with private pool and garden in Glyfada. Perfect for families seeking comfort and elegance by the sea.",
        price: "850000",
        size: 250,
        bedrooms: 4,
        bathrooms: 3,
        propertyType: "villa",
        location: "Glyfada, Athens",
        address: "Metaxa Avenue 45, Glyfada 166 74",
        imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: false,
        available: true,
      },
      {
        title: "Cozy Studio in Plaka",
        description: "Charming studio apartment in the historic Plaka district. Walking distance to Acropolis and all major attractions.",
        price: "180000",
        size: 45,
        bedrooms: 0,
        bathrooms: 1,
        propertyType: "studio",
        location: "Plaka, Athens",
        address: "Adrianou 25, Plaka 105 55",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: false,
        available: true,
      },
      {
        title: "Penthouse with Terrace",
        description: "Exclusive penthouse with large terrace and panoramic views. Located in upscale Kifisia with premium amenities.",
        price: "720000",
        size: 180,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "apartment",
        location: "Kifisia, Athens",
        address: "Kassaveti 12, Kifisia 145 62",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: true,
        available: true,
      },
      {
        title: "Traditional House",
        description: "Authentic traditional house with modern updates in vibrant Pangrati. Great investment opportunity in up-and-coming area.",
        price: "320000",
        size: 95,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "house",
        location: "Pangrati, Athens",
        address: "Imitou 8, Pangrati 116 35",
        imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        featured: false,
        available: true,
      },
      {
        title: "Modern Loft in Psyrri",
        description: "Contemporary loft in trendy Psyrri district. Open-plan design with industrial touches and modern conveniences.",
        price: "380000",
        size: 85,
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "apartment",
        location: "Psyrri, Athens",
        address: "Miaouli 22, Psyrri 105 54",
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
}

export const storage = new MemStorage();
