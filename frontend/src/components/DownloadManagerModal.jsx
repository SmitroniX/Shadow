import React from 'react';
import { 
  X, 
  Download, 
  Pause, 
  Play, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  FolderDown, 
  HardDriveDownload 
} from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';

export default function DownloadManagerModal() {
  const {
    downloads,
    isManagerOpen,
    setIsManagerOpen,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    clearCompleted,
    activeCount
  } = useDownloads();

  if (!isManagerOpen) return null;

  const hasCompleted = downloads.some(dl => dl.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      {/* Drawer Container */}
      <div className="w-full max-w-md bg-[#0d0e17] border-l border-white/10 h-full flex flex-col shadow-2xl animate-slideLeft">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#11121d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Download Manager
                {activeCount > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {activeCount} active
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">High-speed concurrent downloader</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasCompleted && (
              <button
                onClick={clearCompleted}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold"
                title="Clear Completed"
              >
                Clear Done
              </button>
            )}

            <button
              onClick={() => setIsManagerOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Downloads List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {downloads.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <FolderDown className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm font-semibold text-gray-300">No active downloads</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Select any Movie or Episode and click Download to start ultra-fast offline saving.
              </p>
            </div>
          ) : (
            downloads.map(dl => {
              const isDone = dl.status === 'completed';
              const isPaused = dl.status === 'paused';

              return (
                <div
                  key={dl.id}
                  className="p-3.5 rounded-xl bg-[#141522] border border-white/5 space-y-2.5 hover:border-white/15 transition-all"
                >
                  {/* Title & Quality */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {dl.title}
                      </h4>
                      {dl.episodeTitle && (
                        <p className="text-[11px] text-purple-300 line-clamp-1">
                          {dl.episodeTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-cyan-400 font-bold border border-white/10">
                          {dl.quality}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {dl.size}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isDone ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ready
                        </span>
                      ) : isPaused ? (
                        <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                          Paused
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono font-bold text-cyan-400">
                          {dl.speed}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-400'
                          : isPaused
                          ? 'bg-amber-400'
                          : 'bg-gradient-to-r from-purple-500 to-cyan-400'
                      }`}
                      style={{ width: `${dl.progress}%` }}
                    />
                  </div>

                  {/* Meta / Speed / ETA & Actions */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span>{dl.progress}%</span>
                      {!isDone && !isPaused && (
                        <span>• ETA: {dl.eta}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!isDone && (
                        <>
                          {isPaused ? (
                            <button
                              onClick={() => resumeDownload(dl.id)}
                              className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white"
                              title="Resume"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                            </button>
                          ) : (
                            <button
                              onClick={() => pauseDownload(dl.id)}
                              className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white"
                              title="Pause"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}

                      {/* Direct file open / save link if completed */}
                      {isDone && dl.url && (
                        <a
                          href={dl.url}
                          download={`${dl.title}_${dl.quality}.mp4`}
                          className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1"
                        >
                          <HardDriveDownload className="w-3 h-3" />
                          Save File
                        </a>
                      )}

                      <button
                        onClick={() => cancelDownload(dl.id)}
                        className="p-1 rounded hover:bg-red-950/60 text-gray-400 hover:text-red-400"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 bg-[#11121d] text-center text-xs text-gray-400">
          <p>Multi-threaded chunk acceleration enabled</p>
        </div>

      </div>
    </div>
  );
}
