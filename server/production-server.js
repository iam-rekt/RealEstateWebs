// Production server for Render deployment
// This fixes the static file serving issue

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
async function startProductionServer() {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Import and register API routes
  const { registerRoutes } = await import('./routes.js');
  await registerRoutes(app);
  
  // Serve static files from dist (frontend build)
  const distPath = path.resolve(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('✅ Serving frontend from:', distPath);
  }
  
  // Serve public assets (logo, etc.)
  const publicPath = path.resolve(__dirname, '..', 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    console.log('✅ Serving assets from:', publicPath);
  }
  
  // SPA fallback for React Router
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    const indexFile = path.resolve(distPath, 'index.html');
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      res.status(500).send('Frontend not built. Run: npm run build');
    }
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  });
  
  // Start server
  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Production server running on port ${port}`);
    console.log(`📱 Admin panel: http://localhost:${port}/admin/login`);
  });
}

// Start the server
startProductionServer().catch(console.error);