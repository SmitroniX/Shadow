import React, { createContext, useContext, useState, useEffect } from 'react';
import { recordDownload } from '../services/api';

const DownloadContext = createContext();

export function DownloadProvider({ children }) {
  const [downloads, setDownloads] = useState(() => {
    try {
      const saved = localStorage.getItem('shadowplex_downloads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem('shadowplex_downloads', JSON.stringify(downloads));
  }, [downloads]);

  // Simulate progress for items in 'downloading' state
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prev => {
        let changed = false;
        const next = prev.map(dl => {
          if (dl.status === 'downloading') {
            changed = true;
            const inc = Math.random() * 4 + 2; // +2% to +6% per tick
            const newProgress = Math.min(100, Math.round(dl.progress + inc));
            const isDone = newProgress >= 100;
            return {
              ...dl,
              progress: newProgress,
              status: isDone ? 'completed' : 'downloading',
              speed: isDone ? 'Completed' : `${(Math.random() * 15 + 20).toFixed(1)} MB/s`,
              eta: isDone ? '0s' : `${Math.max(1, Math.round((100 - newProgress) / 3))}s`
            };
          }
          return dl;
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const startDownload = ({ mediaId, title, quality, size, url, episodeTitle }) => {
    // Record download on backend
    if (mediaId) {
      recordDownload(mediaId);
    }

    const downloadId = `${mediaId || 'custom'}-${quality}-${Date.now()}`;
    const newDownload = {
      id: downloadId,
      mediaId,
      title,
      episodeTitle: episodeTitle || null,
      quality,
      size: size || '2.4 GB',
      url,
      progress: 0,
      status: 'downloading',
      speed: '25.4 MB/s',
      eta: '30s',
      timestamp: Date.now()
    };

    setDownloads(prev => [newDownload, ...prev]);
    showToast(`Started downloading "${title}" [${quality}]`);

    // Optionally trigger real browser direct download if valid link
    if (url && (url.endsWith('.mp4') || url.endsWith('.mkv') || url.startsWith('http'))) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_${quality}.mp4`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const pauseDownload = (id) => {
    setDownloads(prev => prev.map(dl => 
      dl.id === id ? { ...dl, status: 'paused', speed: 'Paused' } : dl
    ));
  };

  const resumeDownload = (id) => {
    setDownloads(prev => prev.map(dl => 
      dl.id === id ? { ...dl, status: 'downloading' } : dl
    ));
  };

  const cancelDownload = (id) => {
    setDownloads(prev => prev.filter(dl => dl.id !== id));
    showToast('Download cancelled');
  };

  const clearCompleted = () => {
    setDownloads(prev => prev.filter(dl => dl.status === 'downloading' || dl.status === 'paused'));
  };

  const activeCount = downloads.filter(dl => dl.status === 'downloading').length;

  return (
    <DownloadContext.Provider value={{
      downloads,
      isManagerOpen,
      setIsManagerOpen,
      startDownload,
      pauseDownload,
      resumeDownload,
      cancelDownload,
      clearCompleted,
      activeCount,
      toastMessage
    }}>
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownloads() {
  return useContext(DownloadContext);
}
