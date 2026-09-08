import React, { useState, useEffect } from "react";
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
  X,
  Globe2,
  Sparkles
} from "lucide-react";
import { useDownloads } from "../context/DownloadContext";
import { useWatchlist } from "../context/WatchlistContext";

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  industryFilter,
  setIndustryFilter,
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "all", label: "Home" },
    { id: "bollywood", label: "Bollywood 🇮🇳", filter: "Bollywood" },
    { id: "hollywood", label: "Hollywood 🇺🇸", filter: "Hollywood" },
    { id: "movie", label: "Movies" },
    { id: "series", label: "Web Series" },
    { id: "top10", label: "Top 10 IMDb" },
    { id: "watchlist", label: `Watchlist (${watchlist.length})` },
  ];

  const handleNavClick = (item) => {
    if (item.id === "bollywood") {
      setCurrentTab("movie");
      setIndustryFilter("Bollywood");
    } else if (item.id === "hollywood") {
      setCurrentTab("movie");
      setIndustryFilter("Hollywood");
    } else {
      setCurrentTab(item.id);
      setIndustryFilter("All");
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#090a0f]/95 backdrop-blur-md border-b border-white/[0.08] shadow-2xl py-2.5 sm:py-3" 
          : "bg-gradient-to-b from-black/95 via-black/60 to-transparent py-3 sm:py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo */}
            <div 
              onClick={() => { setCurrentTab("all"); setIndustryFilter("All"); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#e50914] flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tighter leading-none text-white">
                  SHADOW<span className="text-[#e50914]">PLEX</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-semibold tracking-widest text-gray-400 uppercase hidden xs:inline">
                  Cinema • Streaming • 4K UHD
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.08]">
              {navItems.map(item => {
                const isActive = (item.id === "bollywood" && industryFilter === "Bollywood") ||
                                 (item.id === "hollywood" && industryFilter === "Hollywood") ||
                                 (item.id === currentTab && industryFilter === "All");

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#e50914] text-white shadow-md"
                        : "text-gray-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search Button */}
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all group"
                title="Search Movies, Series, Cast (⌘K)"
              >
                <Search className="w-4 h-4 text-gray-300 group-hover:text-[#e50914] transition-colors" />
                <span className="hidden sm:inline">Search</span>
                <span className="hidden sm:inline text-[10px] text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">⌘K</span>
              </button>

              {/* Downloads Manager Toggle */}
              <button
                onClick={() => setIsManagerOpen(!isManagerOpen)}
                className="relative p-2 sm:p-2.5 text-gray-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all"
                title="Download Manager"
              >
                <Download className={`w-4 h-4 ${activeCount > 0 ? "text-[#e50914] animate-bounce" : "text-gray-300"}`} />
                {activeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e50914] text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Admin CMS Button */}
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all"
                title="ShadowPlex CMS"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>CMS</span>
              </button>

              {/* Mobile Menu Button for Extra Options */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 text-gray-300 hover:text-white bg-white/5 rounded-xl border border-white/10"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

          {/* Mobile Dropdown Menu (Secondary list) */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-2 pt-2 border-t border-white/10 bg-[#0d0f17]/95 backdrop-blur-xl rounded-2xl p-3 space-y-1.5 glass-panel shadow-2xl animate-fadeIn">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-amber-400 bg-white/5"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin CMS Console
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Persistent Native App Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090f]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => { setCurrentTab("all"); setIndustryFilter("All"); }}
          className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${
            currentTab === "all" && industryFilter === "All" ? "text-[#e50914] font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => { setCurrentTab("movie"); setIndustryFilter("Bollywood"); }}
          className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${
            currentTab === "movie" && industryFilter === "Bollywood" ? "text-amber-400 font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Bollywood</span>
        </button>

        <button
          onClick={() => { setCurrentTab("movie"); setIndustryFilter("Hollywood"); }}
          className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${
            currentTab === "movie" && industryFilter === "Hollywood" ? "text-blue-400 font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <Globe2 className="w-5 h-5" />
          <span className="text-[10px]">Hollywood</span>
        </button>

        <button
          onClick={() => { setCurrentTab("series"); setIndustryFilter("All"); }}
          className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${
            currentTab === "series" ? "text-[#e50914] font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px]">Series</span>
        </button>

        <button
          onClick={() => setIsManagerOpen(!isManagerOpen)}
          className="relative flex flex-col items-center gap-0.5 p-1.5 text-gray-400 hover:text-white transition-colors"
        >
          <Download className="w-5 h-5" />
          {activeCount > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-[#e50914] text-[9px] font-bold text-white rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
          <span className="text-[10px]">Downloads</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-0.5 p-1.5 text-gray-400 hover:text-white transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </button>
      </div>
    </>
  );
}
