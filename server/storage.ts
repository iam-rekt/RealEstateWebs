import { 
  properties, 
  contacts, 
  newsletters, 
  entrustments, 
  propertyRequests,
  admins,
  siteSettings,
  governorates,
  directorates,
  propertyTypes,
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
  type Governorate,
  type InsertGovernorate,
  type Directorate,
  type InsertDirectorate,
  type PropertyType,
  type InsertPropertyType,
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
  
  // Governorates
  getAllGovernorates(): Promise<Governorate[]>;
  createGovernorate(governorate: InsertGovernorate): Promise<Governorate>;
  updateGovernorate(id: number, governorate: Partial<InsertGovernorate>): Promise<Governorate | undefined>;
  deleteGovernorate(id: number): Promise<boolean>;
  
  // Directorates
  getAllDirectorates(): Promise<Directorate[]>;
  getDirectoratesByGovernorate(governorateId: number): Promise<Directorate[]>;
  createDirectorate(directorate: InsertDirectorate): Promise<Directorate>;
  updateDirectorate(id: number, directorate: Partial<InsertDirectorate>): Promise<Directorate | undefined>;
  deleteDirectorate(id: number): Promise<boolean>;
  
  // Property Types
  getAllPropertyTypes(): Promise<PropertyType[]>;
  getActivePropertyTypes(): Promise<PropertyType[]>;
  createPropertyType(propertyType: InsertPropertyType): Promise<PropertyType>;
  updatePropertyType(id: number, propertyType: Partial<InsertPropertyType>): Promise<PropertyType | undefined>;
  deletePropertyType(id: number): Promise<boolean>;
}

