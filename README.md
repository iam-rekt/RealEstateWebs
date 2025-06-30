# Haddadin Real Estate Website

A modern, professional real estate platform for the Jordan market with zero external dependencies.

## 🚀 Quick Deploy

**Ready for instant deployment to any hosting provider:**

### Deploy to Vercel (Recommended)
1. Push to GitHub repository
2. Import to Vercel
3. Set environment variable: `SESSION_SECRET=your-secret-key`
4. Deploy - your website will be live!

### Deploy to Railway/Render
1. Connect your GitHub repository
2. Set environment variable: `SESSION_SECRET=your-secret-key`
3. Deploy automatically

## ✨ Features

### Public Website
- **Property Listings**: 6 authentic Jordan properties (Abdoun, Sweifieh, Jabal Amman, etc.)
- **Advanced Search**: Filter by location, price, size, bedrooms, bathrooms, property type
- **Featured Properties**: Highlighted premium listings
- **Contact Forms**: Property inquiries, newsletter signup, property requests
- **Responsive Design**: Mobile-first, professional appearance
- **Zero Database Dependencies**: Everything runs in memory

### Admin Panel
- **Secure Login**: Access at `/admin-login` (username: admin, password: admin123)
- **Property Management**: Add, edit, delete properties with image uploads
- **Lead Management**: View all contact form submissions
- **Newsletter Management**: Track email subscriptions
- **Site Settings**: Customize contact info, social links, company details
- **Dashboard**: Complete real estate business management

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Storage**: In-memory (MemStorage) - no database required
- **Build**: Vite for frontend, ESBuild for backend
- **Deployment**: Serverless-ready, works on any provider

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 🌍 Environment Variables

Only one variable needed:
```
SESSION_SECRET=your-random-secret-key-here
```

## 📁 Project Structure

```
├── client/src/           # React frontend
├── server/              # Express backend
├── shared/              # Shared types and schemas
├── public/              # Static files
├── vercel.json          # Vercel deployment config
└── DEPLOYMENT.md        # Detailed deployment guide
```

## 🔐 Admin Access

- **URL**: `yourdomain.com/admin-login`
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change admin password in `server/storage.ts` before production deployment.

## 📊 Sample Data

Includes 6 professionally curated Jordan properties:
- Modern Apartment in Abdoun (120,000 JD)
- Luxury Villa in Sweifieh (250,000 JD) 
- Cozy Studio in Jabal Amman (45,000 JD)
- Penthouse in Dabouq (180,000 JD)
- Traditional House in Jebel Lweibdeh (85,000 JD)
- Modern Apartment in Shmeisani (95,000 JD)

## 🎯 Perfect For

- **Real Estate Agencies**: Complete property management
- **Property Developers**: Showcase new projects
- **Real Estate Agents**: Personal portfolio websites
- **Quick Deployment**: Zero-configuration hosting

## 📈 Scalability

- **Memory Storage**: Perfect for small to medium businesses
- **Easy Migration**: Can switch to database later if needed
- **Cost Effective**: No monthly database fees
- **Instant Setup**: Deploy in under 5 minutes

---

**Ready to launch your real estate business online!** 🏡