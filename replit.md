# Pin-point Real Estate Application

## Overview

This is a modern real estate application built for the Jordan market, specifically serving Amman and surrounding areas. The application provides property listings, search functionality, and contact management features for both buyers and property owners.

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
- June 22, 2025. Fixed visual issues and completed modern design
  * Removed wavy SVG decorative elements for cleaner fullscreen appearance
  * Redesigned header with fixed positioning and elegant typography
  * Created modern search card design with clean shadows and hover effects
  * Implemented sophisticated input field styling with consistent appearance
  * Added proper padding to accommodate fixed header layout
  * Enhanced overall visual hierarchy and professional aesthetics
- June 22, 2025. Added property category tabs and regions functionality
  * Implemented 5 main tabs: Properties, Land, Buy, Renting, and Regions
  * Added filtering system for property categories (land plots, for sale, for rent)
  * Created Athens regions filter with 21 major areas (Alimos, Glyfada, Kifisia, etc.)
  * Updated blue theme to lighter shade for better accessibility
  * Enhanced tab interface with icons and active states
  * Added property count display for region filtering
  * Implemented responsive grid layout for all property categories
- June 22, 2025. Complete branding update and elegant interface redesign
  * Replaced search filter component with sophisticated tabbed interface system
  * Created modern filter bar with Property Type, Price Range, Bedrooms, Location dropdowns
  * Updated all branding from "Pin-point" to "Tariq Haddadin" throughout application
  * Added elegant "Haddadin" logo with gradient styling in header and hero section
  * Removed "Find Your Perfect Property" and "Browse Properties" text as requested
  * Enhanced tabs: All Properties, Featured, For Sale, For Rent, By Region
  * Implemented glass morphism effects with backdrop blur and rounded corners
  * Added real-time property count display and clear filters functionality
  * Created empty states with relevant icons for better user experience
- June 22, 2025. Completed location change from Athens to Jordan and repositioned statistics
  * Updated all location references from Athens, Greece to Amman, Jordan
  * Changed phone numbers from Greek (+30) to Jordanian (+962) format
  * Updated About section to reference Amman metropolitan area
  * Moved statistics section (500+ properties, 1200+ clients, 15+ years, 98% success) to bottom of page
  * Updated header tagline from "Athens • Premium Properties" to "Amman • Premium Properties"
  * Maintained all Jordan area filtering functionality (Abdoun, Sweifieh, etc.)
- June 22, 2025. Enhanced design with lighter blue theme and features section
  * Updated entire color scheme to lighter blue (sky-400/sky-500) for more elegant appearance
  * Added "Why Choose Haddadin Real Estate" features section above explore properties
  * Created three feature cards: Advanced Search, Expert Guidance, and Proven Success
  * Made explore properties section more compact and clean with improved styling
  * Updated all filter dropdowns with smaller, cleaner design and sky blue accents
  * Enhanced tab styling with lighter blue gradients and better spacing
  * Improved filter results badge and clear filters button with consistent theming
  * Fixed tab container sizing issue - increased padding so buttons fit properly within container
  * Replaced all "Haddadin" text branding with hadprp.png logo throughout the website
  * Updated hero section and search card to display logo images instead of text
  * Removed "Why Choose Haddadin Real Estate" features section as requested
  * Fixed logo display issues by using proper import statements instead of direct file paths
  * Optimized tab button sizing with smaller text and icons to fit perfectly in container
  * Increased logo sizes in home page - hero section logo to h-32 and search card logo to h-24 for better design proportion
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```