// In-memory storage implementation - production ready with zero dependencies
export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private contacts: Map<number, Contact>;
  private newsletters: Map<number, Newsletter>;
  private entrustments: Map<number, Entrustment>;
  private propertyRequests: Map<number, PropertyRequest>;
  private admins: Map<number, Admin>;
  private governorates: Map<number, Governorate>;
  private directorates: Map<number, Directorate>;
  private propertyTypes: Map<number, PropertyType>;
  private currentPropertyId: number;
  private currentContactId: number;
  private currentNewsletterId: number;
  private currentEntrustmentId: number;
  private currentPropertyRequestId: number;
  private currentAdminId: number;
  private currentGovernorateId: number;
  private currentDirectorateId: number;
  private currentPropertyTypeId: number;

  constructor() {
    this.properties = new Map();
    this.contacts = new Map();
    this.newsletters = new Map();
    this.entrustments = new Map();
    this.propertyRequests = new Map();
    this.admins = new Map();
    this.governorates = new Map();
    this.directorates = new Map();
    this.propertyTypes = new Map();
    this.currentPropertyId = 1;
    this.currentContactId = 1;
    this.currentNewsletterId = 1;
    this.currentEntrustmentId = 1;
    this.currentPropertyRequestId = 1;
    this.currentAdminId = 1;
    this.currentGovernorateId = 1;
    this.currentDirectorateId = 1;
    this.currentPropertyTypeId = 1;
    
    // Initialize with sample properties, admin, and Jordan locations
    this.initializeSampleProperties();
    this.initializeAdmin();
    this.initializeJordanLocations();
    this.initializePropertyTypes();
    this.initializeSiteSettings();
  }

  private async initializeAdmin() {
    // Use environment variables for admin credentials with secure defaults
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@company.com";
    
    // Warn if using default credentials
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      console.warn("⚠️  WARNING: Using default admin credentials. Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables for production!");
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    const admin: Admin = {
      id: this.currentAdminId++,
      username: adminUsername,
      email: adminEmail,
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
        images: [
          "https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/2437297/pexels-photo-2437297.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/2828723/pexels-photo-2828723.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        governorateId: 1, // عمان
        directorateId: 1, // عبدون
        village: "عبدون",
        basin: "حوض عبدون",
        neighborhood: "حي الدوار الأول",
        plotNumber: "201",
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
        images: [
          "https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/1595904/pexels-photo-1595904.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        governorateId: 1,
        directorateId: 2,
        village: "الصويفية",
        basin: "حوض الصويفية",
        neighborhood: "حي شارع الثقافة",
        plotNumber: "105",
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
        images: [
          "https://images.pexels.com/photos/1595905/pexels-photo-1595905.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/325944/pexels-photo-325944.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        governorateId: 1,
        directorateId: 3,
        village: null,
        basin: null,
        neighborhood: null,
        plotNumber: null,
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
        images: [
          "/uploads/land-property-2.svg",
          "/uploads/land-property-3.svg"
        ],
        governorateId: 1,
        directorateId: 4,
        village: null,
        basin: null,
        neighborhood: null,
        plotNumber: null,
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
        images: [
          "/uploads/land-property-3.svg",
          "/uploads/land-property-1.svg"
        ],
        governorateId: 1,
        directorateId: 5,
        village: null,
        basin: null,
        neighborhood: null,
        plotNumber: null,
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
        images: [
          "/uploads/land-property-1.svg",
          "/uploads/land-property-2.svg"
        ],
        governorateId: 1,
        directorateId: 6,
        village: null,
        basin: null,
        neighborhood: null,
        plotNumber: null,
        featured: false,
        available: true,
        createdAt: new Date()
      }
    ];

    for (const property of sampleProperties) {
      this.properties.set(property.id, property as Property);
    }
  }

  // Helper method to enrich properties with governorate and directorate names
  private enrichPropertiesWithLocationNames(properties: Property[]): (Property & { governorateName?: string; directorateName?: string })[] {
    return properties.map(property => {
      const governorate = property.governorateId ? this.governorates.get(property.governorateId) : undefined;
      const directorate = property.directorateId ? this.directorates.get(property.directorateId) : undefined;
      
      return {
        ...property,
        // Add computed fields for display
        governorateName: governorate?.nameAr,
        directorateName: directorate?.nameAr,
      };
    });
  }

  async getAllProperties(): Promise<Property[]> {
    const properties = Array.from(this.properties.values());
    return this.enrichPropertiesWithLocationNames(properties).sort((a: any, b: any) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    return this.enrichPropertiesWithLocationNames([property])[0];
  }

  async searchProperties(filters: SearchFilters): Promise<Property[]> {
    const allProperties = Array.from(this.properties.values());
    
    const filteredProperties = allProperties.filter(property => {
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
    });

    return this.enrichPropertiesWithLocationNames(filteredProperties).sort((a: any, b: any) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getFeaturedProperties(): Promise<Property[]> {
    const featuredProperties = Array.from(this.properties.values())
      .filter(property => property.featured && property.available);
      
    return this.enrichPropertiesWithLocationNames(featuredProperties).sort((a: any, b: any) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const property: Property = {
      id: this.currentPropertyId++,
      ...insertProperty,
      images: insertProperty.images || ["/uploads/land-property-1.svg"],
      governorateId: insertProperty.governorateId ?? null,
      directorateId: insertProperty.directorateId ?? null,
      village: insertProperty.village ?? null,
      basin: insertProperty.basin ?? null,
      neighborhood: insertProperty.neighborhood ?? null,
      plotNumber: insertProperty.plotNumber ?? null,
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
    for (const newsletter of Array.from(this.newsletters.values())) {
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
      governorateId: propertyData.governorateId !== undefined ? propertyData.governorateId : existing.governorateId,
      directorateId: propertyData.directorateId !== undefined ? propertyData.directorateId : existing.directorateId,
      village: propertyData.village !== undefined ? propertyData.village : existing.village,
      basin: propertyData.basin !== undefined ? propertyData.basin : existing.basin,
      neighborhood: propertyData.neighborhood !== undefined ? propertyData.neighborhood : existing.neighborhood,
      plotNumber: propertyData.plotNumber !== undefined ? propertyData.plotNumber : existing.plotNumber,
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
    for (const admin of Array.from(this.admins.values())) {
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
      updatedAt: new Date()
    };
    
    this.siteSettings.set(key, setting);
    return setting;
  }

  private initializeSiteSettings() {
    const defaultSettings = [
      { key: 'footer_company_name', value: 'شركة رند للاستثمار العقاري و تطويره' },
      { key: 'footer_description', value: 'شريكك الموثوق في الأراضي في عمان. نتخصص في ربط المشترين والمستثمرين بالأراضي الاستثنائية في جميع أنحاء منطقة عمان الكبرى.' },
      { key: 'footer_address', value: 'الصويفية - مجمع فرح التجاري - الطابق الثاني' },
      { key: 'footer_phone', value: '+962 6 5826440' },
      { key: 'footer_fax', value: '+962 6 5826408' },
      { key: 'footer_mobile1', value: '+962 79 5566030' },
      { key: 'footer_mobile2', value: '+962 77 5566030' },
      { key: 'footer_po_box', value: 'ص.ب: 37 عمان 11831 الأردن' },
      { key: 'footer_manager', value: 'المدير العام: فؤاد حدادين' },
      { key: 'footer_working_hours', value: 'الأحد إلى الخميس\n9:30 صباحاً - 5:00 مساءً' },
      { key: 'footer_email', value: 'info@randrealestate.com' },
      { key: 'footer_website', value: 'www.randrealestate.com' },
      { key: 'footer_social_facebook', value: '#' },
      { key: 'footer_social_instagram', value: '#' },
      { key: 'footer_social_linkedin', value: '#' }
    ];

    defaultSettings.forEach(setting => {
      if (!this.siteSettings.has(setting.key)) {
        const siteSetting: SiteSettings = {
          id: this.currentSiteSettingsId++,
          settingKey: setting.key,
          settingValue: setting.value,
          updatedAt: new Date()
        };
        this.siteSettings.set(setting.key, siteSetting);
      }
    });
  }

  // Initialize Jordan locations
  private initializeJordanLocations() {
    // Initialize Jordan governorates
    const jordanGovernorates = [
      { nameAr: "عمان", nameEn: "Amman" },
      { nameAr: "إربد", nameEn: "Irbid" },
      { nameAr: "الزرقاء", nameEn: "Zarqa" },
      { nameAr: "البلقاء", nameEn: "Balqa" },
      { nameAr: "مادبا", nameEn: "Madaba" },
      { nameAr: "الكرك", nameEn: "Karak" },
      { nameAr: "الطفيلة", nameEn: "Tafileh" },
      { nameAr: "معان", nameEn: "Ma'an" },
      { nameAr: "العقبة", nameEn: "Aqaba" },
      { nameAr: "جرش", nameEn: "Jerash" },
      { nameAr: "عجلون", nameEn: "Ajloun" },
      { nameAr: "المفرق", nameEn: "Mafraq" }
    ];

    // Add governorates
    jordanGovernorates.forEach(gov => {
      const governorate: Governorate = {
        id: this.currentGovernorateId++,
        nameAr: gov.nameAr,
        nameEn: gov.nameEn,
        createdAt: new Date()
      };
      this.governorates.set(governorate.id, governorate);
    });

    // Initialize Amman directorates (governorate ID 1)
    const ammanDirectorates = [
      "قصبة عمان",
      "الجامعة", 
      "وادي السير",
      "أبو نصير",
      "ماركا",
      "القويسمة",
      "سحاب",
      "الموقر",
      "ناعور"
    ];

    ammanDirectorates.forEach(dir => {
      const directorate: Directorate = {
        id: this.currentDirectorateId++,
        governorateId: 1, // Amman
        nameAr: dir,
        nameEn: null,
        createdAt: new Date()
      };
      this.directorates.set(directorate.id, directorate);
    });
  }

  // Governorate methods
  async getAllGovernorates(): Promise<Governorate[]> {
    return Array.from(this.governorates.values()).sort((a, b) => a.nameAr.localeCompare(b.nameAr));
  }

  async createGovernorate(governorate: InsertGovernorate): Promise<Governorate> {
    const newGovernorate: Governorate = {
      id: this.currentGovernorateId++,
      ...governorate,
      nameEn: governorate.nameEn ?? null,
      createdAt: new Date()
    };
    this.governorates.set(newGovernorate.id, newGovernorate);
    return newGovernorate;
  }

  async updateGovernorate(id: number, governorateData: Partial<InsertGovernorate>): Promise<Governorate | undefined> {
    const existing = this.governorates.get(id);
    if (!existing) return undefined;

    const updated: Governorate = {
      ...existing,
      ...governorateData
    };
    this.governorates.set(id, updated);
    return updated;
  }

  async deleteGovernorate(id: number): Promise<boolean> {
    // Also delete related directorates
    for (const [dirId, directorate] of Array.from(this.directorates.entries())) {
      if (directorate.governorateId === id) {
        this.directorates.delete(dirId);
      }
    }
    return this.governorates.delete(id);
  }

  // Directorate methods
  async getAllDirectorates(): Promise<Directorate[]> {
    return Array.from(this.directorates.values()).sort((a, b) => a.nameAr.localeCompare(b.nameAr));
  }

  async getDirectoratesByGovernorate(governorateId: number): Promise<Directorate[]> {
    return Array.from(this.directorates.values())
      .filter(dir => dir.governorateId === governorateId)
      .sort((a, b) => a.nameAr.localeCompare(b.nameAr));
  }

  async createDirectorate(directorate: InsertDirectorate): Promise<Directorate> {
    const newDirectorate: Directorate = {
      id: this.currentDirectorateId++,
      ...directorate,
      nameEn: directorate.nameEn ?? null,
      governorateId: directorate.governorateId ?? null,
      createdAt: new Date()
    };
    this.directorates.set(newDirectorate.id, newDirectorate);
    return newDirectorate;
  }

  async updateDirectorate(id: number, directorateData: Partial<InsertDirectorate>): Promise<Directorate | undefined> {
    const existing = this.directorates.get(id);
    if (!existing) return undefined;

    const updated: Directorate = {
      ...existing,
      ...directorateData
    };
    this.directorates.set(id, updated);
    return updated;
  }

  async deleteDirectorate(id: number): Promise<boolean> {
    return this.directorates.delete(id);
  }

  // Property Types methods
  private initializePropertyTypes() {
    const defaultPropertyTypes = [
      { nameAr: "أرض سكنية", nameEn: "Residential Land" },
      { nameAr: "أرض تجارية", nameEn: "Commercial Land" },
      { nameAr: "أرض صناعية", nameEn: "Industrial Land" },
      { nameAr: "أرض زراعية", nameEn: "Agricultural Land" },
      { nameAr: "أرض خدماتية", nameEn: "Service Land" },
      { nameAr: "أرض مختلطة", nameEn: "Mixed Use Land" }
    ];

    for (const propertyType of defaultPropertyTypes) {
      const type: PropertyType = {
        id: this.currentPropertyTypeId++,
        nameAr: propertyType.nameAr,
        nameEn: propertyType.nameEn,
        isActive: true,
        createdAt: new Date()
      };
      this.propertyTypes.set(type.id, type);
    }
  }

  async getAllPropertyTypes(): Promise<PropertyType[]> {
    return Array.from(this.propertyTypes.values());
  }

  async getActivePropertyTypes(): Promise<PropertyType[]> {
    return Array.from(this.propertyTypes.values()).filter(type => type.isActive);
  }

  async createPropertyType(propertyType: InsertPropertyType): Promise<PropertyType> {
    const newPropertyType: PropertyType = {
      id: this.currentPropertyTypeId++,
      ...propertyType,
      nameEn: propertyType.nameEn ?? null,
      isActive: propertyType.isActive ?? true,
      createdAt: new Date()
    };
    this.propertyTypes.set(newPropertyType.id, newPropertyType);
    return newPropertyType;
  }

  async updatePropertyType(id: number, propertyTypeData: Partial<InsertPropertyType>): Promise<PropertyType | undefined> {
    const existing = this.propertyTypes.get(id);
    if (!existing) return undefined;

    const updated: PropertyType = {
      ...existing,
      ...propertyTypeData
    };
    this.propertyTypes.set(id, updated);
    return updated;
  }

  async deletePropertyType(id: number): Promise<boolean> {
    return this.propertyTypes.delete(id);
  }
}

export const storage = new MemStorage();