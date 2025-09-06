import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Single middleware to handle all requests without using Express routing
app.use(async (req, res, next) => {
  const pathname = req.path;
  
  // Handle API requests first
  if (pathname.startsWith('/api/')) {
    console.log(`API Request: ${req.method} ${pathname}`);
    
    try {
      let handled = false;
      
      if (pathname === '/api/certificates') {
        const handler = await import('./api/certificates/index.js');
        await handler.default(req, res);
        handled = true;
      } else if (pathname.startsWith('/api/certificates/lookup/')) {
        const number = pathname.split('/').pop();
        req.query = { ...req.query, number };
        const handler = await import('./api/certificates/lookup/[number].js');
        await handler.default(req, res);
        handled = true;
      } else if (pathname === '/api/lookup') {
        const handler = await import('./api/lookup.js');
        await handler.default(req, res);
        handled = true;
      } else if (pathname === '/api/auth/login') {
        const handler = await import('./api/auth/login.js');
        await handler.default(req, res);
        handled = true;
      } else if (pathname === '/api/setup/database') {
        const handler = await import('./api/setup/database.js');
        await handler.default(req, res);
        handled = true;
      }
      
      if (!handled) {
        console.log(`API endpoint not found: ${pathname}`);
        return res.status(404).json({ 
          error: 'API endpoint not found',
          endpoint: pathname,
          availableEndpoints: ['/api/lookup', '/api/certificates', '/api/auth/login', '/api/setup/database']
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      console.error('Stack:', error.stack);
      return res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message,
        endpoint: pathname 
      });
    }
    return; // Important: stop processing here for API requests
  }
  
  // Handle static files
  const publicDir = path.join(__dirname, 'public');
  
  if (pathname === '/') {
    return res.sendFile(path.join(publicDir, 'index.html'));
  }
  
  // Try to serve static file
  const filePath = path.join(publicDir, pathname);
  try {
    const fs = await import('fs');
    await fs.promises.access(filePath);
    return res.sendFile(filePath);
  } catch {
    // File doesn't exist, serve index.html for client-side routing
    return res.sendFile(path.join(publicDir, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GIE Certificate System running on http://localhost:${PORT}`);
  console.log('📝 Static files served from /public directory');
  console.log('⚡ API functions available in development mode');
  console.log('✅ Express server started successfully');
});
