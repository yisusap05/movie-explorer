 import React, { useEffect, useState } from "react";

 const transformMovie = (movie) => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
    img: movie.poster_path 
        ? `https://image.tmdb.org/t/p/original${movie.poster_path}` 
        : "https://via.placeholder.com/150x220?text=No+Image",
    backdrop: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
        : null,
    rating: movie.vote_average,
    genreIds: movie.genre_ids, 
    overview: movie.overview
 });

  function App() {
            
    const [selectedMovie, setSelectedMovie] = useState(null);  
    const [trailerUrl, setTrailerUrl] = useState("");  
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

    // Función para abrir modal y traer trailer
    const openMovie = async (movie) => {
      setSelectedMovie(movie);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${API_KEY}&language=en-US`
        );
        const data = await res.json();
        // Buscar trailer oficial de YouTube
        const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        if (trailer) setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1`);
        else setTrailerUrl("https://www.youtube.com/embed/YoHD9XEInc0?autoplay=1"); // trailer de prueba
      } catch (err) {
        console.error(err);
        setTrailerUrl("https://www.youtube.com/embed/YoHD9XEInc0?autoplay=1"); // fallback
      }
    };

    const toggleFavorite = (movie) => {
      const exists = favorites.find(fav => fav.id === movie.id);
      if (exists) setFavorites(favorites.filter(fav => fav.id !== movie.id));
       else setFavorites([...favorites, movie]);
      
    };

    const renderRow = (title, data) => (
        <div style={{ marginBottom: "30px" }}>
          <h2>{title}</h2>
          <div style={{ display: "flex", overflowX: "auto", padding: "10px 0", gap: "15px", }}>
            {data.map(movie => (
              <div 
                key={movie.id} 
                onClick={() => openMovie(movie)}
                style={{
                    minWidth: "150px",
                    cursor: "pointer",
                    position: "relative",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.6)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img 
                  src={movie.img} 
                  alt={movie.title} 
                  style={{ width: "150px", height: "225px", objectFit: "cover", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }}
                />
                {favorites.find(f => f.id === movie.id) && (
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0,0,0,0.7)",
                    padding: "5px",
                    borderRadius: "30%",
                    fontSize: "17px",
                  }}>❤️</div>
                )}
              </div>
            ))}
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

        {/* Modal con info de película */}
        {selectedMovie && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.95)", display: "flex",
            justifyContent: "center", overflowY: "auto", alignItems: "center", zIndex: 1000, padding: "20px" 
          }}>
            <div style={{
              backgroundColor: "#111", color: "#fff", borderRadius: "8px", width: "100%", maxWidth: "500px", maxHeight: "80vh",
              overflowY: "auto", textAlign: "center", position: "relative", padding: "20px"
            }}>
            
          {/*Backdrop*/}
              <div style={{ position: "relative", height: "70vh" }}>
                 {selectedMovie.backdrop && (
                  <img src={selectedMovie.backdrop} alt={selectedMovie.title} style={{ width: "100%", height: "100%", objectFit: "cover"}} 
                 />
               )}
               <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
               }}/>
            
               {/* Botón de cerrar */}
               <button 
                onClick={() => { setSelectedMovie(null); setTrailerUrl(""); }}
                style={{ position: "absolute", top: "15px", right: "15px", cursor: "pointer", fontSize: "18px", background: "rgba(0,0,0,0.6)",
                  color: "#fff", border: "none", borderRadius: "50%", width: "35px", height: "35px",
                }}
              >✕</button>

            {/*Titulo sobre imagen*/}
            <div style={{ position: "absolute", bottom: "20px", left: "20px", color: "#fff", display: "flex", flexDirection: "column",
              gap: "5px", textShadow: "2px 2px 6px rgba(0,0,0,0.7)"
            }}>
              <h1 style={{ margin: 0, color: "#fff", fontSize: "28px" }}>{selectedMovie.title}</h1>
              <p style={{ margin: 0, color: "#ddd", fontSize: "16px" }}>{selectedMovie.year}</p>
            </div>
          </div>

          {/*Contenido+descripcion+trailer*/}
          <div style={{padding: "20px", color: "#fff", maxWidth: "800px", margin: "auto",
          }}>
            <p style={{ lineHeight: "1.6" }}> {selectedMovie.overview || "No hay descripción disponible."}</p>
          {trailerUrl && (
            <>
              <div style={{ marginTop: "20px" }}>
                <iframe 
                  width="100%" 
                  height="400" 
                  src={trailerUrl} 
                  title="Trailer" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{ borderRadius: "8px" }}
                />
              </div>
              <div style={{
                padding: "10px",
                color: "#fff",
                maxWidth: "800px",
                margin: "auto",
              }}> </div>

              <p style={{marginTop: "10px"}}>⭐ {selectedMovie.rating?.toFixed(1)} / 10</p>
              <div style={{ marginTop: "10px"}}>
                {selectedMovie.genreIds?.map(id => (
                    <span key={id} 
                      style={{
                        marginRight: "8px",
                        background: "#333",
                        padding: "5px 10px",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    >
                      {genres[id]}
                    </span>
                ))}
              </div>
            </>
          )}
       </div>
       <button 
        onClick={() => toggleFavorite(selectedMovie)} 
        style={{
         marginTop: "10px",
         padding: "10px 15px",
         background: favorites.find(f => f.id === selectedMovie.id) 
         ? "#e50914"
         : "#444",
         color: "#fff",
         border: "none",
         borderRadius: "6px",
         cursor: "pointer",
         fontWeight: "bold",
         transition: "background 0.3s"
       }}
       >
         {favorites.find(f => f.id === selectedMovie.id) 
         ? "❤️ Eliminar de Favoritos" 
         : "🤍 Agregar a Favoritos"}
       </button>
     </div>
   </div>
 )}
    </div>
  );
}

export default App;