import React, { useEffect, useState} from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import { useFavorites } from "./FavoritesContext";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const transformMovie = (movie) => ({
  id: movie.id,
  title: movie.title || movie.name,
  year: (movie.release_date || movie.first_air_date)
    ? (movie.release_date || movie.first_air_date).split("-")[0]
    : "N/A",
  img: movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : "https://via.placeholder.com/150x225/000000/FFFFFF?text=No+Image",
  rating: movie.vote_average || 0,
  name: movie.name,
  type: movie.media_type || (movie.title ? "movie" : "tv")
});

const MovieCard = ({ movie }) => {
  const path = movie.type === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.08, zIndex: 10 }}
      transition={{ duration: 0.3 }}
      style={{ minWidth: "200px" }}
    >
      <Link to={path} style={{ textDecoration: "none", color: "inherit" }}>
        <div className="movie-card">
          <img src={movie.img} alt={movie.title} className="movie-img" />
          <div className="movie-info">
            <h3 className="movie-title">{movie.title}</h3>
            <p className="movie-year">{movie.year} • {movie.rating.toFixed(1)} ⭐</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  
  const { favorites } = useFavorites();

  // 1. Debounce para la búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // 2. Lógica de Búsqueda corregida
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setMovies([]);
      return;
    }

    const controller = new AbortController();

    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(debouncedQuery)}&language=en-US`,
          { signal: controller.signal }
        );
        const data = await res.json();
        
        const filtered = (data.results || [])
          .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
          .map(transformMovie);
        
        setMovies(filtered);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Search error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    const fetchCategory = async (url, setter) => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setter(data.results.map(transformMovie));
      } catch (err) {
        console.error("Error fetching category:", err);
      }
    };

    fetchCategory(`https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`, setTrending);
    fetchCategory(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`, setTopRated);
    fetchCategory(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`, setNowPlaying);
  }, []);

  const renderRow = (title, data) => (
    <div style={{ marginBottom: "30px" }}>
      <h2 style={{ marginLeft: "10px" }}>{title}</h2>
      <div className="movie-row" style={{ display: "flex", overflowX: "auto", padding: "10px", gap: "15px" }}>
        <AnimatePresence mode="popLayout">
          {data.map(m => (
            <MovieCard key={`${title}-${m.id}`} movie={m} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "20px", backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
      <h1 style={{ color: "#1e560b" }}>🎬 Movie Explorer</h1>
      
      <input 
        type="text"
        placeholder="Search for a movie or series..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
        style={{ padding: "12px", borderRadius: "8px", width: "100%", maxWidth: "500px", marginBottom: "30px", border: "1px solid #333", background: "#111", color: "#fff" }}
      />

      {debouncedQuery.trim() ? (
        loading ? <p>Searching...</p> : renderRow("Search results", movies)
      ) : (
        <>
          {favorites.length > 0 && renderRow("My Favorites", favorites)}
          {renderRow("Trending", trending)}
          {renderRow("Top Rated", topRated)}
          {renderRow("Now Playing", nowPlaying)}
        </>
      )}
    </div>
  );
}

export default App;