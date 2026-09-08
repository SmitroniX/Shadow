import React from 'react';
import { Download, CheckCircle, Info } from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';

export default function Toast() {
  const { toastMessage } = useDownloads();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#121320] border border-cyan-500/40 text-white shadow-2xl shadow-cyan-950/60 backdrop-blur-xl">
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white">
          <Download className="w-4 h-4" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-cyan-200">
          {toastMessage}
        </span>
      </div>
    </div>
  );
}
