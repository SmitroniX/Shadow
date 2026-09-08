import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Download, 
  Info, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export default function HeroBanner({ 
  featuredItems = [], 
  onPlay, 
  onOpenDetails, 
  onOpenDownload 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    if (!featuredItems.length) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredItems.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  if (!featuredItems.length) return null;

  const current = featuredItems[currentIndex] || featuredItems[0];
  const inWatchlist = isInWatchlist(current.id);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  return (
    <div className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-end pb-16 pt-28 overflow-hidden">
      {/* Background Backdrop with Cinema Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.backdrop || current.poster}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-[0.7] transform scale-105 transition-all duration-1000 ease-out"
        />
        {/* Subtle glowing vignette gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/70 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(139,92,246,0.15),transparent_60%)]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-4">
          
          {/* Badges / Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold tracking-wide uppercase shadow-sm">
              Featured {current.type === 'series' ? 'Series' : 'Movie'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-cyan-400 border border-cyan-500/30">
              4K ULTRA HD
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-yellow-400 border border-yellow-500/30">
              HDR10+
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {current.imdb}
            </span>
            <span className="text-gray-300 bg-white/5 px-2 py-0.5 rounded">
              {current.releaseYear}
            </span>
            <span className="text-gray-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {current.rating}
            </span>
            <span className="text-gray-400">
              {current.duration}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            {current.title}
          </h1>

          {/* Tagline */}
          {current.tagline && (
            <p className="text-cyan-300/90 text-sm md:text-base font-medium italic">
              "{current.tagline}"
            </p>
          )}

          {/* Synopsis */}
          <p className="text-gray-300 text-sm md:text-base line-clamp-3 leading-relaxed drop-shadow">
            {current.synopsis}
          </p>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {current.genres && current.genres.map(genre => (
              <span 
                key={genre} 
                className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10 hover:border-purple-500/50 transition-colors"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {/* Watch Now */}
            <button
              onClick={() => onPlay(current)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Watch Now</span>
            </button>

            {/* Download */}
            <button
              onClick={() => onOpenDownload(current)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-md border border-white/15 hover:border-cyan-400/40 shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download</span>
            </button>

            {/* Watchlist Toggle */}
            <button
              onClick={() => toggleWatchlist(current)}
              className={`p-3 rounded-xl backdrop-blur-md border transition-all ${
                inWatchlist
                  ? 'bg-purple-600/20 text-purple-400 border-purple-500/50'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10 hover:text-white'
              }`}
              title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {inWatchlist ? <BookmarkCheck className="w-5 h-5 fill-purple-400 text-purple-400" /> : <Bookmark className="w-5 h-5" />}
            </button>

            {/* Details Modal */}
            <button
              onClick={() => onOpenDetails(current)}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
              title="More Details & Cast"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="absolute right-4 md:right-8 bottom-10 z-20 flex items-center gap-2">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all"
          title="Previous Featured"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Indicators */}
        <div className="flex items-center gap-1.5 px-2">
          {featuredItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-gradient-to-r from-purple-500 to-cyan-400' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all"
          title="Next Featured"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
