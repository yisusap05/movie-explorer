import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_KEY = "e84dc07de5dffe5dba69b6590c4ec5f3"; // reemplaza con tu API Key de TMDb

function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = () => {
    const exists = favorites.find(f => f.id === movie.id);
    let newFavs;
    if (exists) {
      newFavs = favorites.filter(f => f.id !== movie.id);
    } else {
      newFavs = [...favorites, movie];
    }
    setFavorites(newFavs);
    localStorage.setItem("favorites", JSON.stringify(newFavs));
  };

    
    useEffect(() => {
        //info de la pelicula
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`)
            .then(res => res.json())
            .then(data => setMovie(data))
        //trailer de la pelicula
        fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=en-US`)
            .then(res => res.json())
            .then(data => {
                const vid = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
                if (vid) setTrailerUrl(`https://www.youtube.com/embed/${vid.key}`);
            });

    }, [id]);
 
    if (!movie) return <p style={{ color: "white", }}>Loading...</p>;

    return (
        <div style={{ background: "#000000", color: "#fff", minHeight: "100vh", padding: "20px" }}>
         <Link to="/" style={{ color: "#fff", textDecoration: "none"}}>⬅ Volver</Link>
         <h1 style={{ color: "#fff", marginTop: "20px" }}>{movie.title}</h1>
         <p>{movie.release_date}</p>
         {movie.backdrop_path && (
           <img 
             src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
             style={{ width: "100%", borderRadius: "10px"}}
           />
         )}
         <p style={{ marginTop: "20px" }}>{movie.overview}</p>

{trailerUrl && (
  <>
    <iframe 
      width="100%"
      height="400"
      src={trailerUrl}
      title="Trailer"
      allowFullScreen
    />
    <button onClick={toggleFavorite}>
      {favorites.find(f => f.id === movie.id) ? "❤️ Eliminar de Favoritos" : "🤍 Agregar a Favoritos"}
    </button>
  </>
)}
    </div>
    );
}
export default MoviePage;