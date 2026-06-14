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

// SPA fallback - serve index.html for all routes not found in static files
app.get('*', (req, res) => {
  const indexPath = join(__dirname, 'build', 'index.html');
  const filePath = join(__dirname, 'build', req.path);

  // Check if the file exists as a static asset
  if (fs.existsSync(filePath)) {
    if (fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }
    // If it's a directory, try index.html in that directory
    if (fs.statSync(filePath).isDirectory()) {
      const indexInDir = join(filePath, 'index.html');
      if (fs.existsSync(indexInDir)) {
        return res.sendFile(indexInDir);
      }
    }
  }

  // For all other routes, serve index.html (SPA fallback)
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
