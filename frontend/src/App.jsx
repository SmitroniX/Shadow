import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MediaRow from './components/MediaRow';
import Top10Row from './components/Top10Row';
import ContinueWatchingRow from './components/ContinueWatchingRow';
import MediaCard from './components/MediaCard';
import ShadowPlayer from './components/ShadowPlayer';
import MediaDetailModal from './components/MediaDetailModal';
import DownloadManagerModal from './components/DownloadManagerModal';
import SearchModal from './components/SearchModal';
import AdminPanelModal from './components/AdminPanelModal';
import Toast from './components/Toast';

import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';
import { DownloadProvider, useDownloads } from './context/DownloadContext';
import { fetchMedia, fetchGenres } from './services/api';
import { 
  Film, 
  Tv, 
  Flame, 
  SlidersHorizontal, 
  Bookmark, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Heart,
  ChevronDown
} from 'lucide-react';

function ShadowPlexApp() {
  const [mediaList, setMediaList] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('all'); // 'all', 'movie', 'series', 'top10', 'watchlist'
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'rating', 'year'

  // Modals & Player State
  const [playerMedia, setPlayerMedia] = useState(null);
  const [playerEpisode, setPlayerEpisode] = useState(null);
  const [playerStartTime, setPlayerStartTime] = useState(0);

  const [detailMedia, setDetailMedia] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const { watchlist } = useWatchlist();
  const { startDownload } = useDownloads();

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const [mediaData, genreData] = await Promise.all([
        fetchMedia(),
        fetchGenres()
      ]);
      setMediaList(mediaData);
      setGenres(genreData);
    } catch (err) {
      console.error('Error loading catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Handlers
  const handlePlayMedia = (media, startTime = 0) => {
    setPlayerMedia(media);
    setPlayerEpisode(null);
    setPlayerStartTime(startTime);
    setDetailMedia(null);
  };

  const handlePlayEpisode = (media, episode) => {
    setPlayerMedia(media);
    setPlayerEpisode(episode);
    setPlayerStartTime(0);
    setDetailMedia(null);
  };

  const handleResumePlay = (historyItem) => {
    const matchedMedia = mediaList.find(m => m.id === historyItem.id);
    if (!matchedMedia) return;

    if (historyItem.episodeNumber && matchedMedia.seasons) {
      // Find matching episode
      let foundEp = null;
      for (const s of matchedMedia.seasons) {
        const ep = s.episodes?.find(e => e.episodeNumber === historyItem.episodeNumber);
        if (ep) {
          foundEp = ep;
          break;
        }
      }
      handlePlayEpisode(matchedMedia, foundEp || {
        episodeNumber: historyItem.episodeNumber,
        title: historyItem.episodeTitle,
        streamUrl: historyItem.streamUrl
      });
    } else {
      handlePlayMedia(matchedMedia, historyItem.currentTime || 0);
    }
  };

  const handlePlayNextEpisode = () => {
    if (!playerMedia || !playerEpisode || !playerMedia.seasons) return;
    
    // Find current episode and play the next one
    for (const season of playerMedia.seasons) {
      const epIndex = season.episodes?.findIndex(e => e.episodeNumber === playerEpisode.episodeNumber);
      if (epIndex !== -1 && epIndex < season.episodes.length - 1) {
        handlePlayEpisode(playerMedia, season.episodes[epIndex + 1]);
        return;
      }
    }
  };

  const handleOpenDownload = (media) => {
    setDetailMedia(media);
  };

  // Filtered Media for Catalog Views
  const filteredMedia = mediaList.filter(item => {
    if (currentTab === 'movie' && item.type !== 'movie') return false;
    if (currentTab === 'series' && item.type !== 'series') return false;
    if (selectedGenre !== 'All' && !item.genres?.includes(selectedGenre)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.imdb || 0) - (a.imdb || 0);
    if (sortBy === 'year') return (b.releaseYear || 0) - (a.releaseYear || 0);
    return (b.views || 0) - (a.views || 0);
  });

  const featuredList = mediaList.filter(m => m.featured);
  const trendingList = mediaList.filter(m => m.trending);
  const moviesList = mediaList.filter(m => m.type === 'movie');
  const seriesList = mediaList.filter(m => m.type === 'series');
  const sciFiList = mediaList.filter(m => m.genres?.includes('Sci-Fi') || m.genres?.includes('Cyberpunk'));
  const actionList = mediaList.filter(m => m.genres?.includes('Action') || m.genres?.includes('Thriller'));

  return (
    <div className="min-h-screen bg-[#08080c] text-gray-100 flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* TAB 1: HOME VIEW */}
        {currentTab === 'all' && (
          <div>
            {/* Hero Banner with Featured Titles */}
            <HeroBanner
              featuredItems={featuredList.length ? featuredList : mediaList.slice(0, 4)}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Continue Watching (from local storage / session) */}
            <ContinueWatchingRow onResumePlay={handleResumePlay} />

            {/* Top 10 Today Row */}
            <Top10Row
              items={mediaList}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Trending Now Row */}
            <MediaRow
              title="Trending Now"
              subtitle="Most popular streams in the last 24 hours"
              items={trendingList}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Blockbuster Movies Row */}
            <MediaRow
              title="Blockbuster Movies"
              subtitle="4K UHD, HDR10+, Direct Multi-Quality Downloads"
              items={moviesList}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Binge-Worthy Web Series Row */}
            <MediaRow
              title="Binge-Worthy Web Series"
              subtitle="Full season batch downloads & seamless episode streaming"
              items={seriesList}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Sci-Fi & Cyberpunk Row */}
            <MediaRow
              title="Cyberpunk & Futuristic Sci-Fi"
              subtitle="High-octane world-building, neural networks & neon underworlds"
              items={sciFiList}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Action & Thrillers Row */}
            <MediaRow
              title="Action, Heist & Thriller"
              subtitle="Adrenaline-pumping cinematography & intense suspense"
              items={actionList}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />
          </div>
        )}

        {/* TAB 2 & 3: MOVIES / WEB SERIES CATALOG GRID */}
        {(currentTab === 'movie' || currentTab === 'series') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
            
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">
                  <Flame className="w-4 h-4" />
                  <span>ShadowPlex Catalog</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {currentTab === 'movie' ? 'Browse Movies' : 'Browse Web Series & Shows'}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {filteredMedia.length} titles available in high definition with direct download mirrors
                </p>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#12131f] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-semibold outline-none focus:border-purple-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest IMDb Rating</option>
                  <option value="year">Newest Release</option>
                </select>
              </div>
            </div>

            {/* Genre Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
              {['All', 'Sci-Fi', 'Action', 'Thriller', 'Cyberpunk', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Animation'].map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedGenre === genre
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Grid Layout */}
            {filteredMedia.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <p className="text-base font-semibold">No media found for the selected filter.</p>
                <button
                  onClick={() => setSelectedGenre('All')}
                  className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-500"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredMedia.map(item => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onPlay={handlePlayMedia}
                    onOpenDetails={setDetailMedia}
                    onOpenDownload={handleOpenDownload}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 4: TOP 10 */}
        {currentTab === 'top10' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Today's Top 10 Ranked
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                The most watched and downloaded movies and series across all ShadowPlex nodes
              </p>
            </div>

            <Top10Row
              items={mediaList}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
              {mediaList
                .filter(m => m.top10)
                .sort((a, b) => a.top10 - b.top10)
                .map(item => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onPlay={handlePlayMedia}
                    onOpenDetails={setDetailMedia}
                    onOpenDownload={handleOpenDownload}
                  />
                ))}
            </div>
          </div>
        )}

        {/* TAB 5: WATCHLIST */}
        {currentTab === 'watchlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
                <Bookmark className="w-4 h-4" />
                <span>My Saved Library</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                My Watchlist ({watchlist.length})
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Titles saved for offline downloads or future streaming
              </p>
            </div>

            {watchlist.length === 0 ? (
              <div className="py-20 text-center text-gray-400 space-y-3 bg-[#11121d] rounded-2xl border border-white/5 p-8">
                <Bookmark className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-base font-semibold text-gray-300">Your Watchlist is Empty</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Click the bookmark icon on any movie or web series to keep track of what you want to watch or download next.
                </p>
                <button
                  onClick={() => setCurrentTab('all')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {watchlist.map(item => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onPlay={handlePlayMedia}
                    onOpenDetails={setDetailMedia}
                    onOpenDownload={handleOpenDownload}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modern Cinema Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#06070a] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="font-extrabold text-2xl tracking-tight leading-none text-white">
                SHADOW<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">PLEX</span>
              </span>
              <p className="text-xs text-gray-400 max-w-md">
                Ultra-fast 4K cinema streaming and multi-quality direct file downloading platform. Built with React, Vite, Tailwind CSS, and Express.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <button onClick={() => setCurrentTab('all')} className="hover:text-white">Home</button>
              <button onClick={() => setCurrentTab('movie')} className="hover:text-white">Movies</button>
              <button onClick={() => setCurrentTab('series')} className="hover:text-white">Web Series</button>
              <button onClick={() => setCurrentTab('top10')} className="hover:text-white">Top 10</button>
              <button onClick={() => setAdminOpen(true)} className="text-purple-400 hover:text-purple-300">Admin CMS</button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
            <div>
              © 2025 ShadowPlex Entertainment Media. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>All 4 Streaming CDN Nodes Active</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Cinema Video Player Modal */}
      {playerMedia && (
        <ShadowPlayer
          media={playerMedia}
          episode={playerEpisode}
          initialTime={playerStartTime}
          onClose={() => {
            setPlayerMedia(null);
            setPlayerEpisode(null);
          }}
          onPlayNextEpisode={handlePlayNextEpisode}
        />
      )}

      {/* Media Detail & Download Hub Modal */}
      {detailMedia && (
        <MediaDetailModal
          media={detailMedia}
          allMedia={mediaList}
          onClose={() => setDetailMedia(null)}
          onPlay={handlePlayMedia}
          onPlayEpisode={handlePlayEpisode}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        mediaList={mediaList}
        onPlay={handlePlayMedia}
        onOpenDetails={setDetailMedia}
        onOpenDownload={handleOpenDownload}
      />

      {/* Download Manager Drawer */}
      <DownloadManagerModal />

      {/* Admin CMS Modal */}
      <AdminPanelModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        mediaList={mediaList}
        onMediaUpdated={loadCatalog}
      />

      {/* Floating Toast Notification */}
      <Toast />

    </div>
  );
}

export default function App() {
  return (
    <WatchlistProvider>
      <DownloadProvider>
        <ShadowPlexApp />
      </DownloadProvider>
    </WatchlistProvider>
  );
}
