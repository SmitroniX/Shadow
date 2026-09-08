import React, { useState, useEffect } from "react";
import { 
  Play, 
  Download, 
  Info, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  Headphones
} from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";

export default function HeroBanner({ 
  featuredItems = [], 
  onPlay, 
  onOpenDetails, 
  onOpenDownload 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    if (!featuredItems.length) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredItems.length);
    }, 8500);
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
    <div className="relative w-full min-h-[65vh] sm:min-h-[75vh] md:min-h-[85vh] flex items-end pb-12 sm:pb-16 pt-20 sm:pt-24 overflow-hidden">
      {/* Background Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.backdrop || current.poster}
          alt={current.title}
          className="w-full h-full object-cover object-top filter brightness-[0.7] transform scale-100 transition-all duration-700 ease-out"
        />
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/80 to-transparent w-full md:w-3/5" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-2.5 sm:space-y-3.5">
          
          {/* Authentic Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold">
            <span className={`px-2 sm:px-2.5 py-0.5 rounded text-white font-bold tracking-wider uppercase text-[9px] sm:text-[10px] ${
              current.industry === "Bollywood" ? "bg-amber-600" : "bg-blue-600"
            }`}>
              {current.industry === "Bollywood" ? "Bollywood 🇮🇳" : "Hollywood 🇺🇸"}
            </span>

            <span className="px-2 py-0.5 rounded bg-white/[0.08] text-gray-200 border border-white/10 text-[10px] sm:text-[11px] font-mono">
              4K UHD
            </span>

            <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/60 px-2 py-0.5 rounded border border-white/10 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {current.imdb} IMDb
            </span>

            <span className="text-gray-300 bg-white/[0.08] px-2 py-0.5 rounded text-xs">
              {current.releaseYear}
            </span>

            <span className="text-gray-300 bg-white/[0.08] px-2 py-0.5 rounded text-xs hidden xs:inline">
              {current.rating}
            </span>

            <span className="text-gray-400 text-xs hidden sm:inline">
              {current.duration}
            </span>
          </div>

          {/* Audio Tracks Pill */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {current.audio || "Dual Audio [Hindi + English]"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-2xl">
            {current.title}
          </h1>

          {/* Tagline */}
          {current.tagline && (
            <p className="text-gray-300 text-xs sm:text-sm md:text-base font-medium italic line-clamp-1">
              "{current.tagline}"
            </p>
          )}

          {/* Synopsis */}
          <p className="text-gray-300 text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {current.synopsis}
          </p>

          {/* Genres & Director */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 text-xs text-gray-400">
            <span className="text-gray-300 font-semibold text-[11px] sm:text-xs">Dir. {current.director}</span>
            <span>•</span>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {current.genres?.map(genre => (
                <span 
                  key={genre} 
                  className="px-1.5 sm:px-2 py-0.5 rounded bg-white/[0.05] text-gray-300 border border-white/10 text-[10px] sm:text-xs"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
            {/* Watch Now */}
            <button
              onClick={() => onPlay(current)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-gray-200 text-black font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
              <span>Watch Now</span>
            </button>

            {/* Download */}
            <button
              onClick={() => onOpenDownload(current)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold backdrop-blur-md border border-white/15 transition-all text-xs sm:text-sm"
            >
              <Download className="w-4 h-4 text-[#e50914]" />
              <span>Download</span>
            </button>

            {/* Watchlist Toggle */}
            <button
              onClick={() => toggleWatchlist(current)}
              className={`p-2.5 sm:p-3 rounded-xl backdrop-blur-md border transition-all ${
                inWatchlist
                  ? "bg-[#e50914] text-white border-[#e50914]"
                  : "bg-white/10 hover:bg-white/20 text-gray-300 border-white/10 hover:text-white"
              }`}
              title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {inWatchlist ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Details Modal */}
            <button
              onClick={() => onOpenDetails(current)}
              className="p-2.5 sm:p-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/10 transition-all"
              title="More Details & Cast"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="absolute right-3 sm:right-6 md:right-8 bottom-6 sm:bottom-10 z-20 flex items-center gap-2">
        <button
          onClick={prevSlide}
          className="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-white/20 text-white border border-white/10 transition-all"
          title="Previous Featured"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Indicators */}
        <div className="flex items-center gap-1.5 px-1 sm:px-2">
          {featuredItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-5 sm:w-6 bg-[#e50914]" : "w-1.5 sm:w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-white/20 text-white border border-white/10 transition-all"
          title="Next Featured"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
