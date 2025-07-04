import { pgTable, text, varchar, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  size: integer("size").notNull(), // in square meters
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  propertyType: text("property_type").notNull(), // apartment, house, villa, studio
  location: text("location").notNull(),
  address: text("address").notNull(),
  images: text("images").array().notNull().default(["https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"]),
  // Jordan-specific location fields
  governorateId: integer("governorate_id").references(() => governorates.id),
  directorateId: integer("directorate_id").references(() => directorates.id),
  village: text("village"),
  basin: text("basin"),
  neighborhood: text("neighborhood"),
  plotNumber: text("plot_number"),
  featured: boolean("featured").default(false),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const entrustments = pgTable("entrustments", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  propertyType: text("property_type").notNull(),
  location: text("location").notNull(),
  size: integer("size"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull(), // rent or sell
  createdAt: timestamp("created_at").defaultNow(),
});

export const propertyRequests = pgTable("property_requests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  propertyType: text("property_type"),
  location: text("location"),
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  minSize: integer("min_size"),
  maxSize: integer("max_size"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).unique().notNull(),
  settingValue: text("setting_value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Governorates table
export const governorates = pgTable("governorates", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Directorates table
export const directorates = pgTable("directorates", {
  id: serial("id").primaryKey(),
  governorateId: integer("governorate_id").references(() => governorates.id),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Property types table for customizable land types
export const propertyTypes = pgTable("property_types", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
});

export const insertEntrustmentSchema = createInsertSchema(entrustments).omit({
  id: true,
  createdAt: true,
});

export const insertPropertyRequestSchema = createInsertSchema(propertyRequests).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
});

export const insertGovernorateSchema = createInsertSchema(governorates).omit({
  id: true,
  createdAt: true,
});

export const insertDirectorateSchema = createInsertSchema(directorates).omit({
  id: true,
  createdAt: true,
});

export const insertPropertyTypeSchema = createInsertSchema(propertyTypes).omit({
  id: true,
  createdAt: true,
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Entrustment = typeof entrustments.$inferSelect;
export type InsertEntrustment = z.infer<typeof insertEntrustmentSchema>;
export type PropertyRequest = typeof propertyRequests.$inferSelect;
export type InsertPropertyRequest = z.infer<typeof insertPropertyRequestSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type Governorate = typeof governorates.$inferSelect;
export type InsertGovernorate = z.infer<typeof insertGovernorateSchema>;
export type Directorate = typeof directorates.$inferSelect;
export type InsertDirectorate = z.infer<typeof insertDirectorateSchema>;
export type PropertyType = typeof propertyTypes.$inferSelect;
export type InsertPropertyType = z.infer<typeof insertPropertyTypeSchema>;

// Search filters type
export const searchFiltersSchema = z.object({
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minSize: z.string().optional(),
  maxSize: z.string().optional(),
  propertyType: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  location: z.string().optional(),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
