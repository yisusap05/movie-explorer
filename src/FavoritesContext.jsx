import React, { createContext, useState, useEffect, useContext} from "react";
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem("favorites");
        return saved ? JSON.parse(saved) : [];
    });
    
    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (movie) => {
        setFavorites(prev => 
            prev.find(fav => fav.id === movie.id)
            ? prev.filter(fav => fav.id !== movie.id)
            : [...prev, movie]
        );
    }


const isFavorite = (id) => favorites.some(fav => fav.id === id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, setFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);