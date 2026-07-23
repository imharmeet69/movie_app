import React, { useState } from 'react';
import VidSrcPlayer from './VidSrcPlayer';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Put your real OMDb API key here
  const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing on submit
    
    // OMDb uses ?s= to search for partial titles
    const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=${OMDB_API_KEY}`);
    const data = await response.json();

    if (data.Search) {
      setMovies(data.Search);
      setSelectedMovie(null); // Close the player if doing a new search
    } else {
      setMovies([]);
      alert("No movies found! Check your spelling."); // OMDb requires pretty exact spelling
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>My Streaming App</h1>
      
      {/* 1. The Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Search for a movie..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', width: '300px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {/* 2. The Video Player (Only shows if a movie is clicked) */}
      {selectedMovie && (
        <div style={{ marginBottom: '40px' }}>
          <button 
            onClick={() => setSelectedMovie(null)}
            style={{ marginBottom: '10px', cursor: 'pointer' }}
          >
            ← Back to Results
          </button>
          <h2>Playing: {selectedMovie.Title}</h2>
          {/* We pass the dynamic ID and Type (movie/series) to the player */}
          <VidSrcPlayer 
            imdbID={selectedMovie.imdbID} 
            type={selectedMovie.Type === 'series' ? 'tv' : 'movie'} 
          />
        </div>
      )}

      {/* 3. The Movie Grid (Hides when a movie is playing) */}
      {!selectedMovie && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {movies.map((movie) => (
            <div 
              key={movie.imdbID} 
              onClick={() => setSelectedMovie(movie)}
              style={{ width: '200px', cursor: 'pointer', textAlign: 'center' }}
            >
              <img 
                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster'} 
                alt={movie.Title} 
                style={{ width: '100%', borderRadius: '8px' }}
              />
              <h3>{movie.Title}</h3>
              <p>{movie.Year} • {movie.Type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;