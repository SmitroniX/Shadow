import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Eye, 
  Download, 
  Film, 
  Tv, 
  Server, 
  Activity, 
  Save, 
  Sparkles,
  HardDrive,
  Database
} from 'lucide-react';
import { fetchStats, createMedia, deleteMedia } from '../services/api';

export default function AdminPanelModal({ 
  isOpen, 
  onClose, 
  mediaList = [], 
  onMediaUpdated 
}) {
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalMovies: 0,
    totalSeries: 0,
    totalViews: 0,
    totalDownloads: 0,
    bandwidthServed: '0 TB'
  });
  const [viewTab, setViewTab] = useState('list'); // 'list' or 'add'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Add Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie',
    tagline: '',
    synopsis: '',
    releaseYear: 2025,
    rating: 'PG-13',
    imdb: 8.5,
    duration: '2h 15m',
    genres: 'Sci-Fi, Action',
    director: '',
    cast: '',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    download4kUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    download1080pUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  });

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    const data = await fetchStats();
    setStats(data);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const genresArray = formData.genres.split(',').map(g => g.trim()).filter(Boolean);
      const castArray = formData.cast.split(',').map(c => c.trim()).filter(Boolean);

      const newItem = {
        title: formData.title,
        type: formData.type,
        tagline: formData.tagline,
        synopsis: formData.synopsis,
        releaseYear: parseInt(formData.releaseYear, 10),
        rating: formData.rating,
        imdb: parseFloat(formData.imdb),
        duration: formData.duration,
        genres: genresArray,
        director: formData.director,
        cast: castArray,
        poster: formData.poster,
        backdrop: formData.backdrop,
        featured: false,
        trending: true,
        streamSources: [
          { server: 'ShadowStream VIP (4K)', url: formData.streamUrl, quality: '4K Ultra HD' },
          { server: 'Cloud CDN Fast (1080p)', url: formData.streamUrl, quality: '1080p FHD' }
        ],
        downloadLinks: [
          { quality: '4K 2160p HDR', size: '12.4 GB', codec: 'x265 10-bit', server: 'ShadowPlex HighSpeed #1', url: formData.download4kUrl },
          { quality: '1080p Full HD', size: '3.6 GB', codec: 'H.264 Bluray', server: 'Fast Cloud Mirror #2', url: formData.download1080pUrl },
          { quality: '720p HD', size: '1.2 GB', codec: 'x264 Web-DL', server: 'Mega Server #3', url: formData.download1080pUrl }
        ]
      };

      if (formData.type === 'series') {
        newItem.seasons = [
          {
            seasonNumber: 1,
            title: 'Season 1',
            episodesCount: 2,
            batchDownload: {
              size: '4.8 GB',
              quality: '1080p Complete Season',
              url: formData.streamUrl
            },
            episodes: [
              {
                episodeNumber: 1,
                title: 'Episode 1: Pilot',
                duration: '50m',
                overview: 'The beginning of the thrilling journey.',
                thumbnail: formData.backdrop,
                streamUrl: formData.streamUrl,
                downloadUrl: formData.streamUrl,
                size: '1.4 GB'
              },
              {
                episodeNumber: 2,
                title: 'Episode 2: The Horizon',
                duration: '54m',
                overview: 'The investigation deepens as consequences unfold.',
                thumbnail: formData.backdrop,
                streamUrl: formData.streamUrl,
                downloadUrl: formData.streamUrl,
                size: '1.5 GB'
              }
            ]
          }
        ];
      }

      await createMedia(newItem);
      setMessage('New title added successfully to ShadowPlex catalog!');
      setLoading(false);
      setViewTab('list');
      if (onMediaUpdated) onMediaUpdated();
      loadStats();
    } catch (err) {
      console.error(err);
      setMessage('Error adding title: ' + err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMedia(id);
        if (onMediaUpdated) onMediaUpdated();
        loadStats();
      } catch (err) {
        alert('Failed to delete media item: ' + err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      
      {/* Container */}
      <div className="relative w-full max-w-5xl bg-[#0d0e17] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#11121d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ShadowPlex Admin CMS & Operations
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  v2.5 Pro
                </span>
              </h2>
              <p className="text-xs text-gray-400">Manage stream sources, download mirrors, and catalog entries</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-[#0a0b12] border-b border-white/5">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Catalog Titles</span>
              <Database className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white mt-1">{stats.totalTitles || mediaList.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Movies / Series</span>
              <Film className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-white mt-1">
              {stats.totalMovies || 0} / {stats.totalSeries || 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Total Streams</span>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {(stats.totalViews || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Downloads</span>
              <Download className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <div className="text-lg font-bold text-yellow-400 mt-1">
              {(stats.totalDownloads || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Bandwidth</span>
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white mt-1">{stats.bandwidthServed || '0 TB'}</div>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-white/10 bg-[#0f101c]">
          <button
            onClick={() => setViewTab('list')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewTab === 'list'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Manage Catalog ({mediaList.length})
          </button>

          <button
            onClick={() => setViewTab('add')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewTab === 'add'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Movie / Series</span>
          </button>

          {message && (
            <span className="text-xs font-medium text-emerald-400 ml-auto">
              {message}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: MEDIA CATALOG LIST */}
          {viewTab === 'list' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-gray-400 uppercase bg-white/[0.02] border-b border-white/5">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Views</th>
                      <th className="p-3">Downloads</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mediaList.map(item => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-semibold text-white flex items-center gap-3">
                          <img src={item.poster} alt={item.title} className="w-8 h-11 object-cover rounded bg-black" />
                          <div>
                            <div>{item.title}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{item.genres?.slice(0, 2).join(', ')}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            item.type === 'series' ? 'bg-purple-950 text-purple-300' : 'bg-cyan-950 text-cyan-300'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3 text-gray-300">{item.releaseYear}</td>
                        <td className="p-3 text-amber-400 font-bold">⭐ {item.imdb}</td>
                        <td className="p-3 text-gray-300 font-mono">{(item.views || 0).toLocaleString()}</td>
                        <td className="p-3 text-gray-300 font-mono">{(item.downloads || 0).toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 transition-colors"
                            title="Delete Title"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW TITLE FORM */}
          {viewTab === 'add' && (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Interstellar 2: Beyond Stars"
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Content Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">Web Series</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Beyond the known universe lies humanity's destiny"
                  className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Synopsis / Overview</label>
                <textarea
                  rows={3}
                  value={formData.synopsis}
                  onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
                  placeholder="Detailed synopsis of the movie or web series..."
                  className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.releaseYear}
                    onChange={e => setFormData({ ...formData, releaseYear: e.target.value })}
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">IMDb Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.imdb}
                    onChange={e => setFormData({ ...formData, imdb: e.target.value })}
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Rating</label>
                  <input
                    type="text"
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="PG-13, R, TV-MA"
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Duration / Episodes</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="2h 15m or 2 Seasons"
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={formData.genres}
                    onChange={e => setFormData({ ...formData, genres: e.target.value })}
                    placeholder="Sci-Fi, Action, Thriller"
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Director</label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={e => setFormData({ ...formData, director: e.target.value })}
                    placeholder="e.g. Christopher Nolan"
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Cast (comma separated)</label>
                <input
                  type="text"
                  value={formData.cast}
                  onChange={e => setFormData({ ...formData, cast: e.target.value })}
                  placeholder="e.g. Cillian Murphy, Florence Pugh, Pedro Pascal"
                  className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    value={formData.poster}
                    onChange={e => setFormData({ ...formData, poster: e.target.value })}
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Backdrop Image URL</label>
                  <input
                    type="url"
                    value={formData.backdrop}
                    onChange={e => setFormData({ ...formData, backdrop: e.target.value })}
                    className="w-full bg-[#161726] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
                <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Server className="w-4 h-4" />
                  Streaming & Download Source Links
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Stream Video URL (MP4/HLS)</label>
                  <input
                    type="url"
                    value={formData.streamUrl}
                    onChange={e => setFormData({ ...formData, streamUrl: e.target.value })}
                    className="w-full bg-[#12131e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">4K Download Link</label>
                    <input
                      type="url"
                      value={formData.download4kUrl}
                      onChange={e => setFormData({ ...formData, download4kUrl: e.target.value })}
                      className="w-full bg-[#12131e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">1080p Download Link</label>
                    <input
                      type="url"
                      value={formData.download1080pUrl}
                      onChange={e => setFormData({ ...formData, download1080pUrl: e.target.value })}
                      className="w-full bg-[#12131e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setViewTab('list')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Publishing...' : 'Publish to ShadowPlex'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
