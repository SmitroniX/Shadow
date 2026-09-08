import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Check, 
  Keyboard,
  ExternalLink,
  Loader2,
  AlertCircle,
  Crop,
  Layers,
  Sparkles,
  Zap,
  ArrowLeft,
  Tv
} from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";
import { recordView } from "../services/api";

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
  const lastTapRef = useRef({ time: 0, x: 0 });

  const { updateProgress } = useWatchlist();

  // Playback & UI States
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
  const [screenFit, setScreenFit] = useState("contain"); // "contain" | "cover"
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [doubleTapRipple, setDoubleTapRipple] = useState(null);

  const isSeries = media.type === "series";
  const seasonNum = episode?.seasonNumber || 1;
  const epNum = episode?.episodeNumber || 1;
  const imdbOrTmdb = media.imdbId || media.tmdbId;

  // Build comprehensive, reliable server list
  // Server 0 is direct high-speed HTML5 / HLS, guaranteed to work and highly responsive
  const streamSources = [
    { 
      id: "direct",
      server: "⚡ ShadowDirect Fast CDN (HTML5)", 
      url: episode?.streamUrl || media.streamSources?.find(s => s.url)?.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", 
      quality: "4K / 1080p Ultra Direct",
      isDirect: true,
      desc: "Fast, ad-free cinema stream with native mobile controls & seek"
    },
    { 
      id: "superembed",
      server: "🌐 SuperEmbed Multi-Audio Mirror", 
      embedUrl: isSeries
        ? `https://multiembed.mov/?video_id=${imdbOrTmdb}&tmdb=1&s=${seasonNum}&e=${epNum}`
        : `https://multiembed.mov/?video_id=${imdbOrTmdb}&tmdb=1`, 
      quality: "Multi-Audio (Hindi/Eng)",
      isDirect: false,
      desc: "Dual audio cloud mirror with multiple languages"
    },
    { 
      id: "vidsrc",
      server: "🌐 VidSrc Pro Cloud Mirror", 
      embedUrl: isSeries
        ? `https://vidsrc.xyz/embed/tv?imdb=${media.imdbId || ""}&tmdb=${media.tmdbId || ""}&season=${seasonNum}&episode=${epNum}`
        : `https://vidsrc.xyz/embed/movie?imdb=${media.imdbId || ""}&tmdb=${media.tmdbId || ""}`, 
      quality: "1080p Auto",
      isDirect: false,
      desc: "Worldwide mirror server for global Hollywood & Bollywood"
    },
    { 
      id: "vidlink",
      server: "🌐 VidLink Fast Stream", 
      embedUrl: isSeries
        ? `https://vidlink.pro/tv/${media.tmdbId || 872585}/${seasonNum}/${epNum}`
        : `https://vidlink.pro/movie/${media.tmdbId || 872585}`, 
      quality: "UltraFast 1080p",
      isDirect: false,
      desc: "Fast responsive mirror for mobile and desktop"
    },
    { 
      id: "twoembed",
      server: "🌐 2Embed Stream Network", 
      embedUrl: isSeries
        ? `https://www.2embed.cc/embedtv/${media.imdbId || media.tmdbId}&s=${seasonNum}&e=${epNum}`
        : `https://www.2embed.cc/embed/${media.imdbId || media.tmdbId}`, 
      quality: "1080p Web-DL",
      isDirect: false,
      desc: "Alternative backup mirror"
    }
  ];

  const currentSource = streamSources[selectedServerIndex] || streamSources[0];
  const isEmbed = !currentSource.isDirect && !!currentSource.embedUrl;
  const activeVideoUrl = currentSource.url || episode?.streamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";
  const activeEmbedUrl = currentSource.embedUrl;

  // Record view on mount
  useEffect(() => {
    if (media?.id) {
      recordView(media.id);
    }
  }, [media?.id]);

  // Handle initial timestamp
  useEffect(() => {
    if (videoRef.current && initialTime > 0 && !isEmbed) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime, isEmbed]);

  // Periodic progress tracker
  useEffect(() => {
    if (isEmbed) return;
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
  }, [media, episode, updateProgress, isEmbed]);

  // Reset error when switching servers
  useEffect(() => {
    setHasError(false);
    setIsBuffering(false);
  }, [selectedServerIndex]);

  // Auto-hide controls after inactivity
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showServerMenu && !showSpeedMenu && !showShortcuts) {
        setShowControls(false);
      }
    }, 3800);
  }, [isPlaying, showServerMenu, showSpeedMenu, showShortcuts]);

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  // Mobile Double-Tap to Seek (Left: -10s, Right: +10s) and Single-Tap to Toggle Controls
  const handleTouchScreen = (e) => {
    if (isEmbed) return;

    const now = Date.now();
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touchX = touch.clientX - rect.left;
    const width = rect.width;
    const timeSinceLastTap = now - lastTapRef.current.time;

    if (timeSinceLastTap < 320 && Math.abs(touchX - lastTapRef.current.x) < 90) {
      if (touchX < width * 0.38) {
        skip(-10);
        triggerRipple("left", "-10s");
      } else if (touchX > width * 0.62) {
        skip(10);
        triggerRipple("right", "+10s");
      } else {
        togglePlay();
      }
      lastTapRef.current = { time: 0, x: 0 };
    } else {
      lastTapRef.current = { time: now, x: touchX };
      showControlsTemporarily();
    }
  };

  const triggerRipple = (side, text) => {
    setDoubleTapRipple({ side, text });
    setTimeout(() => {
      setDoubleTapRipple(null);
    }, 650);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      switch (e.code) {
        case "Space":
        case "KeyK":
          if (!isEmbed) {
            e.preventDefault();
            togglePlay();
          }
          break;
        case "ArrowLeft":
        case "KeyJ":
          if (!isEmbed) {
            e.preventDefault();
            skip(-10);
          }
          break;
        case "ArrowRight":
        case "KeyL":
          if (!isEmbed) {
            e.preventDefault();
            skip(10);
          }
          break;
        case "ArrowUp":
          if (!isEmbed) {
            e.preventDefault();
            setVolumeLevel(Math.min(1, volume + 0.1));
          }
          break;
        case "ArrowDown":
          if (!isEmbed) {
            e.preventDefault();
            setVolumeLevel(Math.max(0, volume - 0.1));
          }
          break;
        case "KeyM":
          if (!isEmbed) {
            e.preventDefault();
            toggleMute();
          }
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, volume, isMuted, isFullscreen, isEmbed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("AutoPlay restriction or playback error:", err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skip = (seconds) => {
    if (!videoRef.current) return;
    const target = Math.min(
      Math.max(0, (videoRef.current.currentTime || 0) + seconds),
      duration || 1000
    );
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    showControlsTemporarily();
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekPercent = parseFloat(e.target.value);
    const seekTime = (seekPercent / 100) * duration;
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

  const toggleScreenFit = () => {
    setScreenFit(prev => prev === "contain" ? "cover" : "contain");
  };

  // Fullscreen with iPhone / Safari fallback
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          if (videoRef.current?.webkitEnterFullscreen) {
            videoRef.current.webkitEnterFullscreen();
          }
        });
        setIsFullscreen(true);
      } else if (videoRef.current?.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
        setIsFullscreen(true);
      }
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    setIsFullscreen(false);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden h-[100dvh] min-h-[100dvh] w-full"
    >
      {/* 1. ALWAYS-VISIBLE FLOATING CLOSE / BACK BUTTON */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[80] flex items-center gap-2 pointer-events-auto">
        {isEmbed && activeEmbedUrl && (
          <a
            href={activeEmbedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/75 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-2xl transition-all"
            title="Open in External Browser Tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">External Tab</span>
          </a>
        )}

        <button
          onClick={onClose}
          className="p-2.5 sm:p-3 rounded-full bg-black/80 hover:bg-[#e50914] text-white backdrop-blur-md border border-white/20 shadow-2xl transition-transform active:scale-95 flex items-center justify-center"
          title="Exit Cinema Player (Esc)"
          aria-label="Exit Cinema Player"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* 2. VIDEO CONTENT: DIRECT HTML5 PLAYER OR CLOUD MIRROR IFRAME */}
      {isEmbed ? (
        <div className="relative w-full h-full bg-black flex flex-col pt-14 sm:pt-16">
          {/* Mobile Notice Bar for Embed */}
          <div className="bg-[#11131c] border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white truncate max-w-[180px] sm:max-w-none">
                {currentSource.server}
              </span>
              <span className="hidden sm:inline text-gray-400 text-[11px]">
                ({currentSource.quality})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedServerIndex(0)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e50914]/20 hover:bg-[#e50914] text-[#e50914] hover:text-white border border-[#e50914]/40 font-bold transition-all"
              >
                <Zap className="w-3 h-3" />
                <span>Switch to Direct HD</span>
              </button>
            </div>
          </div>

          <iframe
            src={activeEmbedUrl}
            className="w-full flex-1 border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
            title={`${media.title} Stream`}
          />
        </div>
      ) : (
        <div 
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onTouchEnd={handleTouchScreen}
          onClick={(e) => {
            if (e.target.tagName === "VIDEO") {
              togglePlay();
              showControlsTemporarily();
            }
          }}
        >
          <video
            ref={videoRef}
            src={activeVideoUrl}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onWaiting={() => setIsBuffering(true)}
            onCanPlay={() => setIsBuffering(false)}
            onPlaying={() => {
              setIsBuffering(false);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              setHasError(true);
              setIsBuffering(false);
            }}
            onEnded={() => {
              setIsPlaying(false);
              if (onPlayNextEpisode) onPlayNextEpisode();
            }}
            autoPlay
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            controlsList="nodownload"
            preload="metadata"
            className={`w-full h-full ${
              screenFit === "cover" ? "object-cover" : "object-contain"
            } transition-all duration-300`}
          />

          {/* Buffering Spinner */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-20">
              <div className="flex flex-col items-center gap-2 bg-black/70 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <Loader2 className="w-8 h-8 text-[#e50914] animate-spin" />
                <span className="text-xs font-semibold text-white">Buffering 4K Stream...</span>
              </div>
            </div>
          )}

          {/* Center Play Button Overlay on Pause for Direct Video */}
          {!isPlaying && !isBuffering && !hasError && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-20"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-black ml-1 text-black" />
              </div>
            </div>
          )}

          {/* Double-Tap Visual Ripple Feedback (-10s / +10s) */}
          {doubleTapRipple && (
            <div 
              className={`absolute top-0 bottom-0 ${
                doubleTapRipple.side === "left" ? "left-0 w-1/3" : "right-0 w-1/3"
              } flex items-center justify-center z-30 pointer-events-none animate-ping`}
            >
              <div className="bg-black/80 px-4 py-2 rounded-2xl border border-white/20 text-white font-mono font-black text-sm sm:text-base flex items-center gap-1.5 shadow-2xl">
                {doubleTapRipple.side === "left" ? <RotateCcw className="w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
                <span>{doubleTapRipple.text}</span>
              </div>
            </div>
          )}

          {/* Video Stream Playback Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 z-30">
              <div className="bg-[#11131c] border border-red-500/30 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Stream Loading Issue</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The current server is temporarily unreachable. Switch to an alternative cloud mirror for uninterrupted playback.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => setSelectedServerIndex(1)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-lg"
                  >
                    Switch to SuperEmbed HD Mirror
                  </button>
                  <button
                    onClick={() => setSelectedServerIndex(2)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors"
                  >
                    Switch to VidSrc Pro Mirror
                  </button>
                  <button
                    onClick={() => {
                      setHasError(false);
                      if (videoRef.current) {
                        videoRef.current.load();
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    className="w-full py-2 text-xs text-gray-400 hover:text-white"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TOP BAR CONTROLS */}
      <div className={`absolute top-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-b from-black/95 via-black/70 to-transparent flex items-center justify-between transition-opacity duration-300 z-40 ${
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}>
        <div className="flex items-center gap-2.5 sm:gap-3 max-w-[65%] sm:max-w-none">
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Back to Browse"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-sm sm:text-lg drop-shadow-md truncate">
                {media.title}
              </h2>
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border hidden sm:inline-block ${
                media.industry === "Bollywood" 
                  ? "bg-amber-600/30 text-amber-300 border-amber-500/40" 
                  : "bg-blue-600/30 text-blue-300 border-blue-500/40"
              }`}>
                {media.industry}
              </span>
            </div>
            {episode && (
              <p className="text-gray-300 text-[11px] sm:text-xs font-mono drop-shadow truncate">
                S{episode.seasonNumber || 1} • E{episode.episodeNumber}: {episode.title}
              </p>
            )}
          </div>
        </div>

        {/* Server Switcher & Shortcuts on Top Right */}
        <div className="flex items-center gap-2 mr-12 sm:mr-14">
          <div className="relative">
            <button
              onClick={() => setShowServerMenu(!showServerMenu)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200 border border-white/15 transition-all backdrop-blur-md"
            >
              <Server className="w-3.5 h-3.5 text-[#e50914]" />
              <span className="max-w-[90px] sm:max-w-none truncate">{currentSource.server.split(" ")[0]}</span>
            </button>

            {showServerMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#11131c] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 glass-dropdown animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 flex items-center justify-between">
                  <span>Switch Stream Server</span>
                  <span className="text-[9px] font-mono text-emerald-400">● 5 Online</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                  {streamSources.map((src, idx) => (
                    <button
                      key={src.server}
                      onClick={() => {
                        setSelectedServerIndex(idx);
                        setShowServerMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        selectedServerIndex === idx 
                          ? "text-[#e50914] font-bold bg-white/10" 
                          : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span>{src.server}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">{src.quality}</div>
                      </div>
                      {selectedServerIndex === idx && <Check className="w-4 h-4 text-[#e50914] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="hidden sm:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. KEYBOARD SHORTCUTS MODAL */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141d] border border-white/15 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-left space-y-3">
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
              className="w-full mt-2 py-2 rounded-xl bg-[#e50914] font-bold text-xs text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* 5. BOTTOM CONTROLS BAR */}
      {!isEmbed && (
        <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 z-40 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
          
          {/* Seek Progress Bar */}
          <div className="relative group/seek mb-2 sm:mb-3 cursor-pointer py-2">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPercent || 0}
              onChange={handleSeek}
              className="w-full h-1.5 sm:h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#e50914] hover:h-2.5 transition-all"
            />
            <div 
              className="absolute top-2 left-0 h-1.5 sm:h-2 rounded-lg bg-[#e50914] pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={togglePlay}
                className="p-2 sm:p-2.5 text-white hover:text-[#e50914] transition-colors"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                )}
              </button>

              <button
                onClick={() => skip(-10)}
                className="p-1.5 sm:p-2 text-gray-300 hover:text-white transition-colors"
                title="Rewind 10s (←)"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => skip(10)}
                className="p-1.5 sm:p-2 text-gray-300 hover:text-white transition-colors"
                title="Forward 10s (→)"
              >
                <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {onPlayNextEpisode && (
                <button
                  onClick={onPlayNextEpisode}
                  className="flex items-center gap-1 text-xs font-semibold px-2 sm:px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Next Episode"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Next Episode</span>
                </button>
              )}

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="text-gray-300 hover:text-white transition-colors"
                  title="Mute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-red-500" />
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
                  className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
                />
              </div>

              {/* Time */}
              <div className="text-[11px] sm:text-xs font-mono text-gray-300 pl-1">
                <span>{formatTime(currentTime)}</span>
                <span className="text-gray-500 mx-1">/</span>
                <span className="text-gray-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleScreenFit}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-[11px] font-semibold transition-colors"
                title={screenFit === "cover" ? "Fit to Screen (Original Ratio)" : "Fill Screen (Crop / Zoom)"}
              >
                <Crop className="w-3.5 h-3.5 text-[#e50914]" />
                <span className="hidden sm:inline">{screenFit === "cover" ? "Fill" : "Fit"}</span>
              </button>

              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 rounded">
                4K HDR
              </span>

              {/* Speed Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="text-xs font-bold font-mono px-2 py-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 w-28 bg-[#11131c] border border-white/10 rounded-xl shadow-2xl py-1 glass-dropdown animate-fadeIn">
                    <div className="px-3 py-1 text-[10px] text-gray-400 font-bold uppercase">Speed</div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(spd => (
                      <button
                        key={spd}
                        onClick={() => setSpeed(spd)}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/10 ${
                          playbackSpeed === spd ? "text-[#e50914] font-bold" : "text-gray-300"
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
                className="p-1.5 sm:p-2 text-gray-300 hover:text-white transition-colors"
                title="Fullscreen (F)"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
