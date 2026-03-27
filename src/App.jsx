 import React, { useEffect, useState } from "react";
 import { Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import { AnimatePresence } from "framer-motion";
 import "./App.css";
 import { createClient } from "@supabase/supabase-js";

 const transformMovie = (movie) => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
    img: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : "https://via.placeholder.com/150x225/000000/FFFFFF?text=No+Image",
    backdrop: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
        : null,
    rating: movie.vote_average,
    genreIds: movie.genre_ids, 
    overview: movie.overview
 });

  function App() {
            
    //const [selectedMovie, setSelectedMovie] = useState(null);  
    //const [trailerUrl, setTrailerUrl] = useState("");  
    const [searchQuery, setSearchQuery] = useState(""); // Para búsqueda futura
    const [loading, setLoading] = useState(false); // Para estado de carga
    const [debouncedQuery, setDebouncedQuery] = useState(""); // Para debounce de búsqueda
    const [trending, setTrending] = useState([]); // Para películas trending
    const [topRated, setTopRated] = useState([]); // Para películas top rated
    const [nowPlaying, setNowPlaying] = useState([]); // Para películas now playing
    const [movies, setMovies] = useState([]);
    const [favorites, setFavorites] = useState(() => {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    });
    const [genres, setGenres] = useState({
      28: "Action",
      35: "Comedy",
    }); // Para mapear géneros por ID
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
      ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      : null;

    useEffect(() => {
      if (!supabase) return;

      const initAuth = async () => {
        try {
          const { data, error } = await supabase.auth.getUser();
          // Add your auth logic here if needed
        } catch (err) {
          console.error("Auth error:", err);
        }
      };
      initAuth();
    }, [supabase]);




    const API_KEY = "e84dc07de5dffe5dba69b6590c4ec5f3"; // reemplaza con tu API Key de TMDb

    // Traer películas populares
    useEffect(() => {
      const timeout = setTimeout(() => {
        setDebouncedQuery(searchQuery);
      }, 500); // debounce de 500ms
      return () => clearTimeout(timeout);
    }, [searchQuery]);
    
    useEffect(() => {
      setLoading(true);
       const endpoint = debouncedQuery
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${debouncedQuery}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;

      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          setMovies(data.results.map(transformMovie));
          setLoading(false);
        })
        .catch(err => { console.error("Error:", err); setLoading(false);});
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
      fetchCategory(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`, setTrending);
      fetchCategory(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`, setTopRated);
      fetchCategory(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`, setNowPlaying); 
    }, []);

    useEffect(() => {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);


    const toggleFavorite = (movie) => {
      const exists = favorites.find(fav => fav.id === movie.id);
      if (exists) setFavorites(favorites.filter(fav => fav.id !== movie.id));
       else setFavorites([...favorites, movie]);
      
    };

    const renderRow = (title, data) => (
        <div style={{ marginBottom: "30px" }}>
          <h2>{title}</h2>
          <div style={{ display: "flex", overflowX: "auto", padding: "10px 0", gap: "15px", }}>
            <AnimatePresence>
              {data.map(movie => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key={movie.id} 
                  whileHover={{ scale: 1.08, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="movie-card"
                >
                  <Link to={`/movie/${movie.id}`} >
                    <img src={movie.img} alt={movie.title} className="movie-img" loading="lazy" />
                  </Link>
                  {favorites.find(f => f.id === movie.id) && (
                    <div className="favorite-badge">❤️</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      );

      useEffect(() => {
        fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`)
          .then(res => res.json())
          .then(data => {
            const genreMap = {};
            data.genres.forEach(g => {
              genreMap[g.id] = g.name;
            });
            setGenres(genreMap);
          })
          .catch(err => console.error(err));
      }, []);

    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif", backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
        
        {favorites.length > 0 && (
          <button
            onClick={() => setFavorites([])}
            style={{ marginBottom: "10px", padding: "8px 12px", background: "darkred", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            🗑️ Delete All Favorites
          </button>
        )}

        <h1 style={{ color: "#1e560b" }}>🎬 Movie Explorer</h1>
        <input 
          type="text"
          placeholder="Buscar película..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", width: "100%", maxWidth: "400px", marginTop: "10px", border: "1px solid #ccc" }}
        />
        {loading && <p>Cargando...</p>}
        {/* Cuadrícula de películas */}
        {debouncedQuery ? (
          loading ? <p>Buscando...</p>
           : movies.length > 0 ? renderRow("Resultados", movies)
           : <p>No hay resultados...</p>
        ) : (
          <>
            {favorites.length > 0 && renderRow("Tus Favoritos", favorites)}
            {renderRow("Trending", trending)}
            {renderRow("Top Rated", topRated)}
            {renderRow("Now Playing", nowPlaying)}
          </>
        )}
     </div>
  );
}

export default App;