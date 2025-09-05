import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');
const PORT = process.env.PORT || 5000;

// MIME types mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Function to parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const cleanUrl = parsedUrl.pathname;
  
  // Handle API requests by importing and executing the Vercel functions
  if (cleanUrl.startsWith('/api/')) {
    try {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Parse request body for POST requests
      if (req.method === 'POST') {
        req.body = await parseBody(req);
      }

      // Add Express-like methods to response object
      res.status = (code) => {
        res.statusCode = code;
        return {
          json: (data) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
            return res; // Return response object for chaining
          },
          end: (data) => {
            res.writeHead(code);
            res.end(data);
            return res; // Return response object for chaining
          }
        };
      };
      
      // Add json method directly to response
      res.json = (data) => {
        res.writeHead(res.statusCode || 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return res;
      };

      let handler;
      // Route to appropriate API function with error handling
      try {
        if (cleanUrl === '/api/certificates') {
          const module = await import('../api/certificates/index.js');
          handler = module.default;
        } else if (cleanUrl.startsWith('/api/certificates/lookup/')) {
          const number = cleanUrl.split('/').pop();
          req.query = { number };
          const module = await import('../api/certificates/lookup/[number].js');
          handler = module.default;
        } else if (cleanUrl === '/api/auth/login') {
          const module = await import('../api/auth/login.js');
          handler = module.default;
        } else if (cleanUrl === '/api/setup/database') {
          const module = await import('../api/setup/database.js');
          handler = module.default;
        } else if (cleanUrl.startsWith('/api/lookup')) {
          // Parse query parameters for lookup endpoint
          req.query = parsedUrl.query;
          const module = await import('../api/lookup.js');
          handler = module.default;
        }
      } catch (importError) {
        console.error('Import error:', importError);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API module load error', details: importError.message }));
        return;
      }

      if (handler) {
        await handler(req, res);
        return;
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
        return;
      }
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
      return;
    }
  }
  
  // Handle static files
  let filePath = path.join(publicDir, cleanUrl === '/' ? 'index.html' : cleanUrl);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, serve index.html for client-side routing
      filePath = path.join(publicDir, 'index.html');
    }
    
    // Get file extension and content type
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - File Not Found');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 - Internal Server Error');
        }
      } else {
        const headers = { 'Content-Type': contentType };
        
        // Add CSP headers for HTML files to allow JavaScript execution
        if (extname === '.html') {
          headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'";
        }
        
        res.writeHead(200, headers);
        res.end(content, 'utf-8');
      }
    });
  });
});

// Start server and ensure it opens the port immediately
server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`🚀 GIE Certificate System running on http://localhost:${PORT}`);
  console.log('📝 Static files served from /public directory');
  console.log('⚡ This is a Vercel serverless app running in local development mode');
  console.log('💡 For full API functionality, deploy to Vercel or use Vercel CLI');
  
  // Test that the server is actually listening
  setTimeout(() => {
    console.log('✅ Server startup completed successfully');
  }, 1000);
});
