import { defaultCatalog } from '../data/defaultCatalog';

const API_BASE = '/api';

// Local storage backup key for client-side persistence (e.g. Netlify static hosting)
const LOCAL_CATALOG_KEY = 'shadowplex_local_catalog';

function getLocalCatalog() {
  try {
    const saved = localStorage.getItem(LOCAL_CATALOG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Failed to parse local catalog', err);
  }
  return defaultCatalog;
}

function saveLocalCatalog(catalog) {
  try {
    localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(catalog));
  } catch (err) {
    console.warn('Failed to save to local catalog', err);
  }
}

export async function fetchMedia({ type, genre, search, featured, trending, sort, limit } = {}) {
  try {
    const params = new URLSearchParams();
    if (type && type !== 'all') params.append('type', type);
    if (genre && genre !== 'All') params.append('genre', genre);
    if (search) params.append('search', search);
    if (featured !== undefined) params.append('featured', featured);
    if (trending !== undefined) params.append('trending', trending);
    if (sort) params.append('sort', sort);
    if (limit) params.append('limit', limit);

    const res = await fetch(`${API_BASE}/media?${params.toString()}`);
    // If response is not JSON (e.g. 404 or index.html SPA fallback on Netlify static)
    const contentType = res.headers.get('content-type');
    if (!res.ok || !contentType || !contentType.includes('application/json')) {
      throw new Error('API unreachable or returned non-JSON, using local fallback');
    }
    return await res.json();
  } catch (err) {
    // Client-side fallback for Netlify & static deployments
    let catalog = getLocalCatalog();

    if (type && type !== 'all') {
      catalog = catalog.filter(item => item.type === type);
    }

    if (genre && genre !== 'All') {
      catalog = catalog.filter(item => 
        item.genres && item.genres.some(g => g.toLowerCase() === genre.toLowerCase())
      );
    }

    if (featured === 'true' || featured === true) {
      catalog = catalog.filter(item => item.featured);
    }

    if (trending === 'true' || trending === true) {
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
      catalog = catalog.filter(item => item.top10).sort((a, b) => (a.top10 || 99) - (b.top10 || 99));
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

    return catalog;
  }
}

export async function fetchMediaById(id) {
  try {
    const res = await fetch(`${API_BASE}/media/${id}`);
    const contentType = res.headers.get('content-type');
    if (!res.ok || !contentType || !contentType.includes('application/json')) {
      throw new Error('API unreachable, using local fallback');
    }
    return await res.json();
  } catch (err) {
    const catalog = getLocalCatalog();
    return catalog.find(m => m.id === id) || null;
  }
}

export async function recordView(id) {
  try {
    const res = await fetch(`${API_BASE}/media/${id}/view`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (err) {
    // Ignore error
  }
  const catalog = getLocalCatalog();
  const item = catalog.find(m => m.id === id);
  if (item) {
    item.views = (item.views || 0) + 1;
    saveLocalCatalog(catalog);
    return { views: item.views };
  }
}

export async function recordDownload(id) {
  try {
    const res = await fetch(`${API_BASE}/media/${id}/download`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (err) {
    // Ignore error
  }
  const catalog = getLocalCatalog();
  const item = catalog.find(m => m.id === id);
  if (item) {
    item.downloads = (item.downloads || 0) + 1;
    saveLocalCatalog(catalog);
    return { downloads: item.downloads };
  }
}

export async function createMedia(mediaData) {
  try {
    const res = await fetch(`${API_BASE}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mediaData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Ignore error and fall through
  }

  // Client-side fallback for Netlify
  const catalog = getLocalCatalog();
  const newItem = {
    ...mediaData,
    id: mediaData.id || `sp-${mediaData.type === 'series' ? 'ser' : 'mov'}-${Date.now().toString().slice(-4)}`,
    views: mediaData.views || 0,
    downloads: mediaData.downloads || 0,
    createdAt: new Date().toISOString()
  };
  catalog.unshift(newItem);
  saveLocalCatalog(catalog);
  return newItem;
}

export async function updateMedia(id, mediaData) {
  try {
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mediaData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fall through
  }

  const catalog = getLocalCatalog();
  const index = catalog.findIndex(m => m.id === id);
  if (index !== -1) {
    catalog[index] = { ...catalog[index], ...mediaData, id };
    saveLocalCatalog(catalog);
    return catalog[index];
  }
  throw new Error('Media not found');
}

export async function deleteMedia(id) {
  try {
    const res = await fetch(`${API_BASE}/media/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (err) {
    // Fall through
  }

  let catalog = getLocalCatalog();
  catalog = catalog.filter(m => m.id !== id);
  saveLocalCatalog(catalog);
  return { success: true, message: 'Deleted locally' };
}

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    // Fall through
  }

  const catalog = getLocalCatalog();
  const totalTitles = catalog.length;
  const totalMovies = catalog.filter(m => m.type === 'movie').length;
  const totalSeries = catalog.filter(m => m.type === 'series').length;
  const totalViews = catalog.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalDownloads = catalog.reduce((sum, item) => sum + (item.downloads || 0), 0);

  return {
    totalTitles,
    totalMovies,
    totalSeries,
    totalViews,
    totalDownloads,
    activeServers: 4,
    systemStatus: 'Operational',
    bandwidthServed: `${((totalDownloads * 3.2) / 1000).toFixed(1)} TB`
  };
}

export async function fetchGenres() {
  try {
    const res = await fetch(`${API_BASE}/genres`);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    // Fall through
  }

  const catalog = getLocalCatalog();
  const genreMap = {};
  catalog.forEach(item => {
    if (item.genres) {
      item.genres.forEach(g => {
        genreMap[g] = (genreMap[g] || 0) + 1;
      });
    }
  });

  return Object.keys(genreMap).map(name => ({
    name,
    count: genreMap[name]
  })).sort((a, b) => b.count - a.count);
}

export async function fetchPirateBayTorrents(query) {
  try {
    const res = await fetch(`${API_BASE}/piratebay?query=${encodeURIComponent(query)}`);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn('Backend TPB endpoint unreachable, trying direct fallback', err);
  }

  // Direct client-side fallback if backend route is unavailable (e.g. on Netlify static hosting)
  try {
    const clean = query.trim().replace(/[^\w\s]/gi, ' ');
    const res = await fetch(`https://apibay.org/q.php?q=${encodeURIComponent(clean)}&cat=200`);
    if (res.ok) {
      const raw = await res.json();
      if (Array.isArray(raw) && raw.length > 0 && raw[0].id !== '0') {
        return raw.slice(0, 15).map(item => {
          const magnet = `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce`;
          const b = parseInt(item.size, 10);
          const sizeStr = b >= 1073741824 ? (b / 1073741824).toFixed(2) + ' GB' : (b / 1048576).toFixed(1) + ' MB';
          const n = item.name.toUpperCase();
          const quality = (n.includes('2160P') || n.includes('4K') || n.includes('UHD')) ? '4K 2160p UHD' :
                          (n.includes('1080P') || n.includes('FHD') || n.includes('BLURAY')) ? '1080p Full HD' :
                          (n.includes('720P') || n.includes('HD')) ? '720p HD' : '1080p Web-DL';
          return {
            id: item.id,
            name: item.name,
            infoHash: item.info_hash,
            magnetUrl: magnet,
            size: sizeStr,
            seeders: parseInt(item.seeders, 10) || 0,
            leechers: parseInt(item.leechers, 10) || 0,
            quality,
            uploader: item.username || 'VIP',
            addedDate: item.added ? new Date(parseInt(item.added, 10) * 1000).toLocaleDateString() : 'Recent'
          };
        });
      }
    }
  } catch (e) {
    // Ignore error
  }

  return [];
}

