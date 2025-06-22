# Pin-point Real Estate Application

## Overview

This is a modern real estate application built for the Athens market, specifically serving Alimos (Athens - South). The application provides property listings, search functionality, and contact management features for both buyers and property owners.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Custom design system built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js RESTful API
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **Development**: Hot reload with Vite middleware integration

### Database Design
The application uses a PostgreSQL database with the following main entities:
- **Properties**: Core property listings with details like price, size, location, and amenities
- **Contacts**: Customer inquiries and contact form submissions
- **Newsletters**: Email subscription management
- **Entrustments**: Property listing requests from owners
- **Property Requests**: Buyer requirements and search criteria

## Key Components

### Property Management
- Property listing with comprehensive search and filtering
- Featured properties showcase
- Detailed property views with image galleries
- Property type categorization (apartment, house, villa, studio)

### User Interaction
- Advanced search filters (price, size, location, property type)
- Contact forms for inquiries
- Newsletter subscription system
- Property entrustment forms for owners
- Property request forms for buyers

### UI Components
- Responsive design with mobile-first approach
- Modern component library with consistent styling
- Toast notifications for user feedback
- Form validation with Zod schemas
- Loading states and error handling

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **Server Processing**: Express routes handle requests and validate data
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Response Handling**: Data flows back through the same path with proper error handling

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation

### UI Libraries
- **@radix-ui**: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: CSS class variant management

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- Replit with Node.js 20 runtime
- PostgreSQL 16 database provisioning
- Hot reload development server on port 5000

### Production Build
- Vite builds the client-side React application
- esbuild bundles the server-side Express application
- Static files served from dist/public directory

### Environment Configuration
- Database connection via DATABASE_URL environment variable
- Autoscale deployment target for production
- Port configuration for external access

## Changelog

```
Changelog:
- June 22, 2025. Initial setup
- June 22, 2025. Enhanced typography and professional design
  * Improved all titles with consistent extrabold fonts and tight tracking
  * Upgraded statistics section with larger, more prominent fonts
  * Enhanced Featured Properties section with professional styling
  * Standardized property card typography for better readability
  * Removed floating stars from hero section for professional appearance
  * Added elegant glass effect for search filters with enhanced blur
  * Implemented consistent font weights and spacing throughout
- June 22, 2025. Implemented blue theme and enhanced header
  * Converted color scheme from purple to professional blue theme
  * Updated search filter background with blue-tinted glass effect
  * Enhanced header with backdrop blur and blue accents
  * Improved navigation with hover effects and active states
  * Added consistent blue gradient backgrounds throughout
  * Updated mobile menu with modern styling and blue theme
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```