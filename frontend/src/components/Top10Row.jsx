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

  // Sort by top10 field
  const top10Items = [...items]
    .filter(item => item.top10)
    .sort((a, b) => a.top10 - b.top10)
    .slice(0, 10);

  return (
    <div className="relative group/row my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-purple-500 to-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Top 10 Today on <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">ShadowPlex</span>
          </h2>
        </div>
      </div>

      {/* Row with Navigation Arrows */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-purple-600 text-white border border-white/10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-xl hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={rowRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-4 pl-2"
        >
          {top10Items.map((item, idx) => (
            <div 
              key={item.id}
              className="flex-shrink-0 flex items-center group cursor-pointer"
              onClick={() => onOpenDetails(item)}
            >
              {/* Huge stylized ranking number */}
              <div className="relative -mr-6 sm:-mr-8 z-10 select-none pointer-events-none">
                <span 
                  className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter"
                  style={{
                    WebkitTextStroke: '2px #a855f7',
                    color: '#08080c',
                    textShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  {idx + 1}
                </span>
              </div>

              {/* Card Thumbnail */}
              <div className="relative w-36 sm:w-44 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden bg-[#161724] border border-white/10 group-hover:border-cyan-400/60 shadow-lg group-hover:shadow-cyan-950/40 group-hover:-translate-y-1.5 transition-all duration-300">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Rating badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-white/10">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  <span>{item.imdb}</span>
                </div>

                {/* Hover overlay with quick play */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                  <p className="text-xs font-bold text-white line-clamp-2">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(item);
                      }}
                      className="p-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-600/50 hover:scale-110 transition-transform"
                      title="Play"
                    >
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDownload(item);
                      }}
                      className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-cyan-300 border border-white/10 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
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
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-purple-600 text-white border border-white/10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-xl hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}
