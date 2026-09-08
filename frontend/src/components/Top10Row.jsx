import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Download, Star } from 'lucide-react';

export default function Top10Row({ 
  items = [], 
  onPlay, 
  onOpenDetails, 
  onOpenDownload 
}) {
  const rowRef = useRef(null);

  if (!items.length) return null;

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const top10Items = [...items]
    .filter(item => item.top10)
    .sort((a, b) => a.top10 - b.top10)
    .slice(0, 10);

  return (
    <div className="relative group/row my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-[#e50914]" />
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Top 10 Movies & Web Series Today
          </h2>
        </div>
      </div>

      {/* Row with Navigation Arrows */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/80 hover:bg-[#e50914] text-white border border-white/10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={rowRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 pl-2"
        >
          {top10Items.map((item, idx) => (
            <div 
              key={item.id}
              className="flex-shrink-0 flex items-center group cursor-pointer"
              onClick={() => onOpenDetails(item)}
            >
              {/* Stylized Netflix-like ranking number */}
              <div className="relative -mr-6 sm:-mr-8 z-10 select-none pointer-events-none">
                <span 
                  className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter"
                  style={{
                    WebkitTextStroke: '2px #555c68',
                    color: '#08090d',
                  }}
                >
                  {idx + 1}
                </span>
              </div>

              {/* Card Thumbnail */}
              <div className="relative w-36 sm:w-44 md:w-48 aspect-[2/3] rounded-xl overflow-hidden bg-[#151822] border border-white/10 group-hover:border-white/30 shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Rating badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-white/10">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  <span>{item.imdb}</span>
                </div>

                {/* Hover overlay with quick play */}
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                  <p className="text-xs font-bold text-white line-clamp-2">{item.title}</p>
                  <p className="text-[10px] text-gray-400">{item.industry}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(item);
                      }}
                      className="p-2.5 rounded-full bg-white text-black shadow-lg hover:scale-110 transition-transform"
                      title="Play"
                    >
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDownload(item);
                      }}
                      className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/10 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-[#e50914]" />
                    </button>
                  </div>
                </div>
              </div>
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
