import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from public directory
app.use(express.static('public'));

// Handle client-side routing - send all non-API routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GIE Certificate System running on http://localhost:${PORT}`);
  console.log('📝 Static files served from /public directory');
  console.log('⚡ API functions available in development mode');
});