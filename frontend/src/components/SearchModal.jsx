import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Play, 
  Download, 
  Star, 
  Film, 
  Tv, 
  Headphones
} from 'lucide-react';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  mediaList = [], 
  onPlay, 
  onOpenDetails, 
  onOpenDownload 
}) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'bollywood', 'hollywood', 'movie', 'series'
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter(item => {
    if (filterType === 'bollywood' && item.industry !== 'Bollywood') return false;
    if (filterType === 'hollywood' && item.industry !== 'Hollywood') return false;
    if (filterType === 'movie' && item.type !== 'movie') return false;
    if (filterType === 'series' && item.type !== 'series') return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.synopsis && item.synopsis.toLowerCase().includes(q)) ||
      (item.genres && item.genres.some(g => g.toLowerCase().includes(q))) ||
      (item.director && item.director.toLowerCase().includes(q)) ||
      (item.cast && item.cast.some(c => c.toLowerCase().includes(q))) ||
      (item.industry && item.industry.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-20 p-4 animate-fadeIn">
      
      {/* Dialog Box */}
      <div className="w-full max-w-2xl bg-[#0f1118] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#13151f]">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search real Bollywood & Hollywood movies, series, actors (e.g. Shah Rukh, Nolan, Cillian)..."
            className="w-full bg-transparent text-white placeholder-gray-400 text-sm sm:text-base outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300 hover:text-white font-mono"
          >
            ESC
          </button>
        </div>

        {/* Filter Chips */}
        <div className="px-4 py-2.5 bg-[#0b0c13] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'bollywood', label: 'Bollywood 🇮🇳' },
            { id: 'hollywood', label: 'Hollywood 🇺🇸' },
            { id: 'movie', label: 'Movies' },
            { id: 'series', label: 'Web Series' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === f.id
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="text-[11px] text-gray-400 font-mono ml-auto">
            {filteredMedia.length} titles
          </span>
        </div>

        {/* Results Scroll Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          {filteredMedia.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Search className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p className="text-sm font-semibold">No titles found for "{query}"</p>
              <p className="text-xs text-gray-500 mt-1">Try searching for "Jawan", "Oppenheimer", "Dune", or "Mirzapur"</p>
            </div>
          ) : (
            filteredMedia.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onClose();
                  onOpenDetails(item);
                }}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Poster Thumbnail */}
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-12 h-16 rounded-lg object-cover bg-black flex-shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#e50914] transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className={`font-semibold ${item.industry === 'Bollywood' ? 'text-amber-400' : 'text-blue-400'}`}>
                        {item.industry}
                      </span>
                      <span>•</span>
                      <span>{item.releaseYear}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {item.imdb}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                      <span className="text-gray-300 line-clamp-1 max-w-xs">
                        Cast: {item.cast?.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      onPlay(item);
                    }}
                    className="p-2 rounded-lg bg-white hover:bg-gray-200 text-black shadow-md transition-transform hover:scale-105"
                    title="Play"
                  >
                    <Play className="w-4 h-4 fill-black" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      onOpenDownload(item);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-[#e50914]" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
