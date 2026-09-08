import React from 'react';
import { 
  Play, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Info,
  Headphones
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
    <div className="group relative rounded-xl overflow-hidden bg-[#11131b] border border-white/[0.06] hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col cursor-pointer">
      
      {/* Poster Image */}
      <div 
        onClick={() => onOpenDetails(media)} 
        className="relative aspect-[2/3] w-full overflow-hidden bg-[#161822]"
      >
        <img
          src={media.poster}
          alt={media.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11131b] via-transparent to-black/50 opacity-60 group-hover:opacity-85 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md uppercase tracking-wider ${
            media.industry === 'Bollywood' 
              ? 'bg-amber-700/90 text-white' 
              : 'bg-blue-700/90 text-white'
          }`}>
            {media.industry === 'Bollywood' ? 'Bollywood' : 'Hollywood'}
          </span>

          <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-400 border border-white/10">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{media.imdb}</span>
          </div>
        </div>

        {/* Bottom Audio Tag on Poster */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-gray-300 pointer-events-none">
          <span className="bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-medium text-emerald-400">
            {media.audio?.includes('Dual') ? 'Dual Audio' : 'Hindi 5.1'}
          </span>
          <span className="bg-black/80 backdrop-blur-md px-1 py-0.5 rounded border border-white/10 text-[9px] font-mono text-gray-300">
            4K
          </span>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-250 bg-black/75 backdrop-blur-[2px] p-3">
          
          {/* Quick Play Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(media);
            }}
            className="w-12 h-12 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
            title="Watch Now"
          >
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </button>

          {/* Sub-actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDownload(media);
              }}
              className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/10 transition-colors"
              title="Download Options"
            >
              <Download className="w-4 h-4 text-[#e50914]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(media);
              }}
              className={`p-2 rounded-lg border transition-colors ${
                inWatchlist
                  ? 'bg-[#e50914] text-white border-[#e50914]'
                  : 'bg-white/15 hover:bg-white/25 text-gray-300 hover:text-white border-white/10'
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
              className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-gray-300 hover:text-white border border-white/10 transition-colors"
              title="Details & Cast"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Info Details Section */}
      <div 
        onClick={() => onOpenDetails(media)} 
        className="p-3 flex flex-col flex-grow justify-between gap-1.5"
      >
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#e50914] transition-colors line-clamp-1">
            {media.title}
          </h3>
          
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
            <span>{media.releaseYear}</span>
            <span>•</span>
            <span className="text-gray-300">
              {media.genres?.[0] || 'Drama'}
            </span>
            <span>•</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">
              {media.type === 'series' ? 'Series' : 'Movie'}
            </span>
          </div>
        </div>

        {/* Runtime / Director */}
        <div className="text-[10px] text-gray-500 font-medium line-clamp-1">
          {media.director ? `Dir. ${media.director}` : media.duration}
        </div>
      </div>

    </div>
  );
}
