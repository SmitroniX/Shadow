import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'catalog.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to read data
async function readCatalog() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading catalog:', err);
    return [];
  }
}

// Helper to write data
async function writeCatalog(catalog) {
  await fs.writeFile(DATA_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
}

// 1. Get media list with flexible query filters
app.get('/api/media', async (req, res) => {
  try {
    const { type, genre, search, featured, trending, sort, limit } = req.query;
    let catalog = await readCatalog();

    if (type && type !== 'all') {
      catalog = catalog.filter(item => item.type === type);
    }

    if (genre && genre !== 'All') {
      catalog = catalog.filter(item => 
        item.genres && item.genres.some(g => g.toLowerCase() === genre.toLowerCase())
      );
    }

    if (featured === 'true') {
      catalog = catalog.filter(item => item.featured);
    }

    if (trending === 'true') {
      catalog = catalog.filter(item => item.trending);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      catalog = catalog.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.synopsis && item.synopsis.toLowerCase().includes(q)) ||
        (item.cast && item.cast.some(c => c.toLowerCase().includes(q))) ||
        (item.director && item.director.toLowerCase().includes(q)) ||
        (item.genres && item.genres.some(g => g.toLowerCase().includes(q)))
      );
    }

    if (sort === 'top10') {
      catalog = catalog
        .filter(item => item.top10)
        .sort((a, b) => (a.top10 || 99) - (b.top10 || 99));
    } else if (sort === 'rating') {
      catalog.sort((a, b) => (b.imdb || 0) - (a.imdb || 0));
    } else if (sort === 'year') {
      catalog.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
    } else if (sort === 'popular') {
      catalog.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    if (limit) {
      catalog = catalog.slice(0, parseInt(limit, 10));
    }

    res.json(catalog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch media catalog' });
  }
});

// 2. Get single media details
app.get('/api/media/:id', async (req, res) => {
  try {
    const catalog = await readCatalog();
    const item = catalog.find(m => m.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve media item' });
  }
});

// 3. Admin: Add new media
app.post('/api/media', async (req, res) => {
  try {
    const catalog = await readCatalog();
    const newItem = {
      ...req.body,
      id: req.body.id || `sp-${req.body.type === 'series' ? 'ser' : 'mov'}-${Date.now().toString().slice(-4)}`,
      views: req.body.views || 0,
      downloads: req.body.downloads || 0,
      createdAt: new Date().toISOString()
    };

    catalog.unshift(newItem);
    await writeCatalog(catalog);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create media item' });
  }
});

// 4. Admin: Update media
app.put('/api/media/:id', async (req, res) => {
  try {
    let catalog = await readCatalog();
    const index = catalog.findIndex(m => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Media not found' });
    }
    catalog[index] = { ...catalog[index], ...req.body, id: req.params.id };
    await writeCatalog(catalog);
    res.json(catalog[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update media item' });
  }
});

// 5. Admin: Delete media
app.delete('/api/media/:id', async (req, res) => {
  try {
    let catalog = await readCatalog();
    const initialLength = catalog.length;
    catalog = catalog.filter(m => m.id !== req.params.id);
    if (catalog.length === initialLength) {
      return res.status(404).json({ error: 'Media not found' });
    }
    await writeCatalog(catalog);
    res.json({ success: true, message: 'Media item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media item' });
  }
});

// 6. Track view
app.post('/api/media/:id/view', async (req, res) => {
  try {
    const catalog = await readCatalog();
    const item = catalog.find(m => m.id === req.params.id);
    if (item) {
      item.views = (item.views || 0) + 1;
      await writeCatalog(catalog);
      return res.json({ views: item.views });
    }
    res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// 7. Track download
app.post('/api/media/:id/download', async (req, res) => {
  try {
    const catalog = await readCatalog();
    const item = catalog.find(m => m.id === req.params.id);
    if (item) {
      item.downloads = (item.downloads || 0) + 1;
      await writeCatalog(catalog);
      return res.json({ downloads: item.downloads });
    }
    res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record download' });
  }
});

// 8. Stats summary for admin and platform
app.get('/api/stats', async (req, res) => {
  try {
    const catalog = await readCatalog();
    const totalTitles = catalog.length;
    const totalMovies = catalog.filter(m => m.type === 'movie').length;
    const totalSeries = catalog.filter(m => m.type === 'series').length;
    const totalViews = catalog.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalDownloads = catalog.reduce((sum, item) => sum + (item.downloads || 0), 0);

    res.json({
      totalTitles,
      totalMovies,
      totalSeries,
      totalViews,
      totalDownloads,
      activeServers: 4,
      systemStatus: 'Operational',
      bandwidthServed: `${((totalDownloads * 3.2) / 1000).toFixed(1)} TB`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// 9. All unique genres with count
app.get('/api/genres', async (req, res) => {
  try {
    const catalog = await readCatalog();
    const genreMap = {};
    catalog.forEach(item => {
      if (item.genres) {
        item.genres.forEach(g => {
          genreMap[g] = (genreMap[g] || 0) + 1;
        });
      }
    });

    const genres = Object.keys(genreMap).map(name => ({
      name,
      count: genreMap[name]
    })).sort((a, b) => b.count - a.count);

    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

// Serve frontend build static files if available
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ShadowPlex Core API running on http://0.0.0.0:${PORT}`);
});

