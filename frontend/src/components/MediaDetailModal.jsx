import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Calendar, 
  Clock, 
  Film, 
  Tv, 
  ShieldAlert, 
  Layers, 
  HardDrive, 
  CheckCircle,
  ExternalLink,
  Users
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useDownloads } from '../context/DownloadContext';

export default function MediaDetailModal({ 
  media, 
  allMedia = [],
  onClose, 
  onPlay, 
  onPlayEpisode 
}) {
  const [activeTab, setActiveTab] = useState(media.type === 'series' ? 'episodes' : 'downloads');
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { startDownload } = useDownloads();

  if (!media) return null;

  const inWatchlist = isInWatchlist(media.id);
  const isSeries = media.type === 'series';
  const seasons = media.seasons || [];
  const currentSeason = seasons[selectedSeasonIndex] || seasons[0];

  // Recommendations from same genre
  const similarItems = allMedia
    .filter(item => item.id !== media.id && item.genres?.some(g => media.genres?.includes(g)))
    .slice(0, 4);

  const handleDownloadClick = (option, episodeTitle = null) => {
    startDownload({
      mediaId: media.id,
      title: media.title,
      episodeTitle,
      quality: option.quality || '1080p FHD',
      size: option.size || '3.2 GB',
      url: option.url || media.streamSources?.[0]?.url
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#0e0f18] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition-colors border border-white/10"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Header */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
          <img
            src={media.backdrop || media.poster}
            alt={media.title}
            className="w-full h-full object-cover object-center filter brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f18] via-[#0e0f18]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0f18] via-transparent to-transparent w-2/3" />

          {/* Quick Header Details */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="px-2.5 py-0.5 rounded bg-purple-600 text-white font-bold uppercase tracking-wide">
                  {media.type === 'series' ? 'Web Series' : 'Movie'}
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {media.imdb} IMDb
                </span>
                <span className="text-gray-300 bg-white/10 px-2 py-0.5 rounded">
                  {media.releaseYear}
                </span>
                <span className="text-gray-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  {media.rating}
                </span>
                <span className="text-gray-300">
                  {media.duration}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow">
                {media.title}
              </h1>

              {media.tagline && (
                <p className="text-cyan-300/90 text-xs sm:text-sm italic">
                  "{media.tagline}"
                </p>
              )}
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => onPlay(media)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all text-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play Now</span>
              </button>

              <button
                onClick={() => toggleWatchlist(media)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  inWatchlist
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border-white/10'
                }`}
                title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                {inWatchlist ? <BookmarkCheck className="w-5 h-5 fill-white" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-white/10 bg-[#0c0d15]">
          {isSeries && (
            <button
              onClick={() => setActiveTab('episodes')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-bold transition-all ${
                activeTab === 'episodes'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Episodes & Seasons</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('downloads')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-bold transition-all ${
              activeTab === 'downloads'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Overview & Cast</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: EPISODES (FOR SERIES) */}
          {activeTab === 'episodes' && isSeries && (
            <div className="space-y-6">
              
              {/* Season Selector Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {seasons.map((season, idx) => (
                    <button
                      key={season.seasonNumber}
                      onClick={() => setSelectedSeasonIndex(idx)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedSeasonIndex === idx
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {season.title || `Season ${season.seasonNumber}`}
                    </button>
                  ))}
                </div>

                {/* Batch Season Download Button */}
                {currentSeason?.batchDownload && (
                  <button
                    onClick={() => handleDownloadClick({
                      quality: currentSeason.batchDownload.quality,
                      size: currentSeason.batchDownload.size,
                      url: currentSeason.batchDownload.url
                    }, `${currentSeason.title} (Batch Pack)`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-semibold shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full Season ({currentSeason.batchDownload.size})</span>
                  </button>
                )}
              </div>

              {/* Episodes List */}
              <div className="space-y-3">
                {currentSeason?.episodes?.map(ep => (
                  <div
                    key={ep.episodeNumber}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {/* Thumbnail with quick play */}
                      <div 
                        onClick={() => onPlayEpisode(media, ep)}
                        className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black/50 cursor-pointer"
                      >
                        <img
                          src={ep.thumbnail || media.backdrop}
                          alt={ep.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 fill-white text-white" />
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black/70 px-1 rounded text-[10px] font-mono text-gray-300">
                          {ep.duration}
                        </span>
                      </div>

                      {/* Episode Meta */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            EP {ep.episodeNumber}
                          </span>
                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {ep.title}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 max-w-lg">
                          {ep.overview}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onPlayEpisode(media, ep)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Stream</span>
                      </button>

                      <button
                        onClick={() => handleDownloadClick({
                          quality: '1080p HD',
                          size: ep.size || '1.4 GB',
                          url: ep.downloadUrl || ep.streamUrl
                        }, `S${currentSeason.seasonNumber}E${ep.episodeNumber} - ${ep.title}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 border border-white/10 text-xs font-semibold transition-colors"
                        title="Download Episode"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{ep.size || 'Download'}</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: DOWNLOAD HUB */}
          {activeTab === 'downloads' && (
            <div className="space-y-6">
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    High-Speed Direct & Mirror Downloads
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Unlimited speed, uncompressed audio, multiple quality presets with multi-threaded mirror support.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Servers Online
                </div>
              </div>

              {/* Quality Download Options Table/Cards */}
              <div className="space-y-3">
                {(media.downloadLinks || [
                  { quality: '4K 2160p HDR', size: '14.2 GB', codec: 'x265 10-bit', server: 'ShadowPlex HighSpeed #1' },
                  { quality: '1080p Full HD', size: '3.8 GB', codec: 'H.264 Bluray', server: 'Fast Cloud Mirror #2' },
                  { quality: '720p HD', size: '1.4 GB', codec: 'x264 Web-DL', server: 'Mega Server #3' },
                  { quality: '480p Mobile Save', size: '650 MB', codec: 'HEVC Mobile', server: 'Direct Mobile Link' }
                ]).map((link, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">
                          {link.quality}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-purple-300 border border-white/10">
                          {link.codec}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-cyan-400">
                          {link.size}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Mirrored via <span className="text-gray-300 font-medium">{link.server}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadClick(link)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download ({link.size})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OVERVIEW & CAST */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Synopsis */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Synopsis
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {media.synopsis}
                </p>
              </div>

              {/* Director & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Director
                  </h4>
                  <p className="text-sm font-semibold text-white">
                    {media.director || 'Director Unknown'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Starring Cast
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {media.cast?.map(actor => (
                      <span
                        key={actor}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 border border-white/10"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-gray-400 uppercase">Resolution</div>
                    <div className="text-xs font-bold text-white mt-0.5">3840 x 2160 (4K)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-gray-400 uppercase">Audio Channels</div>
                    <div className="text-xs font-bold text-white mt-0.5">Dolby Atmos 7.1</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-gray-400 uppercase">Dynamic Range</div>
                    <div className="text-xs font-bold text-white mt-0.5">Dolby Vision / HDR10+</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-gray-400 uppercase">Bitrate</div>
                    <div className="text-xs font-bold text-white mt-0.5">~24.8 Mbps HEVC</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* More Like This (Recommendations) */}
          {similarItems.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                More Like This
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similarItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      // Timeout to re-open with new media
                      setTimeout(() => onPlay(item), 100);
                    }}
                    className="group cursor-pointer rounded-xl overflow-hidden bg-[#13141f] border border-white/5 hover:border-purple-500/50 transition-all"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-2">
                      <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-300">
                        {item.title}
                      </h5>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.releaseYear} • ⭐ {item.imdb}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
