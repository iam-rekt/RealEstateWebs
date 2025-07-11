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
    // Check if data already exists
    const existingAdmins = await this.db.select().from(admins).limit(1);
    if (existingAdmins.length === 0) {
      // Initialize only if database is empty
      await this.initializeAdmin();
      await this.initializeSiteSettings();
      await this.initializeJordanLocations();
      await this.initializePropertyTypes();
      await this.initializeSampleProperties();
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
          price: 500000,
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
    let query = this.db.select().from(properties).where(eq(properties.isPublished, true));
    const conditions = [];

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
      conditions.push(gte(properties.price, parseInt(filters.minPrice)));
    }
    if (filters.maxPrice) {
      conditions.push(lte(properties.price, parseInt(filters.maxPrice)));
    }
    if (filters.minSize) {
      conditions.push(gte(properties.size, parseInt(filters.minSize)));
    }
    if (filters.maxSize) {
      conditions.push(lte(properties.size, parseInt(filters.maxSize)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

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