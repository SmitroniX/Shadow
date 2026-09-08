import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('shadowplex_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('shadowplex_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('shadowplex_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('shadowplex_history', JSON.stringify(history));
  }, [history]);

  const toggleWatchlist = (media) => {
    setWatchlist(prev => {
      const exists = prev.some(item => item.id === media.id);
      if (exists) {
        return prev.filter(item => item.id !== media.id);
      } else {
        return [...prev, media];
      }
    });
  };

  const isInWatchlist = (id) => {
    return watchlist.some(item => item.id === id);
  };

  const updateProgress = (media, currentTime, duration, episodeInfo = null) => {
    if (!duration || duration <= 0) return;
    const progress = Math.min(100, Math.round((currentTime / duration) * 100));

    setHistory(prev => {
      const filtered = prev.filter(item => {
        if (episodeInfo && episodeInfo.episodeNumber) {
          return !(item.id === media.id && item.episodeNumber === episodeInfo.episodeNumber);
        }
        return item.id !== media.id;
      });

      const entry = {
        id: media.id,
        title: media.title,
        poster: media.poster,
        backdrop: media.backdrop,
        type: media.type,
        currentTime,
        duration,
        progress,
        episodeTitle: episodeInfo ? episodeInfo.title : null,
        episodeNumber: episodeInfo ? episodeInfo.episodeNumber : null,
        seasonNumber: episodeInfo ? episodeInfo.seasonNumber : null,
        streamUrl: episodeInfo ? episodeInfo.streamUrl : (media.streamSources?.[0]?.url || ''),
        lastWatched: Date.now()
      };

      return [entry, ...filtered].slice(0, 15);
    });
  };

  const clearHistoryItem = (id, episodeNumber = null) => {
    setHistory(prev => prev.filter(item => {
      if (episodeNumber !== null) {
        return !(item.id === id && item.episodeNumber === episodeNumber);
      }
      return item.id !== id;
    }));
  };

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      history,
      toggleWatchlist,
      isInWatchlist,
      updateProgress,
      clearHistoryItem
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
