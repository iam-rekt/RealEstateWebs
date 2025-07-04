# شركة رند للاستثمار العقاري و تطويره
# Rand Company for Real Estate Investment and Development

A comprehensive Arabic real estate platform specializing in land properties across Jordan, featuring advanced search capabilities, location management, and administrative tools.

## 🌟 Features

### Public Features
- **Land Property Listings**: Browse residential, commercial, agricultural, and industrial land
- **Advanced Search Filters**: Search by price, size, location, governorate, and directorate
- **Jordan-Specific Locations**: Complete governorate and directorate database
- **Contact Forms**: Property inquiries, entrustment requests, and general contact
- **Newsletter Subscription**: Stay updated with latest properties
- **Property Request System**: Submit specific land requirements
- **Responsive Arabic Interface**: Complete RTL support optimized for Arabic users

### Admin Features
- **Property Management**: Add, edit, delete, and feature properties
- **Lead Management**: View and manage all customer inquiries
- **Location Management**: Manage Jordan governorates and directorates
- **Image Upload**: Property photo management with optimization
- **Analytics Dashboard**: Property and contact statistics
- **Site Settings**: Configure website content and preferences

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- No external database required (uses in-memory storage)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd rand-real-estate

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 📋 Default Admin Credentials

**Default Login:**
- **Username**: `admin`
- **Password**: `admin123`

### Changing Admin Credentials

#### Method 1: Through Code (Recommended for Deployment)
1. Open `server/storage.ts`
2. Find the `initializeAdmin()` method (around line 125)
3. Update the admin object:
```typescript
const admin: Admin = {
  id: 1,
  username: "your-new-username",
  email: "admin@yourcompany.com",
  passwordHash: await bcrypt.hash("your-new-password", 10),
  createdAt: new Date(),
};
```
4. Restart the application

#### Method 2: Environment Variables (Production Recommended)
1. Create a `.env` file in the root directory:
```bash
ADMIN_USERNAME=your-new-username
ADMIN_PASSWORD=your-new-password
ADMIN_EMAIL=admin@yourcompany.com
```

2. Update `server/storage.ts` to use environment variables:
```typescript
const admin: Admin = {
  id: 1,
  username: process.env.ADMIN_USERNAME || "admin",
  email: process.env.ADMIN_EMAIL || "admin@company.com",
  passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10),
  createdAt: new Date(),
};
```

## 🎯 User Guide

### For Website Visitors

#### Browsing Properties
1. **Homepage**: View featured properties and use quick search
2. **Advanced Search**: Click "خيارات بحث متقدمة+" for detailed filters
3. **Properties Page**: Browse all available land properties
4. **Property Details**: Click any property to view full details

#### Location-Based Search
- **Governorate (المحافظة)**: Select from 12 Jordan governorates
- **Directorate (المديرية)**: Choose specific directorates within governorates
- **Additional Filters**: Village, basin, neighborhood, plot number

#### Contact and Inquiries
- **Contact Form**: General inquiries and questions
- **Property Request**: Submit specific land requirements
- **Entrustment**: Property owners can list their land
- **Newsletter**: Subscribe for property updates

### For Administrators

#### Accessing Admin Panel
1. Navigate to `/admin/login`
2. Enter credentials (default: admin/admin123)
3. Access full admin dashboard at `/admin`

#### Managing Properties
1. **Add Property**: Click "إضافة عقار جديد"
   - Fill property details
   - Upload property image
   - Set pricing and features
   - Mark as featured if desired

2. **Edit Property**: Click edit icon on any property
   - Update any property information
   - Change images or status

3. **Delete Property**: Click delete icon (permanent action)

#### Managing Locations
1. **Governorates Tab**: Add/edit Jordan governorates
   - Arabic and English names
   - Used for property location filtering

2. **Directorates Tab**: Manage directorates within governorates
   - Link to parent governorate
   - Arabic and English names

#### Viewing Leads
- **Contacts**: Customer inquiries and messages
- **Newsletter**: Email subscription list
- **Entrustments**: Property listing requests
- **Property Requests**: Specific land requirements

## 🔧 Configuration

### Company Information
Update company details in multiple files:

1. **Header Component** (`client/src/components/header.tsx`):
```typescript
const tagline = settings.footer_tagline || "الأراضي في الأردن";
```

2. **Footer Component** (`client/src/components/footer.tsx`):
```typescript
// Update company contact information
// Address, phone numbers, business hours
```

3. **Homepage** (`client/src/pages/home.tsx`):
```typescript
// Update company name and descriptions
```

### Adding New Locations
1. Access admin panel (`/admin`)
2. Go to "المواقع" (Locations) tab
3. Add governorates first, then directorates
4. New locations automatically appear in search filters

### Site Settings
1. Admin panel → "الإعدادات" tab
2. Configure:
   - Footer tagline
   - Contact information
   - Business descriptions

## 📁 Project Structure

```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions
│   │   └── hooks/          # Custom React hooks
│   └── index.html          # Main HTML template
├── server/                 # Backend Express server
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data storage layer
│   └── upload.ts          # File upload handling
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── public/                # Static assets
│   ├── logo.png           # Company logo
│   └── uploads/           # Uploaded property images
└── package.json           # Dependencies and scripts
```

## 🔒 Security Features

### Authentication
- **Session-based**: Secure admin sessions
- **Password Hashing**: bcrypt encryption
- **Route Protection**: Admin-only endpoints secured

### Data Validation
- **Zod Schemas**: Input validation on all forms
- **File Upload**: Image processing and validation
- **XSS Protection**: Input sanitization

### Production Security Checklist
- [ ] Change default admin credentials
- [ ] Set strong SESSION_SECRET environment variable
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Set up rate limiting for APIs

## 🚀 Deployment

### Environment Variables
```bash
# Required for production
SESSION_SECRET=your-super-secure-random-string-here

# Optional admin credentials
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
ADMIN_EMAIL=admin@yourcompany.com

# Optional database (for future use)
DATABASE_URL=postgresql://...
```

### Recommended Platforms
1. **Render** (Primary): Perfect for Express applications
2. **Railway**: Alternative full-stack hosting
3. **Traditional VPS**: Any Linux server with Node.js

### Deployment Steps
1. Set environment variables on hosting platform
2. Update admin credentials (see section above)
3. Deploy using platform-specific instructions
4. Verify all functionality after deployment

## 📞 Support and Maintenance

### Common Tasks
- **Add Properties**: Regular content updates through admin panel
- **Monitor Inquiries**: Check admin panel for new leads
- **Update Locations**: Add new areas as business expands
- **Backup Data**: Export data before major changes

### Troubleshooting
- **Admin Login Issues**: Verify credentials in storage.ts
- **Image Upload Problems**: Check public/uploads permissions
- **Search Not Working**: Verify API endpoints are responding
- **Arabic Display Issues**: Ensure proper RTL CSS is applied

### Technical Support
For technical issues or customization requests, refer to the codebase documentation or contact the development team.

## 📄 License and Credits

- **Company**: شركة رند للاستثمار العقاري و تطويره
- **Technology Stack**: React, TypeScript, Express.js, Node.js
- **UI Framework**: Tailwind CSS with Radix UI components
- **Icons**: Lucide React icons
- **Images**: Unsplash stock photos (replace with actual property photos)

---

**Last Updated**: July 2025  
**Version**: 1.0.0  
**Contact**: For questions about this documentation, contact the development team.