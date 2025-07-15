import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, or, gte, lte, like } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
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
import { IStorage } from './storage';

// Database storage implementation - persistent data storage
export class DbStorage implements IStorage {
  private db;

  constructor() {
    try {
      const sql = neon(process.env.DATABASE_URL!);
      this.db = drizzle(sql);
      this.initializeDatabase().catch(err => {
        console.error('Failed to initialize database:', err);
      });
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  private async initializeDatabase() {
    try {
      // First, create all tables if they don't exist
      await this.createTables();
      
      // Then check if data already exists
      const existingAdmins = await this.db.select().from(admins).limit(1);
      if (existingAdmins.length === 0) {
        // Initialize only if database is empty
        await this.initializeAdmin();
        await this.initializeSiteSettings();
        await this.initializeJordanLocations();
        await this.initializePropertyTypes();
        await this.initializeSampleProperties();
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Don't throw - let the app start even if initialization fails
    }
  }

  private async createTables() {
    try {
      console.log('🔄 Creating database tables...');
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS "admins" (
          "id" serial PRIMARY KEY NOT NULL,
          "username" text NOT NULL UNIQUE,
          "email" text NOT NULL UNIQUE,
          "password_hash" text NOT NULL,
          "created_at" timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "governorates" (
          "id" serial PRIMARY KEY NOT NULL,
          "name_ar" text NOT NULL,
          "name_en" text,
          "created_at" timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "directorates" (
          "id" serial PRIMARY KEY NOT NULL,
          "governorate_id" integer REFERENCES "governorates"("id"),
          "name_ar" text NOT NULL,
          "name_en" text,
          "created_at" timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "property_types" (
          "id" serial PRIMARY KEY NOT NULL,
          "name_ar" text NOT NULL,
          "name_en" text,
          "is_active" boolean DEFAULT true,
          "created_at" timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "properties" (
          "id" serial PRIMARY KEY NOT NULL,
          "title" text NOT NULL,
          "description" text NOT NULL,
          "price" decimal(10,2) NOT NULL,
          "size" integer NOT NULL,
          "bedrooms" integer,
          "bathrooms" integer,
          "property_type" text NOT NULL,
          "image" text,
          "images" text[] DEFAULT ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
          "governorate_id" integer REFERENCES "governorates"("id"),
          "directorate_id" integer REFERENCES "directorates"("id"),
          "village" text,
          "basin" text,
          "neighborhood" text,
          "plot_number" text,
          "is_featured" boolean DEFAULT false,
          "is_published" boolean DEFAULT true,
          "updated_at" timestamp DEFAULT now(),
          "created_at" timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "contacts" (
          "id" serial PRIMARY KEY NOT NULL,
          "first_name" text NOT NULL,
          "last_name" text NOT NULL,
          "email" text NOT NULL,
          "phone" text,
          "subject" text NOT NULL,
          "message" text NOT NULL,
          "created_at" timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "newsletters" (
          "id" serial PRIMARY KEY NOT NULL,
          "email" text NOT NULL UNIQUE,
          "created_at" timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "entrustments" (
          "id" serial PRIMARY KEY NOT NULL,
          "first_name" text NOT NULL,
          "last_name" text NOT NULL,
          "email" text NOT NULL,
          "phone" text NOT NULL,
          "property_type" text NOT NULL,
          "location" text NOT NULL,
          "size" integer,
          "bedrooms" integer,
          "bathrooms" integer,
          "description" text NOT NULL,
          "service_type" text NOT NULL,
          "created_at" timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "property_requests" (
          "id" serial PRIMARY KEY NOT NULL,
          "first_name" text NOT NULL,
          "last_name" text NOT NULL,
          "email" text NOT NULL,
          "phone" text,
          "property_type" text,
          "location" text,
          "min_price" decimal(10,2),
          "max_price" decimal(10,2),
          "min_size" integer,
          "max_size" integer,
          "bedrooms" integer,
          "bathrooms" integer,
          "message" text NOT NULL,
          "created_at" timestamp DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "site_settings" (
          "id" serial PRIMARY KEY NOT NULL,
          "setting_key" varchar(100) UNIQUE NOT NULL,
          "setting_value" text NOT NULL,
          "updated_at" timestamp DEFAULT now()
        );
      `);
      console.log('✅ Database tables created successfully!');
    } catch (error) {
      console.error('❌ Failed to create tables:', error);
      throw error;
    }
  }

  private async initializeAdmin() {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await this.db.insert(admins).values({
      username,
      passwordHash: hashedPassword,
      email: process.env.ADMIN_EMAIL || 'admin@rand-realestate.com'
    });
  }

  private async initializeSiteSettings() {
    const defaultSettings = [
      { settingKey: 'footer_company_name', settingValue: 'شركة رند للاستثمار العقاري و تطويره' },
      { settingKey: 'footer_address', settingValue: 'عمان - الأردن' },
      { settingKey: 'footer_phone', settingValue: '+962 6 123 4567' },
      { settingKey: 'footer_fax', settingValue: '+962 6 123 4568' },
      { settingKey: 'footer_mobile', settingValue: '+962 79 123 4567' },
      { settingKey: 'footer_email', settingValue: 'info@rand-realestate.com' },
      { settingKey: 'footer_pobox', settingValue: '11953' },
      { settingKey: 'footer_manager', settingValue: 'م. أحمد الحديدي' },
      { settingKey: 'footer_working_hours', settingValue: 'الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً' }
    ];

    for (const setting of defaultSettings) {
      await this.db.insert(siteSettings).values(setting);
    }
  }

  private async initializeJordanLocations() {
    const jordanGovernorates = [
      { nameAr: 'عمان', nameEn: 'Amman' },
      { nameAr: 'إربد', nameEn: 'Irbid' },
      { nameAr: 'الزرقاء', nameEn: 'Zarqa' },
      { nameAr: 'البلقاء', nameEn: 'Balqa' },
      { nameAr: 'الكرك', nameEn: 'Karak' },
      { nameAr: 'معان', nameEn: 'Maan' },
      { nameAr: 'الطفيلة', nameEn: 'Tafilah' },
      { nameAr: 'المفرق', nameEn: 'Mafraq' },
      { nameAr: 'جرش', nameEn: 'Jerash' },
      { nameAr: 'عجلون', nameEn: 'Ajloun' },
      { nameAr: 'مادبا', nameEn: 'Madaba' },
      { nameAr: 'العقبة', nameEn: 'Aqaba' }
    ];

    for (const gov of jordanGovernorates) {
      const [insertedGov] = await this.db.insert(governorates).values(gov).returning();
      
      // Add sample directorates
      if (gov.nameEn === 'Amman') {
        const ammanDirectorates = [
          { governorateId: insertedGov.id, nameAr: 'قصبة عمان', nameEn: 'Qasabat Amman' },
          { governorateId: insertedGov.id, nameAr: 'وادي السير', nameEn: 'Wadi Alseer' },
          { governorateId: insertedGov.id, nameAr: 'ناعور', nameEn: 'Naur' }
        ];
        for (const dir of ammanDirectorates) {
          await this.db.insert(directorates).values(dir);
        }
      }
    }
  }

  private async initializePropertyTypes() {
    const types = [
      { nameAr: 'أرض سكنية', nameEn: 'Residential Land', isActive: true },
      { nameAr: 'أرض تجارية', nameEn: 'Commercial Land', isActive: true },
      { nameAr: 'أرض زراعية', nameEn: 'Agricultural Land', isActive: true },
      { nameAr: 'أرض صناعية', nameEn: 'Industrial Land', isActive: true },
      { nameAr: 'أرض استثمارية', nameEn: 'Investment Land', isActive: true },
      { nameAr: 'أرض سياحية', nameEn: 'Tourism Land', isActive: true }
    ];

    for (const type of types) {
      await this.db.insert(propertyTypes).values(type);
    }
  }

  private async initializeSampleProperties() {
    const govs = await this.db.select().from(governorates).limit(3);
    const dirs = await this.db.select().from(directorates).limit(3);
    const types = await this.db.select().from(propertyTypes).limit(3);

    if (govs.length > 0 && dirs.length > 0 && types.length > 0) {
      const sampleProperties = [
        {
          title: 'أرض سكنية في عبدون',
          description: 'أرض سكنية مميزة في منطقة عبدون الراقية، مطلة على مناظر خلابة',
          price: '500000',
          size: 1000,
          propertyType: types[0].nameAr,
          governorateId: govs[0].id,
          directorateId: dirs[0].id,
          village: 'عبدون',
          basin: '7',
          plotNumber: '125',
          image: '/uploads/land1.jpg',
          images: ['/uploads/land1.jpg', '/uploads/land2.jpg'],
          isFeatured: true,
          isPublished: true
        },
        {
          title: 'أرض زراعية في الأغوار',
          description: 'أرض زراعية خصبة في منطقة الأغوار، مناسبة لجميع أنواع الزراعات',
          price: 200000,
          size: 5000,
          propertyType: types[2]?.nameAr || 'أرض زراعية',
          governorateId: govs[1]?.id || govs[0].id,
          directorateId: dirs[1]?.id || dirs[0].id,
          village: 'الأغوار الشمالية',
          basin: '12',
          plotNumber: '450',
          image: '/uploads/land3.jpg',
          images: ['/uploads/land3.jpg'],
          isFeatured: false,
          isPublished: true
        }
      ];

      for (const property of sampleProperties) {
        await this.db.insert(properties).values(property);
      }
    }
  }

  // Properties implementation
  async getAllProperties(): Promise<Property[]> {
    try {
      return await this.db.select().from(properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    const [property] = await this.db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async searchProperties(filters: SearchFilters): Promise<Property[]> {
    const conditions = [eq(properties.isPublished, true)]; // Always include isPublished check

    if (filters.propertyType) {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }
    if (filters.governorateId) {
      conditions.push(eq(properties.governorateId, filters.governorateId));
    }
    if (filters.directorateId) {
      conditions.push(eq(properties.directorateId, filters.directorateId));
    }
    if (filters.minPrice) {
      conditions.push(gte(properties.price, filters.minPrice));
    }
    if (filters.maxPrice) {
      conditions.push(lte(properties.price, filters.maxPrice));
    }
    if (filters.minSize) {
      conditions.push(gte(properties.size, filters.minSize));
    }
    if (filters.maxSize) {
      conditions.push(lte(properties.size, filters.maxSize));
    }

    const query = this.db.select().from(properties).where(and(...conditions));
    return await query;
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return await this.db.select()
      .from(properties)
      .where(and(eq(properties.isFeatured, true), eq(properties.isPublished, true)));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await this.db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await this.db.update(properties)
      .set({ ...propertyData, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updated;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await this.db.delete(properties).where(eq(properties.id, id));
    return true;
  }

  // Contacts implementation
  async getAllContacts(): Promise<Contact[]> {
    return await this.db.select().from(contacts);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await this.db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    await this.db.delete(contacts).where(eq(contacts.id, id));
    return true;
  }

  // Newsletter implementation
  async getAllNewsletters(): Promise<Newsletter[]> {
    return await this.db.select().from(newsletters);
  }

  async subscribeNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    // Check if already subscribed
    const existing = await this.db.select()
      .from(newsletters)
      .where(eq(newsletters.email, insertNewsletter.email));
    
    if (existing.length > 0) {
      throw new Error('This email is already subscribed to our newsletter');
    }

    const [newSubscriber] = await this.db.insert(newsletters).values(insertNewsletter).returning();
    return newSubscriber;
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    await this.db.delete(newsletters).where(eq(newsletters.id, id));
    return true;
  }

  // Entrustments implementation
  async getAllEntrustments(): Promise<Entrustment[]> {
    return await this.db.select().from(entrustments);
  }

  async createEntrustment(entrustment: InsertEntrustment): Promise<Entrustment> {
    const [newEntrustment] = await this.db.insert(entrustments).values(entrustment).returning();
    return newEntrustment;
  }

  async deleteEntrustment(id: number): Promise<boolean> {
    await this.db.delete(entrustments).where(eq(entrustments.id, id));
    return true;
  }

  // Property Requests implementation
  async getAllPropertyRequests(): Promise<PropertyRequest[]> {
    return await this.db.select().from(propertyRequests);
  }

  async createPropertyRequest(request: InsertPropertyRequest): Promise<PropertyRequest> {
    const [newRequest] = await this.db.insert(propertyRequests).values(request).returning();
    return newRequest;
  }

  async deletePropertyRequest(id: number): Promise<boolean> {
    await this.db.delete(propertyRequests).where(eq(propertyRequests.id, id));
    return true;
  }

  // Admin implementation
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const [newAdmin] = await this.db.insert(admins)
      .values({ ...admin, passwordHash: hashedPassword })
      .returning();
    return newAdmin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await this.db.select()
      .from(admins)
      .where(eq(admins.username, username));
    return admin;
  }

  async verifyAdmin(username: string, password: string): Promise<Admin | undefined> {
    const admin = await this.getAdminByUsername(username);
    if (!admin) return undefined;
    
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    return isValid ? admin : undefined;
  }

  // Site Settings implementation
  async getSiteSetting(key: string): Promise<SiteSettings | undefined> {
    const [setting] = await this.db.select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, key));
    return setting;
  }

  async getAllSiteSettings(): Promise<SiteSettings[]> {
    return await this.db.select().from(siteSettings);
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSettings> {
    let [setting] = await this.db.select()
      .from(siteSettings)
      .where(eq(siteSettings.settingKey, key));
    
    if (setting) {
      [setting] = await this.db.update(siteSettings)
        .set({ settingValue: value, updatedAt: new Date() })
        .where(eq(siteSettings.settingKey, key))
        .returning();
    } else {
      [setting] = await this.db.insert(siteSettings)
        .values({ settingKey: key, settingValue: value })
        .returning();
    }
    
    return setting;
  }

  // Governorates implementation
  async getAllGovernorates(): Promise<Governorate[]> {
    return await this.db.select().from(governorates);
  }

  async createGovernorate(governorate: InsertGovernorate): Promise<Governorate> {
    const [newGovernorate] = await this.db.insert(governorates).values(governorate).returning();
    return newGovernorate;
  }

  async updateGovernorate(id: number, governorateData: Partial<InsertGovernorate>): Promise<Governorate | undefined> {
    const [updated] = await this.db.update(governorates)
      .set(governorateData)
      .where(eq(governorates.id, id))
      .returning();
    return updated;
  }

  async deleteGovernorate(id: number): Promise<boolean> {
    await this.db.delete(governorates).where(eq(governorates.id, id));
    return true;
  }

  // Directorates implementation
  async getAllDirectorates(): Promise<Directorate[]> {
    return await this.db.select().from(directorates);
  }

  async getDirectoratesByGovernorate(governorateId: number): Promise<Directorate[]> {
    return await this.db.select()
      .from(directorates)
      .where(eq(directorates.governorateId, governorateId));
  }

  async createDirectorate(directorate: InsertDirectorate): Promise<Directorate> {
    const [newDirectorate] = await this.db.insert(directorates).values(directorate).returning();
    return newDirectorate;
  }

  async updateDirectorate(id: number, directorateData: Partial<InsertDirectorate>): Promise<Directorate | undefined> {
    const [updated] = await this.db.update(directorates)
      .set(directorateData)
      .where(eq(directorates.id, id))
      .returning();
    return updated;
  }

  async deleteDirectorate(id: number): Promise<boolean> {
    await this.db.delete(directorates).where(eq(directorates.id, id));
    return true;
  }

  // Property Types implementation
  async getAllPropertyTypes(): Promise<PropertyType[]> {
    return await this.db.select().from(propertyTypes);
  }

  async getActivePropertyTypes(): Promise<PropertyType[]> {
    return await this.db.select()
      .from(propertyTypes)
      .where(eq(propertyTypes.isActive, true));
  }

  async createPropertyType(propertyType: InsertPropertyType): Promise<PropertyType> {
    const [newType] = await this.db.insert(propertyTypes).values(propertyType).returning();
    return newType;
  }

  async updatePropertyType(id: number, propertyTypeData: Partial<InsertPropertyType>): Promise<PropertyType | undefined> {
    const [updated] = await this.db.update(propertyTypes)
      .set(propertyTypeData)
      .where(eq(propertyTypes.id, id))
      .returning();
    return updated;
  }

  async deletePropertyType(id: number): Promise<boolean> {
    await this.db.delete(propertyTypes).where(eq(propertyTypes.id, id));
    return true;
  }
}