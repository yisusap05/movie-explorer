import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import MoviePage from "./MoviePage";

function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/movie/:id" element={<MoviePage />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;