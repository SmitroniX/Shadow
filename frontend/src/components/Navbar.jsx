import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Film, 
  Tv, 
  Download, 
  Search, 
  Bookmark, 
  ShieldCheck, 
  Flame, 
  Menu, 
  X 
} from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';
import { useWatchlist } from '../context/WatchlistContext';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  onOpenSearch, 
  onOpenAdmin 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isManagerOpen, setIsManagerOpen, activeCount } = useDownloads();
  const { watchlist } = useWatchlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'all', label: 'Home', icon: Flame },
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'series', label: 'Web Series', icon: Tv },
    { id: 'top10', label: 'Top 10', icon: Flame },
    { id: 'watchlist', label: `Watchlist (${watchlist.length})`, icon: Bookmark },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#0b0c14]/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3' 
        : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => { setCurrentTab('all'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d0e17] rounded-[10px] flex items-center justify-center">
                <Play className="w-5 h-5 text-cyan-400 fill-cyan-400 ml-0.5 group-hover:text-purple-400 group-hover:fill-purple-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight leading-none text-white">
                SHADOW<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">PLEX</span>
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-gray-400 uppercase">
                Stream & Download
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-lg px-3 py-1.5 rounded-full border border-white/10">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
              title="Search Movies & Series"
            >
              <Search className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs text-gray-400 font-mono">⌘K</span>
            </button>

            {/* Downloads Manager Toggle */}
            <button
              onClick={() => setIsManagerOpen(!isManagerOpen)}
              className="relative p-2.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              title="Download Manager"
            >
              <Download className={`w-4 h-4 ${activeCount > 0 ? 'text-cyan-400 animate-bounce' : 'text-gray-300'}`} />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-[10px] font-bold text-black rounded-full flex items-center justify-center animate-pulse">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Admin CMS Button */}
            <button
              onClick={onOpenAdmin}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl transition-all shadow-sm"
              title="ShadowPlex CMS"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Admin CMS</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white bg-white/5 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10 bg-[#0d0e17]/95 rounded-2xl p-4 space-y-2 glass-panel shadow-2xl">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/30"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Admin Management Console
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
