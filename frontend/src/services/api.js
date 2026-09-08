const API_BASE = '/api';

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
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching media:', err);
    return [];
  }
}

export async function fetchMediaById(id) {
  try {
    const res = await fetch(`${API_BASE}/media/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Error fetching media ${id}:`, err);
    return null;
  }
}

export async function recordView(id) {
  try {
    const res = await fetch(`${API_BASE}/media/${id}/view`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    console.error('Error recording view:', err);
  }
}

export async function recordDownload(id) {
  try {
    const res = await fetch(`${API_BASE}/media/${id}/download`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    console.error('Error recording download:', err);
  }
}

export async function createMedia(mediaData) {
  const res = await fetch(`${API_BASE}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mediaData),
  });
  if (!res.ok) throw new Error('Failed to create media');
  return await res.json();
}

export async function updateMedia(id, mediaData) {
  const res = await fetch(`${API_BASE}/media/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mediaData),
  });
  if (!res.ok) throw new Error('Failed to update media');
  return await res.json();
}

export async function deleteMedia(id) {
  const res = await fetch(`${API_BASE}/media/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete media');
  return await res.json();
}

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (err) {
    return {
      totalTitles: 0,
      totalMovies: 0,
      totalSeries: 0,
      totalViews: 0,
      totalDownloads: 0,
      activeServers: 4,
      systemStatus: 'Operational',
      bandwidthServed: '0 TB'
    };
  }
}

export async function fetchGenres() {
  try {
    const res = await fetch(`${API_BASE}/genres`);
    if (!res.ok) throw new Error('Failed to fetch genres');
    return await res.json();
  } catch (err) {
    return [];
  }
}
