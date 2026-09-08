import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = "1cf50e6248dc270629e802686245c2c8";

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

const movieConfigs = [
  // Hollywood Blockbusters
  { id: 872585, industry: 'Hollywood', rank: 1, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
  { id: 693134, industry: 'Hollywood', rank: 2, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: 533535, industry: 'Hollywood', rank: 5, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { id: 157336, industry: 'Hollywood', rank: 4, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
  { id: 155, industry: 'Hollywood', rank: 7, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: 27205, industry: 'Hollywood', rank: 9, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4" },
  { id: 569094, industry: 'Hollywood', rank: 11, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
  { id: 76600, industry: 'Hollywood', rank: 13, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
  { id: 558449, industry: 'Hollywood', rank: 15, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
  { id: 603692, industry: 'Hollywood', rank: 17, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  
  // Bollywood Blockbusters
  { id: 872906, industry: 'Bollywood', rank: 3, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: 781732, industry: 'Bollywood', rank: 6, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { id: 1163258, industry: 'Bollywood', rank: 8, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
  { id: 1112426, industry: 'Bollywood', rank: 10, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4" },
  { id: 801688, industry: 'Bollywood', rank: 12, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
  { id: 864692, industry: 'Bollywood', rank: 14, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
  { id: 579974, industry: 'Bollywood', rank: 16, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: 587412, industry: 'Bollywood', rank: 18, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { id: 360814, industry: 'Bollywood', rank: 19, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: 20453, industry: 'Bollywood', rank: 20, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
  { id: 496331, industry: 'Bollywood', rank: 21, sampleStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4" }
];

const seriesConfigs = [
  // Hollywood Web Series
  { id: 1396, industry: 'Hollywood', rank: 1 }, // Breaking Bad
  { id: 66732, industry: 'Hollywood', rank: 2 }, // Stranger Things
  { id: 76479, industry: 'Hollywood', rank: 4 }, // The Boys
  { id: 94997, industry: 'Hollywood', rank: 6 }, // House of the Dragon
  { id: 100088, industry: 'Hollywood', rank: 7 }, // The Last of Us
  { id: 1399, industry: 'Hollywood', rank: 9 }, // Game of Thrones
  
  // Bollywood / Indian Web Series
  { id: 84105, industry: 'Bollywood', rank: 3 }, // Mirzapur
  { id: 93352, industry: 'Bollywood', rank: 5 }, // The Family Man
  { id: 101352, industry: 'Bollywood', rank: 8 }, // Panchayat
  { id: 79352, industry: 'Bollywood', rank: 10 }, // Sacred Games
  { id: 132117, industry: 'Bollywood', rank: 11 }, // Farzi
  { id: 111188, industry: 'Bollywood', rank: 12 } // Scam 1992
];

async function run() {
  console.log("Fetching real Hollywood & Bollywood movies from TMDB...");
  const catalog = [];

  for (const cfg of movieConfigs) {
    const data = await fetchJson(`https://api.themoviedb.org/3/movie/${cfg.id}?api_key=${API_KEY}&append_to_response=credits,external_ids`);
    if (!data || !data.title) continue;

    const imdbId = data.external_ids?.imdb_id || `tt${cfg.id}`;
    const director = data.credits?.crew?.find(c => c.job === 'Director')?.name || 'Director';
    const cast = data.credits?.cast?.slice(0, 5).map(c => c.name) || [];
    const genres = data.genres?.map(g => g.name) || ['Action'];
    const runtimeMins = data.runtime || 135;
    const durationFormatted = `${Math.floor(runtimeMins / 60)}h ${runtimeMins % 60}m`;
    const ratingScore = parseFloat((data.vote_average || 7.8).toFixed(1));

    const item = {
      id: `sp-mov-${data.id}`,
      tmdbId: data.id,
      imdbId: imdbId,
      title: data.title,
      type: 'movie',
      industry: cfg.industry,
      audio: cfg.industry === 'Bollywood' ? 'Hindi (Original 5.1)' : 'Dual Audio [Hindi + English]',
      tagline: data.tagline || (cfg.industry === 'Bollywood' ? "Blockbuster Cinema" : "Experience It in IMAX"),
      synopsis: data.overview || "A critically acclaimed blockbuster that captivated audiences worldwide.",
      releaseYear: new Date(data.release_date || '2023-01-01').getFullYear(),
      rating: data.adult ? 'A / 18+' : 'UA / PG-13',
      imdb: ratingScore,
      duration: durationFormatted,
      genres: genres,
      director: director,
      cast: cast,
      featured: cfg.rank <= 4,
      trending: true,
      top10: cfg.rank <= 10 ? cfg.rank : null,
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
      backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
      streamSources: [
        { 
          server: "VidSrc 4K Server (Live Stream)", 
          embedUrl: `https://vidsrc.to/embed/movie/${imdbId}`, 
          quality: "4K / 1080p Auto" 
        },
        { 
          server: "SuperEmbed HD (Dual Audio)", 
          embedUrl: `https://multiembed.mov/?video_id=${imdbId}&tmdb=1`, 
          quality: "Multi-Audio Mirrors" 
        },
        { 
          server: "VidLink Fast CDN", 
          embedUrl: `https://vidlink.pro/movie/${data.id}`, 
          quality: "UltraFast 1080p" 
        },
        { 
          server: "ShadowDirect HighSpeed MP4", 
          url: cfg.sampleStream, 
          quality: "Direct HTML5 Stream" 
        }
      ],
      downloadLinks: [
        { 
          quality: "4K 2160p HDR (Dual Audio)", 
          size: "14.8 GB", 
          codec: "HEVC 10-bit Dolby Atmos", 
          server: "ShadowFast VIP Cloud", 
          url: cfg.sampleStream 
        },
        { 
          quality: "1080p Full HD Bluray", 
          size: "3.6 GB", 
          codec: "H.264 DD+ 5.1", 
          server: "Google Drive HighSpeed Mirror", 
          url: cfg.sampleStream 
        },
        { 
          quality: "720p HD Dual Audio", 
          size: "1.4 GB", 
          codec: "x264 Web-DL", 
          server: "Mega Cloud Fast Mirror", 
          url: cfg.sampleStream 
        },
        { 
          quality: "480p Mobile Saver", 
          size: "550 MB", 
          codec: "HEVC Mobile (Data Saver)", 
          server: "Direct Mobile Link", 
          url: cfg.sampleStream 
        }
      ],
      views: Math.floor(Math.random() * 800000 + 450000),
      downloads: Math.floor(Math.random() * 280000 + 120000)
    };

    catalog.push(item);
    console.log(`✓ Added Movie: ${item.title} (${cfg.industry}) - IMDb: ${item.imdb}`);
  }

  console.log("\nFetching real Hollywood & Bollywood web series from TMDB...");
  for (const cfg of seriesConfigs) {
    const data = await fetchJson(`https://api.themoviedb.org/3/tv/${cfg.id}?api_key=${API_KEY}&append_to_response=credits,external_ids`);
    if (!data || !data.name) continue;

    const imdbId = data.external_ids?.imdb_id || `tt${cfg.id}`;
    const creator = data.created_by?.[0]?.name || data.credits?.crew?.find(c => c.job === 'Executive Producer')?.name || 'Creator';
    const cast = data.credits?.cast?.slice(0, 5).map(c => c.name) || [];
    const genres = data.genres?.map(g => g.name) || ['Drama'];
    const ratingScore = parseFloat((data.vote_average || 8.6).toFixed(1));

    // Fetch details of Season 1
    const s1Data = await fetchJson(`https://api.themoviedb.org/3/tv/${cfg.id}/season/1?api_key=${API_KEY}`);
    const episodesList = (s1Data?.episodes || []).slice(0, 8).map(ep => ({
      episodeNumber: ep.episode_number,
      seasonNumber: 1,
      title: ep.name || `Episode ${ep.episode_number}`,
      duration: `${ep.runtime || 52}m`,
      overview: ep.overview || "An intense, gripping episode driving the central conflict forward.",
      thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : (data.backdrop_path ? `https://image.tmdb.org/t/p/w500${data.backdrop_path}` : 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500'),
      streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      embedUrl: `https://vidsrc.to/embed/tv/${imdbId}/1/${ep.episode_number}`,
      downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      size: "1.3 GB"
    }));

    const seasons = [
      {
        seasonNumber: 1,
        title: "Season 1",
        episodesCount: episodesList.length,
        batchDownload: {
          size: `${(episodesList.length * 1.3).toFixed(1)} GB`,
          quality: "1080p Complete Season Pack (Dual Audio)",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        },
        episodes: episodesList
      }
    ];

    const item = {
      id: `sp-ser-${data.id}`,
      tmdbId: data.id,
      imdbId: imdbId,
      title: data.name,
      type: 'series',
      industry: cfg.industry,
      audio: cfg.industry === 'Bollywood' ? 'Hindi (Original 5.1)' : 'Dual Audio [Hindi + English]',
      tagline: data.tagline || `${data.number_of_seasons || 1} Seasons • Highly Acclaimed Series`,
      synopsis: data.overview || "A gripping and critically acclaimed television series that redefined modern entertainment.",
      releaseYear: new Date(data.first_air_date || '2020-01-01').getFullYear(),
      rating: 'TV-MA',
      imdb: ratingScore,
      duration: `${data.number_of_seasons || 1} Season${data.number_of_seasons > 1 ? 's' : ''} • ${data.number_of_episodes || 10} Episodes`,
      genres: genres,
      director: creator,
      cast: cast,
      featured: cfg.rank <= 3,
      trending: true,
      top10: cfg.rank <= 10 ? cfg.rank : null,
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
      backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600',
      streamSources: [
        { 
          server: "VidSrc HD TV (Live Stream)", 
          embedUrl: `https://vidsrc.to/embed/tv/${imdbId}/1/1`, 
          quality: "1080p Full HD" 
        },
        { 
          server: "SuperEmbed TV (Multi-Source)", 
          embedUrl: `https://multiembed.mov/?video_id=${imdbId}&tmdb=1&s=1&e=1`, 
          quality: "Multi-Source Embed" 
        },
        { 
          server: "VidLink TV Fast", 
          embedUrl: `https://vidlink.pro/tv/${data.id}/1/1`, 
          quality: "VidLink Fast" 
        },
        { 
          server: "ShadowDirect HighSpeed MP4", 
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", 
          quality: "Direct HTML5 Stream" 
        }
      ],
      seasons: seasons,
      downloadLinks: [
        { 
          quality: "Full Season 1 (1080p Dual Audio)", 
          size: `${(episodesList.length * 1.3).toFixed(1)} GB`, 
          codec: "H.265 HEVC Complete Pack", 
          server: "ShadowFast VIP Cloud", 
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" 
        },
        { 
          quality: "Full Season 1 (720p HD)", 
          size: `${(episodesList.length * 0.7).toFixed(1)} GB`, 
          codec: "x264 Web-DL Pack", 
          server: "Google Drive Fast Mirror", 
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" 
        }
      ],
      views: Math.floor(Math.random() * 900000 + 500000),
      downloads: Math.floor(Math.random() * 350000 + 150000)
    };

    catalog.push(item);
    console.log(`✓ Added Web Series: ${item.title} (${cfg.industry}) - IMDb: ${item.imdb}`);
  }

  // Save to backend data
  const backendPath = path.join(__dirname, '../backend/data/catalog.json');
  await fs.writeFile(backendPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\nSuccessfully saved ${catalog.length} real titles to ${backendPath}`);

  // Save to frontend fallback
  const frontendPath = path.join(__dirname, '../frontend/src/data/defaultCatalog.js');
  await fs.writeFile(frontendPath, `export const defaultCatalog = ${JSON.stringify(catalog, null, 2)};\n`, 'utf-8');
  console.log(`Successfully saved defaultCatalog to ${frontendPath}`);
}

run();
