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

// 10. ThePirateBay+ (TPB+) Live Search & Magnet Generator
const tpbCache = new Map();

function formatSize(bytes) {
  const b = parseInt(bytes, 10);
  if (isNaN(b) || b <= 0) return '2.4 GB';
  if (b >= 1073741824) return (b / 1073741824).toFixed(2) + ' GB';
  if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
  return b + ' B';
}

function detectQuality(name) {
  const n = name.toUpperCase();
  if (n.includes('2160P') || n.includes('4K') || n.includes('UHD')) return '4K 2160p UHD';
  if (n.includes('1080P') || n.includes('FHD') || n.includes('BLURAY')) return '1080p Full HD';
  if (n.includes('720P') || n.includes('HD')) return '720p HD';
  if (n.includes('480P') || n.includes('HDRIP')) return '480p SD';
  return '1080p Web-DL';
}

app.get('/api/piratebay', async (req, res) => {
  try {
    const query = req.query.query || req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const cleanQuery = query.trim().replace(/[^\w\s]/gi, ' ');
    const cacheKey = cleanQuery.toLowerCase();

    if (tpbCache.has(cacheKey)) {
      const cached = tpbCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 1000 * 60 * 30) {
        return res.json(cached.data);
      }
    }

    const url = `https://apibay.org/q.php?q=${encodeURIComponent(cleanQuery)}&cat=200`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    let results = [];
    if (response.ok) {
      const raw = await response.json();
      if (Array.isArray(raw) && raw.length > 0 && raw[0].id !== '0') {
        results = raw.slice(0, 15).map(item => {
          const magnet = `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.bittor.pw%3A1337%2Fannounce`;
          return {
            id: item.id,
            name: item.name,
            infoHash: item.info_hash,
            magnetUrl: magnet,
            size: formatSize(item.size),
            seeders: parseInt(item.seeders, 10) || 0,
            leechers: parseInt(item.leechers, 10) || 0,
            quality: detectQuality(item.name),
            uploader: item.username || 'VIP',
            status: item.status || 'member',
            addedDate: item.added ? new Date(parseInt(item.added, 10) * 1000).toLocaleDateString() : 'Recent'
          };
        });
      }
    }

    tpbCache.set(cacheKey, { timestamp: Date.now(), data: results });
    res.json(results);
  } catch (err) {
    console.error('PirateBay API error:', err.message);
    res.status(500).json({ error: 'Failed to query ThePirateBay+', results: [] });
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

