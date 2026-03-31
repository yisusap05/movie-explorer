import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useFavorites } from "./FavoritesContext";
import ReactPlayer from "react-player";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function MoviePage() {
  const { id } = useParams();
  const location = useLocation();

  const isTV = location.pathname.includes("/tv/");
  const type = isTV ? "tv" : "movie";
  
  const [movie, setMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [selectedServer, setSelectedServer] = useState("vidfast");
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState(null);

  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=videos`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
        const vid = data.videos?.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        if (vid) setTrailerUrl(`https://www.youtube.com/embed/${vid.key}`);
      });
  }, [id, type]);

  useEffect(() => {
      if (isTV) {
        fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}&language=en-US`)
          .then((res) => res.json())
          .then((data) => setSeasonData(data))
          .catch((err) => console.error("Error fetching season data:", err));
      }
    }, [id, season, isTV]);

  if (!movie) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

  const servers = {
    vidfast: isTV 
      ? `https://vidfast.pro/tv/${id}/${season}/${episode}?autoPlay=true&theme=9B59B6` 
      : `https://vidfast.pro/movie/${id}?autoPlay=true&theme=9B59B6`,
    vidsrc_ru: isTV
      ? `https://vidsrc.ru/tv/${id}/${season}/${episode}?autoPlay=true&color=9b59b6`
      : `https://vidsrc.ru/movie/${id}?autoPlay=true&color=9b59b6`,
    vidsrc_xyz: isTV 
      ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
      : `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    superembed: isTV
      ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
      : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  };

  const finalVideoUrl = selectedServer === "trailer" ? trailerUrl : servers[selectedServer];
  
  // Corregido el nombre de la variable para que coincida con el IF de abajo
  const isDirectVideo = selectedServer === "direct_link"; 

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "20px" }}>
      <Link to="/" style={{ color: "#666", textDecoration: "none" }}>⬅ Return</Link>
      
      <h1 style={{ color: "#fff", margin: "20px 0 30px 0" }}>{movie.title || movie.name}</h1>
      
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "center" }}>
        <span style={{ color: "gold", fontWeight: "bold" }}> 
          ⭐ { movie.vote_average ? movie.vote_average?.toFixed(1) : "N/A" }
        </span>
        <span style={{ color: "#ccc", fontSize: "0.9rem" }}>
          {movie.release_date?.split("-")[0] || movie.first_air_date?.split("-")[0] || ""}
        </span>
        <span style={{ color: "#aaa", fontSize: "0.8rem", border: "1px solid #444", padding: "2px 6px", borderRadius: "4px" }}>
          {movie.adult ? "18+" : "PG-13"}
        </span>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <select
          value={selectedServer}
          onChange={(e) => setSelectedServer(e.target.value)}
          style={{ background: "#111", color: "#fff", border: "1px solid #333",
          padding: "10px", borderRadius: "6px", fontSize: "0.9rem", cursor: "pointer",
          outline: "none", width: "225px", marginRight: "auto"
        }}
      >
          <option value="vidfast">VidFast (Recommended)</option>
          <option value="vidsrc_ru">VidRU</option>
          <option value="vidsrc_xyz">VidXYZ</option>
          <option value="superembed">Superembed</option>
          {trailerUrl && <option value="trailer">📺 Trailer</option>}
        </select>

        <button onClick={() => toggleFavorite(movie)} style={favBtnStyle}>
          {isFavorite(movie.id) ? "❤️" : "🤍"}
        </button>
      </div>

      <div style={{ width: "100%", aspectRatio: "16/9", background: "#111", borderRadius: "12px", overflow: "hidden" }}>
        {isDirectVideo ? (
          <ReactPlayer
            url={finalVideoUrl}
            controls={true}
            width="100%"
            height="100%"
            playing={true}
            config={{ file: { attributes: { crossOrigin: "anonymous" } } }}
          />
        ) : (
          <iframe
            key={`player-${selectedServer}-${season}-${episode}`}
            width="100%" 
            height="100%" 
            src={finalVideoUrl} 
            frameBorder="0" 
            allowFullScreen 
            scrolling="no" 
            title="Player"
            referrerPolicy="origin" 
          />
        )}
      </div>

      {isTV && (
        <div style={{ marginTop: "25px", background: "#0a0a0a", padding: "20px", borderRadius: "12px", border: "1px solid #1a1a1a" }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#555", fontSize: "0.8rem", marginBottom: "10px", fontWeight: "bold", textTransform: "uppercase" }}>Seasons</p>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px" }}>
              {[...Array(movie.number_of_seasons)].map((_, i) => (
                <button key={i+1} onClick={() => { setSeason(i+1); setEpisode(1); }} style={seasonBtnStyle(season === i+1)}>T{i+1}</button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: "#555", fontSize: "0.8rem", marginBottom: "10px", fontWeight: "bold", textTransform: "uppercase" }}>Episodes</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(45px, 1fr))", gap: "8px" }}>
              {seasonData?.episodes ? (
                seasonData.episodes.map((ep) => (
                  <button
                    key={ep.episode_number}
                    onClick={() => setEpisode(ep.episode_number)}
                    style={episodeBtnStyle(episode === ep.episode_number)}
                  >
                    {ep.episode_number}
                  </button>
                ))
              ) : (
                <p>Loading episodes...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const seasonBtnStyle = (active) => ({ padding: "8px 16px", background: active ? "#1e560b" : "#1a1a1a", color: "#fff", border: active ? "1px solid #1e560b" : "1px solid #333", borderRadius: "6px", cursor: "pointer" });
const episodeBtnStyle = (active) => ({ padding: "10px", background: active ? "gold" : "#1a1a1a", color: active ? "#000" : "#fff", border: "none", borderRadius: "6px", cursor: "pointer" });
const favBtnStyle = { padding: "10px 15px", background: "transparent", color: "#fff", border: "1px solid #333", borderRadius: "6px", cursor: "pointer" };

export default MoviePage;