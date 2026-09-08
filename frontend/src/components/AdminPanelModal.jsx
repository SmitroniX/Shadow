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
  Save, 
  Database,
  Search,
  Sparkles
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
    industry: 'Bollywood',
    audio: 'Dual Audio [Hindi + English]',
    imdbId: '',
    tmdbId: '',
    tagline: '',
    synopsis: '',
    releaseYear: 2024,
    rating: 'UA / 16+',
    imdb: 8.2,
    duration: '2h 30m',
    genres: 'Action, Thriller',
    director: '',
    cast: '',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    streamUrl: '',
    download4kUrl: ''
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
      const generatedImdbId = formData.imdbId || `tt${Math.floor(Math.random() * 9000000 + 1000000)}`;
      const generatedTmdbId = formData.tmdbId ? parseInt(formData.tmdbId, 10) : Math.floor(Math.random() * 900000 + 100000);

      const newItem = {
        title: formData.title,
        type: formData.type,
        industry: formData.industry,
        audio: formData.audio,
        imdbId: generatedImdbId,
        tmdbId: generatedTmdbId,
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
          { 
            server: "VidSrc Pro Cinema HD", 
            embedUrl: formData.type === 'series' 
              ? `https://vidsrc.me/embed/tv?imdb=${generatedImdbId}&season=1&episode=1`
              : `https://vidsrc.me/embed/movie?imdb=${generatedImdbId}`, 
            quality: "1080p / 4K Real Movie" 
          },
          { 
            server: "VidLink 1080p Ultra", 
            embedUrl: formData.type === 'series'
              ? `https://vidlink.pro/tv/${generatedTmdbId}/1/1`
              : `https://vidlink.pro/movie/${generatedTmdbId}`, 
            quality: "UltraFast 1080p" 
          },
          { 
            server: "2Embed Ultra HD Mirror", 
            embedUrl: formData.type === 'series'
              ? `https://www.2embed.cc/embedtv/${generatedImdbId}&s=1&e=1`
              : `https://www.2embed.cc/embed/${generatedImdbId}`, 
            quality: "1080p Web-DL" 
          }
        ],
        downloadLinks: [
          { 
            quality: "4K 2160p HDR (Dual Audio)", 
            size: "14.8 GB", 
            codec: "HEVC 10-bit Atmos", 
            server: "ShadowFast VIP Cloud", 
            url: formData.download4kUrl 
          },
          { 
            quality: "1080p Full HD Bluray", 
            size: "3.6 GB", 
            codec: "H.264 DD+ 5.1", 
            server: "Google Drive HighSpeed Mirror", 
            url: formData.download4kUrl 
          },
          { 
            quality: "720p HD Dual Audio", 
            size: "1.4 GB", 
            codec: "x264 Web-DL", 
            server: "Mega HighSpeed Mirror", 
            url: formData.download4kUrl 
          }
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
              quality: '1080p Complete Season Pack (Dual Audio)',
              url: formData.streamUrl
            },
            episodes: [
              {
                episodeNumber: 1,
                title: 'Episode 1: Pilot',
                duration: '52m',
                overview: 'The opening episode of the thrilling series.',
                thumbnail: formData.backdrop,
                streamUrl: formData.streamUrl,
                embedUrl: `https://vidsrc.to/embed/tv/${generatedImdbId}/1/1`,
                downloadUrl: formData.streamUrl,
                size: '1.4 GB'
              }
            ]
          }
        ];
      }

      await createMedia(newItem);
      setMessage(`Added "${formData.title}" (${formData.industry}) to ShadowPlex!`);
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      
      {/* Container */}
      <div className="relative w-full max-w-5xl bg-[#0f1118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#13151f]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#e50914] text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ShadowPlex Admin Management
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">
                  v3.0 Real Media
                </span>
              </h2>
              <p className="text-xs text-gray-400">Manage real Bollywood & Hollywood titles, IMDb metadata, and mirrors</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-[#0c0d14] border-b border-white/5">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Total Catalog</span>
              <Database className="w-3.5 h-3.5 text-gray-300" />
            </div>
            <div className="text-lg font-bold text-white mt-1">{stats.totalTitles || mediaList.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Movies / Series</span>
              <Film className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white mt-1">
              {stats.totalMovies || 0} / {stats.totalSeries || 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Streams Served</span>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {(stats.totalViews || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Downloads</span>
              <Download className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-amber-400 mt-1">
              {(stats.totalDownloads || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Bandwidth</span>
              <Server className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white mt-1">{stats.bandwidthServed || '0 TB'}</div>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-white/10 bg-[#11131c]">
          <button
            onClick={() => setViewTab('list')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewTab === 'list'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Manage Titles ({mediaList.length})
          </button>

          <button
            onClick={() => setViewTab('add')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewTab === 'add'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Hollywood / Bollywood Title</span>
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
                      <th className="p-3">Title & Poster</th>
                      <th className="p-3">Industry</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">IMDb</th>
                      <th className="p-3">Audio Track</th>
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
                            item.industry === 'Bollywood' ? 'bg-amber-950 text-amber-300' : 'bg-blue-950 text-blue-300'
                          }`}>
                            {item.industry}
                          </span>
                        </td>
                        <td className="p-3 text-gray-300 uppercase text-[10px] font-bold">{item.type}</td>
                        <td className="p-3 text-gray-300">{item.releaseYear}</td>
                        <td className="p-3 text-amber-400 font-bold">⭐ {item.imdb}</td>
                        <td className="p-3 text-emerald-400 text-[11px]">{item.audio?.includes('Dual') ? 'Dual Audio' : 'Hindi 5.1'}</td>
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
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Movie / Series Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Inception or War 2"
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                  >
                    <option value="Bollywood">Bollywood 🇮🇳</option>
                    <option value="Hollywood">Hollywood 🇺🇸</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">Web Series</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">IMDb ID (e.g. tt15398776)</label>
                  <input
                    type="text"
                    value={formData.imdbId}
                    onChange={e => setFormData({ ...formData, imdbId: e.target.value })}
                    placeholder="tt15398776"
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Audio Track</label>
                  <input
                    type="text"
                    value={formData.audio}
                    onChange={e => setFormData({ ...formData, audio: e.target.value })}
                    placeholder="Dual Audio [Hindi + English]"
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Synopsis / Storyline</label>
                <textarea
                  rows={3}
                  value={formData.synopsis}
                  onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
                  placeholder="Official storyline from IMDb/TMDB..."
                  className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e50914]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.releaseYear}
                    onChange={e => setFormData({ ...formData, releaseYear: e.target.value })}
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
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
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Rating</label>
                  <input
                    type="text"
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="UA / 16+, PG-13, R"
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Duration / Episodes</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="2h 45m or 1 Season"
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
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
                    placeholder="Action, Sci-Fi, Thriller"
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Director / Creator</label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={e => setFormData({ ...formData, director: e.target.value })}
                    placeholder="e.g. Christopher Nolan or Rajkumar Hirani"
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Cast (comma separated)</label>
                <input
                  type="text"
                  value={formData.cast}
                  onChange={e => setFormData({ ...formData, cast: e.target.value })}
                  placeholder="e.g. Shah Rukh Khan, Deepika Padukone, Cillian Murphy"
                  className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Poster Image URL (TMDB / IMDb)</label>
                  <input
                    type="url"
                    value={formData.poster}
                    onChange={e => setFormData({ ...formData, poster: e.target.value })}
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Backdrop Image URL</label>
                  <input
                    type="url"
                    value={formData.backdrop}
                    onChange={e => setFormData({ ...formData, backdrop: e.target.value })}
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setViewTab('list')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Adding...' : 'Save & Publish Title'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
