# Deployment Guide for Haddadin Real Estate Website

## Vercel Deployment

### 1. Database Options

**Option A: Vercel Postgres (Recommended)**
- Vercel provides managed PostgreSQL through partnerships
- Easy integration with your Vercel app
- Automatic scaling and backups
- Cost: Pay-per-use pricing

**Option B: External PostgreSQL Providers**
- **Neon** (recommended): Serverless PostgreSQL with generous free tier
- **Supabase**: PostgreSQL with additional features
- **Railway**: Simple PostgreSQL hosting
- **ElephantSQL**: Dedicated PostgreSQL hosting

### 2. Deployment Steps

#### Step 1: Prepare Your Repository
1. Push your code to GitHub/GitLab/Bitbucket
2. Ensure `vercel.json` and `.env.example` are included

#### Step 2: Set Up Database
**For Neon (Recommended):**
1. Go to [neon.tech](https://neon.tech) and create account
2. Create a new project
3. Copy the connection string (DATABASE_URL)

**For Vercel Postgres:**
1. In your Vercel dashboard, go to Storage tab
2. Create a Postgres database
3. Copy the connection string

#### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project" and import your repository
3. Configure these environment variables:
   ```
   DATABASE_URL=your-postgres-connection-string
   NODE_ENV=production
   SESSION_SECRET=generate-a-secure-random-string
   ```

#### Step 4: Initialize Database
After deployment:
1. Go to your Vercel project settings
2. Find the deployment URL
3. Run database migration by visiting: `your-app-url/api/admin/init` (if you create this endpoint)
4. Or use Vercel CLI: `vercel env pull` then `npm run db:push`

### 3. Environment Variables Setup

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
DATABASE_URL=postgresql://username:password@hostname/database
NODE_ENV=production
SESSION_SECRET=your-super-secure-random-string-here
```

### 4. Build Configuration

The `vercel.json` file is already configured for:
- Frontend build using Vite
- Backend serverless functions
- Static file serving
- API routing

### 5. File Upload Considerations

**Current Setup:** Files are stored locally in `/public/uploads`
**For Production:** Consider using:
- Vercel Blob Storage
- Cloudinary
- AWS S3
- Any cloud storage provider

### 6. Domain Configuration

1. In Vercel dashboard, go to your project
2. Settings → Domains
3. Add your custom domain (optional)

### 7. Monitoring and Logs

- Vercel provides automatic monitoring
- View logs in Vercel dashboard → Functions tab
- Monitor database performance in your database provider

## Alternative Platforms

### Railway
- Supports PostgreSQL addon
- Simple deployment process
- Good for full-stack apps

### Render
- Free tier available
- Built-in PostgreSQL
- Easy GitHub integration

### Netlify + External Database
- Frontend hosting on Netlify
- Backend functions
- External database required

## Database Costs

**Neon (Recommended for small to medium sites):**
- Free tier: 0.5 GB storage, 1 database
- Pro: $19/month for more resources

**Vercel Postgres:**
- Hobby: $20/month
- Pro: $90/month

**Supabase:**
- Free tier: 500 MB database
- Pro: $25/month

## Next Steps After Deployment

1. Test all functionality on production
2. Set up monitoring and error tracking
3. Configure backup strategy
4. Set up SSL certificate (automatic with Vercel)
5. Configure custom domain if needed