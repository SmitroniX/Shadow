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
  Bookmark, 
  Sparkles, 
  Globe2,
  SlidersHorizontal, 
  Star
} from 'lucide-react';

function ShadowPlexApp() {
  const [mediaList, setMediaList] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('all'); // 'all', 'movie', 'series', 'top10', 'watchlist'
  const [industryFilter, setIndustryFilter] = useState('All'); // 'All', 'Bollywood', 'Hollywood'
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'rating', 'year'

  // Modals & Player State
  const [playerMedia, setPlayerMedia] = useState(null);
  const [playerEpisode, setPlayerEpisode] = useState(null);
  const [playerStartTime, setPlayerStartTime] = useState(0);
  const [playerTorrent, setPlayerTorrent] = useState(null);

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
  const handlePlayMedia = (media, startTime = 0, torrent = null) => {
    setPlayerMedia(media);
    setPlayerEpisode(null);
    setPlayerStartTime(startTime);
    setPlayerTorrent(torrent);
    setDetailMedia(null);
  };

  const handlePlayEpisode = (media, episode) => {
    setPlayerMedia(media);
    setPlayerEpisode(episode);
    setPlayerStartTime(0);
    setPlayerTorrent(null);
    setDetailMedia(null);
  };

  const handleResumePlay = (historyItem) => {
    const matchedMedia = mediaList.find(m => m.id === historyItem.id);
    if (!matchedMedia) return;

    if (historyItem.episodeNumber && matchedMedia.seasons) {
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
    if (industryFilter !== 'All' && item.industry !== industryFilter) return false;
    if (selectedGenre !== 'All' && !item.genres?.includes(selectedGenre)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.imdb || 0) - (a.imdb || 0);
    if (sortBy === 'year') return (b.releaseYear || 0) - (a.releaseYear || 0);
    return (b.views || 0) - (a.views || 0);
  });

  // Curated lists for home page
  const featuredList = mediaList.filter(m => m.featured);
  const bollywoodMovies = mediaList.filter(m => m.type === 'movie' && m.industry === 'Bollywood');
  const hollywoodMovies = mediaList.filter(m => m.type === 'movie' && m.industry === 'Hollywood');
  const bollywoodSeries = mediaList.filter(m => m.type === 'series' && m.industry === 'Bollywood');
  const hollywoodSeries = mediaList.filter(m => m.type === 'series' && m.industry === 'Hollywood');
  const topRatedMovies = [...mediaList].sort((a, b) => b.imdb - a.imdb).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#08090d] text-gray-100 flex flex-col selection:bg-[#e50914] selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        industryFilter={industryFilter}
        setIndustryFilter={setIndustryFilter}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 lg:pb-16">
        
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

            {/* Industry Quick Filter Ribbon */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 mb-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 bg-[#10121a]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl">
                <span className="text-xs font-bold text-gray-400 px-3 uppercase tracking-wider hidden sm:inline">
                  Quick Filter:
                </span>
                <button
                  onClick={() => { setCurrentTab('all'); setIndustryFilter('All'); }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-gray-200 transition-colors shadow-sm"
                >
                  All Cinema
                </button>
                <button
                  onClick={() => { setCurrentTab('movie'); setIndustryFilter('Bollywood'); }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 transition-colors"
                >
                  Bollywood Blockbusters 🇮🇳
                </button>
                <button
                  onClick={() => { setCurrentTab('movie'); setIndustryFilter('Hollywood'); }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-colors"
                >
                  Hollywood 4K UHD 🇺🇸
                </button>
                <button
                  onClick={() => { setCurrentTab('series'); setIndustryFilter('Bollywood'); }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition-colors"
                >
                  Indian Web Series 📺
                </button>
                <button
                  onClick={() => { setCurrentTab('series'); setIndustryFilter('Hollywood'); }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition-colors"
                >
                  Global Web Series 🌍
                </button>
              </div>
            </div>

            {/* Continue Watching (persisted timestamps) */}
            <ContinueWatchingRow onResumePlay={handleResumePlay} />

            {/* Top 10 Today Row */}
            <Top10Row
              items={mediaList}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Bollywood Blockbusters Row */}
            <MediaRow
              title="Bollywood & Hindi Blockbusters 🇮🇳"
              subtitle="Latest Hindi blockbusters & South Indian dual audio releases"
              items={bollywoodMovies}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Hollywood Blockbusters Row */}
            <MediaRow
              title="Hollywood Blockbusters in 4K UHD 🇺🇸"
              subtitle="Dual audio [Hindi + English] with Dolby Atmos 5.1"
              items={hollywoodMovies}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Top Indian Web Series Row */}
            <MediaRow
              title="Binge-Worthy Indian Web Series"
              subtitle="Complete season packs with high-speed download mirrors"
              items={bollywoodSeries}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* International Acclaimed Web Series Row */}
            <MediaRow
              title="Top Rated Global Web Series"
              subtitle="Emmy & Golden Globe award-winning television series"
              items={hollywoodSeries}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            {/* Highest IMDb Score Row */}
            <MediaRow
              title="Critically Acclaimed (Highest IMDb Ratings) ⭐"
              subtitle="Top picks rated 8.0+ by global movie critics"
              items={topRatedMovies}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />
          </div>
        )}

        {/* TAB 2 & 3: MOVIES / WEB SERIES CATALOG GRID */}
        {(currentTab === 'movie' || currentTab === 'series') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
            
            {/* Header Title & Industry Switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {industryFilter === 'Bollywood' 
                    ? `Bollywood ${currentTab === 'movie' ? 'Movies' : 'Web Series'} 🇮🇳`
                    : industryFilter === 'Hollywood'
                    ? `Hollywood ${currentTab === 'movie' ? 'Movies' : 'Web Series'} 🇺🇸`
                    : `Browse ${currentTab === 'movie' ? 'Movies' : 'Web Series'}`}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Showing {filteredMedia.length} verified real titles with live stream servers & dual-audio downloads
                </p>
              </div>

              {/* Industry Segmented Switcher & Sort By */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-white/[0.05] p-1 rounded-xl border border-white/10">
                  {['All', 'Bollywood', 'Hollywood'].map(ind => (
                    <button
                      key={ind}
                      onClick={() => setIndustryFilter(ind)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        industryFilter === ind 
                          ? 'bg-[#e50914] text-white shadow-sm' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {ind === 'All' ? 'All' : ind === 'Bollywood' ? 'Bollywood 🇮🇳' : 'Hollywood 🇺🇸'}
                    </button>
                  ))}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#12141e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-semibold outline-none focus:border-[#e50914]"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest IMDb Rating</option>
                  <option value="year">Newest Release</option>
                </select>
              </div>
            </div>

            {/* Genre Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
              {['All', 'Action', 'Crime', 'Drama', 'Thriller', 'Sci-Fi', 'Comedy', 'Adventure', 'Fantasy'].map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedGenre === genre
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/5'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Grid Layout */}
            {filteredMedia.length === 0 ? (
              <div className="py-20 text-center text-gray-400 bg-[#11131a] rounded-2xl border border-white/5 p-8">
                <p className="text-base font-semibold">No titles found for the selected filter.</p>
                <button
                  onClick={() => { setSelectedGenre('All'); setIndustryFilter('All'); }}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#e50914] text-xs font-bold text-white hover:bg-red-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                IMDb Top 10 Ranked Cinema
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                The highest rated Bollywood and Hollywood cinema streams based on global IMDb votes
              </p>
            </div>

            <Top10Row
              items={mediaList}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailMedia}
              onOpenDownload={handleOpenDownload}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5 mt-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                My Saved Watchlist ({watchlist.length})
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Movies & Web Series saved to your offline cache
              </p>
            </div>

            {watchlist.length === 0 ? (
              <div className="py-20 text-center text-gray-400 space-y-3 bg-[#11131c] rounded-2xl border border-white/5 p-8">
                <Bookmark className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-base font-semibold text-gray-300">Your Watchlist is Empty</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Click the bookmark icon on any Bollywood or Hollywood movie or series to save it for later.
                </p>
                <button
                  onClick={() => setCurrentTab('all')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-xs font-bold text-white transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
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

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#06070a] pt-10 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="font-black text-xl tracking-tight text-white">
                SHADOW<span className="text-[#e50914]">PLEX</span>
              </span>
              <p className="text-xs text-gray-400 max-w-md">
                Cinema-grade streaming & multi-quality downloading platform featuring real Bollywood and Hollywood blockbusters with live IMDb metadata.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <button onClick={() => { setCurrentTab('all'); setIndustryFilter('All'); }} className="hover:text-white">Home</button>
              <button onClick={() => { setCurrentTab('movie'); setIndustryFilter('Bollywood'); }} className="hover:text-white">Bollywood 🇮🇳</button>
              <button onClick={() => { setCurrentTab('movie'); setIndustryFilter('Hollywood'); }} className="hover:text-white">Hollywood 🇺🇸</button>
              <button onClick={() => { setCurrentTab('series'); setIndustryFilter('All'); }} className="hover:text-white">Web Series</button>
              <button onClick={() => setAdminOpen(true)} className="text-amber-400 hover:text-amber-300">Admin Console</button>
            </div>
          </div>

          <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
            <div>
              © 2025 ShadowPlex. Powered by TMDB & IMDb API data.
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Streaming CDN Mirrors Online</span>
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
          initialTorrent={playerTorrent}
          onClose={() => {
            setPlayerMedia(null);
            setPlayerEpisode(null);
            setPlayerTorrent(null);
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
