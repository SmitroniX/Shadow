import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';

export default function MediaRow({ 
  title, 
  subtitle,
  items = [], 
  onPlay, 
  onOpenDetails, 
  onOpenDownload 
}) {
  const rowRef = useRef(null);

  if (!items.length) return null;

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/row my-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[#e50914]" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5 ml-3">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Row with Navigation Controls */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/80 hover:bg-[#e50914] text-white border border-white/10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel Container */}
        <div 
          ref={rowRef}
          className="flex gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {items.map(item => (
            <div key={item.id} className="w-36 sm:w-44 md:w-48 flex-shrink-0">
              <MediaCard
                media={item}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                onOpenDownload={onOpenDownload}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/80 hover:bg-[#e50914] text-white border border-white/10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-xl"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
