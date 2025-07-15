import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
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
  propertyTypes
} from "@shared/schema";

// Database migration script
async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to database...');
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('🔄 Creating database schema...');
    
    // Create all tables
    await db.execute(`
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

    console.log('✅ Database schema created successfully!');
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch(console.error); 