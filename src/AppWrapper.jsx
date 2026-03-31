import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "./FavoritesContext";
import App from "./App";
import MoviePage from "./MoviePage";
import Navbar from "./navbar";

function AppWrapper() {
  return (
    <FavoritesProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/tv/:id" element={<MoviePage />} />
        </Routes>
      </Router>
    </FavoritesProvider>
  );
}

export default AppWrapper;