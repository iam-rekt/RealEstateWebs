# Haddadin Real Estate Website

## Overview

This is a modern full-stack real estate website built for Haddadin Real Estate, featuring property listings, search functionality, and administrative capabilities. The application is designed as a demo-ready platform with in-memory storage for simplified deployment.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **Styling**: Tailwind CSS with custom animations and responsive design
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: In-memory storage (no external database required)
- **ORM**: Drizzle ORM configured for potential PostgreSQL migration
- **Authentication**: Express sessions with memory store for admin panel
- **File Upload**: Multer with Sharp for image processing

### Build System
- **Bundler**: Vite for frontend development and building
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development**: Hot module replacement and runtime error overlay

## Key Components

### Property Management System
- CRUD operations for properties with image upload
- Featured properties functionality
- Property search with multiple filters (price, size, type, location)
- Property detail pages with related property suggestions

### Contact & Lead Management
- Contact form submissions
- Newsletter subscription system
- Property entrustment requests (for sellers)
- Custom property requests (for buyers)

### Admin Panel
- Secure admin authentication
- Property management interface
- Lead and inquiry management
- Site settings configuration
- Dashboard with analytics overview

### User Interface
- Responsive design optimized for mobile and desktop
- Modern animations and hover effects
- Accessible components following ARIA guidelines
- Progressive enhancement approach

## Data Flow

### Property Search Flow
1. User applies search filters on homepage or properties page
2. Frontend sends POST request to `/api/properties/search`
3. Backend processes filters and returns matching properties
4. Results displayed in grid or list view with sorting options

### Admin Management Flow
1. Admin logs in through `/admin/login` with session-based authentication
2. Admin panel provides CRUD interfaces for all data entities
3. Image uploads processed through Sharp for optimization
4. All changes reflected immediately due to in-memory storage

### Contact Submission Flow
1. Forms validate input using Zod schemas
2. Data submitted to respective API endpoints
3. Success/error feedback provided via toast notifications
4. Admin can view all submissions in admin panel

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection (configured but not required)
- **@radix-ui/***: Comprehensive UI component primitives
- **@tanstack/react-query**: Server state management
- **bcryptjs**: Password hashing for admin authentication
- **express-session**: Session management
- **multer & sharp**: File upload and image processing

### Development Dependencies
- **Vite**: Development server and build tool
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Simplified No-Database Deployment
The application uses in-memory storage making deployment extremely simple:
- **Zero external dependencies** - no database setup required
- **Instant deployment** - works on any hosting provider
- **No monthly costs** - no database subscriptions needed
- **Fresh data on restart** - perfect for demos

### Recommended Platforms
1. **Vercel** (Primary recommendation)
   - Git integration with automatic deployments
   - Only requires `SESSION_SECRET` environment variable
   - Optimized for React applications

2. **Alternative Platforms**
   - Railway, Netlify, traditional hosting
   - All work with the no-database architecture

### Environment Configuration
Required environment variables:
```
SESSION_SECRET=your-super-secure-random-string-here
```

Optional (for future database integration):
```
DATABASE_URL=postgresql://... (for Postgres migration)
```

## Changelog

```
Changelog:
- June 30, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```