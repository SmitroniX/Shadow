import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Maximize, 
  Minimize, 
  X, 
  Server, 
  SkipForward, 
  Settings, 
  Check, 
  Keyboard
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { recordView } from '../services/api';

export default function ShadowPlayer({ 
  media, 
  episode = null, 
  initialTime = 0,
  onClose,
  onPlayNextEpisode
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const { updateProgress } = useWatchlist();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Determine current stream URL
  const streamSources = media.streamSources || [
    { server: 'ShadowStream VIP (4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', quality: '4K Ultra HD' },
    { server: 'Cloud CDN Fast (1080p)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p FHD' }
  ];

  const currentSource = streamSources[selectedServerIndex] || streamSources[0];
  const activeVideoUrl = episode?.streamUrl || currentSource?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
  const isEmbedServer = !!currentSource?.embedUrl && !episode;

  // Record view on open
  useEffect(() => {
    if (media?.id) {
      recordView(media.id);
    }
  }, [media?.id]);

  // Handle initial timestamp
  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  // Periodic progress tracker
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        updateProgress(
          media, 
          videoRef.current.currentTime, 
          videoRef.current.duration,
          episode ? {
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            streamUrl: episode.streamUrl
          } : null
        );
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [media, episode, updateProgress]);

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowServerMenu(false);
      }
    }, 3500);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
        case 'KeyL':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolumeLevel(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolumeLevel(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen?.();
          } else {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, isFullscreen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skip = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(0, videoRef.current.currentTime + seconds),
      duration
    );
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const setVolumeLevel = (val) => {
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const setSpeed = (spd) => {
    setPlaybackSpeed(spd);
    if (videoRef.current) {
      videoRef.current.playbackRate = spd;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Video Element or Embed Iframe */}
      {isEmbedServer ? (
        <iframe
          src={currentSource.embedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          title="Streaming Mirror"
        />
      ) : (
        <video
          ref={videoRef}
          src={activeVideoUrl}
          onClick={togglePlay}
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => {
            setIsPlaying(false);
            if (onPlayNextEpisode) onPlayNextEpisode();
          }}
          autoPlay
          playsInline
          className="w-full h-full object-contain cursor-pointer"
        />
      )}

      {/* Center Play Button Overlay on Pause */}
      {!isPlaying && !isEmbedServer && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 hover:scale-110 active:scale-95 transition-transform">
            <Play className="w-10 h-10 fill-white ml-1.5" />
          </div>
        </div>
      )}

      {/* Top Bar Controls */}
      <div className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <h2 className="text-white font-bold text-base sm:text-lg drop-shadow-md">
              {media.title}
            </h2>
            {episode && (
              <p className="text-cyan-300 text-xs font-mono drop-shadow">
                S{episode.seasonNumber || 1} • E{episode.episodeNumber}: {episode.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Server Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowServerMenu(!showServerMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200 border border-white/10 transition-colors backdrop-blur-md"
            >
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span>{currentSource.server}</span>
            </button>

            {showServerMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#13141f] border border-white/10 rounded-xl shadow-2xl py-1 z-50 glass-dropdown">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/5">
                  Select Streaming Server
                </div>
                {streamSources.map((src, idx) => (
                  <button
                    key={src.server}
                    onClick={() => {
                      setSelectedServerIndex(idx);
                      setShowServerMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 ${
                      selectedServerIndex === idx ? 'text-cyan-400 font-bold bg-white/5' : 'text-gray-300'
                    }`}
                  >
                    <div>
                      <div>{src.server}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{src.quality}</div>
                    </div>
                    {selectedServerIndex === idx && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Info */}
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Close Player */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-red-600/80 text-white transition-colors"
            title="Exit Player (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12131e] border border-white/15 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-white text-base">Cinema Player Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex justify-between"><span>Play / Pause</span><kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">Space / K</kbd></div>
              <div className="flex justify-between"><span>Rewind 10 Seconds</span><kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">← / J</kbd></div>
              <div className="flex justify-between"><span>Forward 10 Seconds</span><kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">→ / L</kbd></div>
              <div className="flex justify-between"><span>Volume Up / Down</span><kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">↑ / ↓</kbd></div>
              <div className="flex justify-between"><span>Mute / Unmute</span><kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">M</kbd></div>
              <div className="flex justify-between"><span>Toggle Fullscreen</span><kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">F</kbd></div>
              <div className="flex justify-between"><span>Exit Player</span><kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">Esc</kbd></div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full mt-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      {!isEmbedServer && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          
          {/* Seek Progress Bar */}
          <div className="relative group/seek mb-3 cursor-pointer">
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent || 0}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2.5 transition-all"
            />
            {/* Filled bar track */}
            <div 
              className="absolute top-0 left-0 h-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 pointer-events-none group-hover/seek:h-2.5 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Left Controls: Play, Skip, Volume, Time */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:text-cyan-400 transition-colors"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              {/* 10s Rewind */}
              <button
                onClick={() => skip(-10)}
                className="p-1.5 text-gray-300 hover:text-white transition-colors"
                title="Rewind 10s (←)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* 10s Forward */}
              <button
                onClick={() => skip(10)}
                className="p-1.5 text-gray-300 hover:text-white transition-colors"
                title="Forward 10s (→)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Next Episode button (if available) */}
              {onPlayNextEpisode && (
                <button
                  onClick={onPlayNextEpisode}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Next Episode"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Next</span>
                </button>
              )}

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="text-gray-300 hover:text-white transition-colors"
                  title="Mute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Time Display */}
              <div className="text-xs font-mono text-gray-300">
                <span>{formatTime(currentTime)}</span>
                <span className="text-gray-500 mx-1">/</span>
                <span className="text-gray-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Quality, Speed, Fullscreen */}
            <div className="flex items-center gap-3">
              
              {/* Quality indicator pill */}
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded">
                4K HDR
              </span>

              {/* Playback Speed Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="text-xs font-bold font-mono px-2 py-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 w-28 bg-[#13141f] border border-white/10 rounded-xl shadow-2xl py-1 glass-dropdown">
                    <div className="px-3 py-1 text-[10px] text-gray-400 font-bold uppercase">Speed</div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(spd => (
                      <button
                        key={spd}
                        onClick={() => setSpeed(spd)}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/10 ${
                          playbackSpeed === spd ? 'text-cyan-400 font-bold' : 'text-gray-300'
                        }`}
                      >
                        <span>{spd}x</span>
                        {playbackSpeed === spd && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-gray-300 hover:text-white transition-colors"
                title="Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
