import React, { useState } from 'react';

const VidSrcPlayer = ({ imdbID, type }) => {
  // If it's a TV show, you need state to track which episode the user is watching
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  // Dynamically build the URL based on whether it's a movie or TV show
  const streamUrl = type === 'movie' 
    ? `https://vidsrcme.ru/embed/movie/${imdbID}`
    : `https://vidsrcme.ru/embed/tv/${imdbID}/${season}/${episode}`;

  return (
    <div className="streaming-container">
      
      {/* 1. The Video Player */}
      <iframe
        src={streamUrl}
        style={{ width: '100%', height: '600px', border: 'none' }}
        allowFullScreen
        title="VidSrc Stream"
      ></iframe>

      {/* 2. TV Show Controls (Only shows if type is 'tv') */}
      {type === 'tv' && (
        <div className="episode-controls">
          <label style={{ marginRight: '15px' }}>
            Season: 
            <input 
              type="number" 
              value={season} 
              onChange={(e) => setSeason(e.target.value)} 
              min="1" 
              style={{ marginLeft: '5px', width: '50px' }}
            />
          </label>
          <label>
            Episode: 
            <input 
              type="number" 
              value={episode} 
              onChange={(e) => setEpisode(e.target.value)} 
              min="1" 
              style={{ marginLeft: '5px', width: '50px' }}
            />
          </label>
        </div>
      )}

    </div>
  );
};

export default VidSrcPlayer;