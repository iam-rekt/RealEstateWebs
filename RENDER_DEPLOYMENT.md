# Render Deployment Guide

## Quick Deploy to Render

### Step 1: Push to GitHub
1. Push your code to a GitHub repository
2. Make sure all files are committed

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click "Create Web Service"

### Step 3: Access Your Site
- Your site will be live at: `https://[your-service-name].onrender.com`
- Admin panel: `https://[your-service-name].onrender.com/admin/login`
- Admin credentials: username `admin`, password `admin123`

## What render.yaml Does
- **Builds your app**: Runs `npm run build` to create production files
- **Starts server**: Runs `node server/production-server.js` (custom production server)
- **Generates SESSION_SECRET**: Automatically creates a secure session secret
- **Free hosting**: Uses Render's free tier
- **Fixed static serving**: Custom server properly serves frontend and assets

## Admin Panel Features
✅ **Login persists** - Sessions work properly on Render
✅ **Data stays saved** - In-memory storage works correctly  
✅ **Add/edit properties** - Full CRUD operations available
✅ **Image uploads** - File handling works properly
✅ **Contact management** - All forms and data accessible

## Environment Variables
Render automatically sets:
- `NODE_ENV=production`
- `SESSION_SECRET=[auto-generated secure string]`

## Troubleshooting
- **Build fails**: Check that `npm run build` works locally
- **Site won't load**: Check the Render logs for errors
- **Admin login issues**: Verify SESSION_SECRET is set in Render dashboard

Your real estate website will be fully functional on Render with working admin panel!