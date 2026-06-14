import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from build directory with cache control
app.use(express.static(join(__dirname, 'build'), {
  maxAge: '1h',
  etag: false
}));

// SPA fallback - only for actual page routes (not /api/*, /__data.json, or missing files)
app.get('*', (req, res) => {
  const indexPath = join(__dirname, 'build', 'index.html');

  // Don't fallback for SvelteKit internal endpoints or API routes
  if (req.path.startsWith('/__') || req.path.startsWith('/api/')) {
    return res.status(404).send('Not Found');
  }

  // Check if the file exists as a static asset
  const filePath = join(__dirname, 'build', req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  // Otherwise serve index.html for SPA routing
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
