import React from 'react';
import { 
  Play, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Info 
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export default function MediaCard({ 
  media, 
  onPlay, 
  onOpenDetails, 
  onOpenDownload 
}) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(media.id);

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-[#12131c] border border-white/5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/40 hover:-translate-y-1.5 flex flex-col cursor-pointer">
      
      {/* Poster Image */}
      <div 
        onClick={() => onOpenDetails(media)} 
        className="relative aspect-[2/3] w-full overflow-hidden bg-[#161724]"
      >
        <img
          src={media.poster}
          alt={media.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12131c] via-transparent to-black/40 opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md uppercase tracking-wider ${
            media.type === 'series' 
              ? 'bg-purple-900/80 text-purple-200 border border-purple-400/30' 
              : 'bg-cyan-950/80 text-cyan-200 border border-cyan-400/30'
          }`}>
            {media.type === 'series' ? 'Series' : 'Movie'}
          </span>

          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-400 border border-white/10">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{media.imdb}</span>
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm p-4">
          
          {/* Quick Play Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(media);
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 hover:scale-110 active:scale-95 transition-transform"
            title="Stream Now"
          >
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </button>

          {/* Sub-actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDownload(media);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 hover:text-white border border-white/10 transition-colors"
              title="Download Options"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(media);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                inWatchlist
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border-white/10'
              }`}
              title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {inWatchlist ? <BookmarkCheck className="w-4 h-4 fill-white" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(media);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/10 transition-colors"
              title="View Details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Info Details Section */}
      <div 
        onClick={() => onOpenDetails(media)} 
        className="p-3.5 flex flex-col flex-grow justify-between gap-2"
      >
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {media.title}
          </h3>
          
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
            <span>{media.releaseYear}</span>
            <span>•</span>
            <span className="text-purple-300 font-medium">
              {media.genres?.[0] || 'Action'}
            </span>
            <span>•</span>
            <span className="text-gray-400 font-mono text-[10px] bg-white/5 px-1 rounded">
              4K UHD
            </span>
          </div>
        </div>

        {/* Duration / Episodes hint */}
        <div className="text-[11px] text-gray-400 font-mono">
          {media.duration}
        </div>
      </div>

    </div>
  );
}
