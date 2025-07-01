// Production static file serving fix
// This file patches the production static serving issue

const express = require('express');
const path = require('path');
const fs = require('fs');

function fixProductionStatic(app) {
  // Serve built frontend files from dist directory
  const distPath = path.resolve(__dirname, '..', 'dist');
  
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('✅ Serving static files from:', distPath);
  } else {
    console.warn('⚠️  dist directory not found:', distPath);
  }
  
  // Serve public assets (like logo.png)
  const publicPath = path.resolve(__dirname, '..', 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    console.log('✅ Serving public files from:', publicPath);
  }
  
  // SPA fallback - must be last
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    const indexPath = path.resolve(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not built - run npm run build');
    }
  });
}

module.exports = { fixProductionStatic };