import React from 'react';
import { Play, X, Clock } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export default function ContinueWatchingRow({ onResumePlay }) {
  const { history, clearHistoryItem } = useWatchlist();

  if (!history || history.length === 0) return null;

  const formatTime = (secs) => {
    if (!secs) return '0m';
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <div className="my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2.5 mb-4">
        <Clock className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Continue Watching
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
        {history.map(item => (
          <div
            key={`${item.id}-${item.episodeNumber || 'mov'}`}
            className="group relative w-60 sm:w-72 flex-shrink-0 rounded-xl overflow-hidden bg-[#13141f] border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer shadow-lg"
            onClick={() => onResumePlay(item)}
          >
            {/* Backdrop image */}
            <div className="relative aspect-video w-full overflow-hidden bg-black/40">
              <img
                src={item.backdrop || item.poster}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

              {/* Play overlay button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-cyan-500/90 text-black flex items-center justify-center group-hover:scale-110 shadow-lg shadow-cyan-500/30 transition-transform">
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearHistoryItem(item.id, item.episodeNumber);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-red-600 text-gray-300 hover:text-white transition-colors"
                title="Remove from history"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Progress Bar at Bottom of Image */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" 
                  style={{ width: `${item.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-300">
                  {item.title}
                </h4>
                <span className="text-[10px] text-cyan-400 font-semibold font-mono">
                  {item.progress}%
                </span>
              </div>

              {item.episodeTitle && (
                <p className="text-[11px] text-purple-300 line-clamp-1 mt-0.5">
                  S{item.seasonNumber || 1} E{item.episodeNumber}: {item.episodeTitle}
                </p>
              )}

              <p className="text-[10px] text-gray-400 mt-1">
                {formatTime(item.currentTime)} watched of {formatTime(item.duration)}
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
