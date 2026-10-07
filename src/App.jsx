import { useState, useEffect, useCallback } from 'react';
import VidSrcPlayer from './VidSrcPlayer';

const STORAGE_KEY = 'movie_app_watch_items';

function getCurrentTimestamp() {
  return Date.now();
}

// Popular starter titles for instant streaming and testing
const POPULAR_TITLES = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt0903747',
    Title: 'Breaking Bad',
    Year: '2008–2013',
    Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjAtNjA5cfQ2NjYxNzBhXkEyXkFqcGc@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt0816692',
    Title: 'Interstellar',
    Year: '2014',
    Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt4574334',
    Title: 'Stranger Things',
    Year: '2016–',
    Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BMjg1YTM5MDAtNDQ3Yi00OTdmLWE5NmUtNGQ0MmI5NmI1MDRiXkEyXkFqcGc@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt0468569',
    Title: 'The Dark Knight',
    Year: '2008',
    Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt0944947',
    Title: 'Game of Thrones',
    Year: '2011–2019',
    Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmZmUzMzFmXkEyXkFqcGc@._V1_SX300.jpg',
  },
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCompletedSection, setShowCompletedSection] = useState(false);

  // Load watch items from localStorage
  const [watchItems, setWatchItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever watchItems change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchItems));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }, [watchItems]);

  const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

  // Split into unfinished (for '/') vs completed (hidden from '/')
  const unfinishedTitles = watchItems
    .filter((item) => !item.completed)
    .sort((a, b) => (b.lastWatchedAt || 0) - (a.lastWatchedAt || 0));

  const completedTitles = watchItems
    .filter((item) => item.completed)
    .sort((a, b) => (b.lastWatchedAt || 0) - (a.lastWatchedAt || 0));

  // Current active movie details from watchItems if available
  const currentWatchRecord = selectedMovie
    ? watchItems.find((item) => item.imdbID === selectedMovie.imdbID)
    : null;

  const handleSelectMovie = (movie, overrideOptions = {}) => {
    const timestamp = getCurrentTimestamp();
    const existing = watchItems.find((item) => item.imdbID === movie.imdbID);

    const isTv =
      (movie.Type || movie.type || existing?.Type || '').toLowerCase() === 'series' ||
      (movie.Type || movie.type || existing?.Type || '').toLowerCase() === 'tv';

    const season = overrideOptions.season ?? (existing?.season || movie.season || 1);
    const episode = overrideOptions.episode ?? (existing?.episode || movie.episode || 1);

    if (existing) {
      setWatchItems((prev) =>
        prev.map((item) =>
          item.imdbID === movie.imdbID
            ? {
                ...item,
                season,
                episode,
                lastWatchedAt: timestamp,
              }
            : item
        )
      );
    } else {
      const newItem = {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Type: isTv ? 'series' : 'movie',
        Poster: movie.Poster,
        completed: false,
        season,
        episode,
        lastWatchedAt: timestamp,
      };
      setWatchItems((prev) => [newItem, ...prev]);
    }

    setSelectedMovie({
      ...movie,
      Type: isTv ? 'series' : 'movie',
      season,
      episode,
    });
  };

  const handleToggleCompleted = useCallback((imdbID) => {
    const timestamp = getCurrentTimestamp();
    setWatchItems((prev) =>
      prev.map((item) => {
        if (item.imdbID === imdbID) {
          return {
            ...item,
            completed: !item.completed,
            lastWatchedAt: timestamp,
          };
        }
        return item;
      })
    );
  }, []);

  const handleEpisodeChange = useCallback(
    (season, episode) => {
      if (!selectedMovie) return;
      const timestamp = getCurrentTimestamp();
      const targetId = selectedMovie.imdbID;

      setWatchItems((prev) =>
        prev.map((item) => {
          if (item.imdbID === targetId) {
            if (item.season === season && item.episode === episode) {
              return item;
            }
            return {
              ...item,
              season,
              episode,
              lastWatchedAt: timestamp,
            };
          }
          return item;
        })
      );
    },
    [selectedMovie]
  );

  const handleRemoveFromWatchList = (e, imdbID) => {
    e.stopPropagation();
    setWatchItems((prev) => prev.filter((item) => item.imdbID !== imdbID));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchMessage('');

    if (OMDB_API_KEY) {
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`
        );
        const data = await response.json();

        if (data.Search && data.Search.length > 0) {
          setMovies(data.Search);
          setSelectedMovie(null);
        } else {
          setMovies([]);
          setSearchMessage(data.Error || 'No movies found! Check your spelling.');
        }
      } catch (err) {
        console.error('OMDb API error:', err);
        setSearchMessage('Failed to connect to search service.');
      }
    } else {
      const localMatches = POPULAR_TITLES.filter((m) =>
        m.Title.toLowerCase().includes(query.toLowerCase())
      );
      if (localMatches.length > 0) {
        setMovies(localMatches);
        setSearchMessage('');
      } else {
        setMovies([]);
        setSearchMessage(
          `No results found in sample catalog for "${query}". Set VITE_OMDB_API_KEY in your environment to search all movies on OMDb.`
        );
      }
    }

    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setMovies([]);
    setSearchMessage('');
  };

  return (
    <div style={{ padding: '24px 20px', fontFamily: 'var(--sans)', maxWidth: '1120px', margin: '0 auto', textAlign: 'center' }}>
      {/* Header */}
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '38px', fontWeight: 700, color: 'var(--text-h)', letterSpacing: '-0.5px' }}>
          My Streaming App
        </h1>
        <p style={{ margin: 0, fontSize: '15px', color: 'var(--text)' }}>
          Watch movies & TV series with instant progress tracking
        </p>
      </header>

      {/* 1. Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search for a movie or TV show..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '12px 16px',
            width: '340px',
            maxWidth: '100%',
            fontSize: '15px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text-h)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isSearching}
          style={{
            padding: '12px 22px',
            fontSize: '15px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            cursor: isSearching ? 'not-allowed' : 'pointer',
            opacity: isSearching ? 0.7 : 1,
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>

        {(movies.length > 0 || searchMessage) && (
          <button
            type="button"
            onClick={handleClearSearch}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--social-bg)',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Search status / error message banner */}
      {searchMessage && (
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto 24px',
            padding: '10px 16px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            fontSize: '14px',
          }}
        >
          {searchMessage}
        </div>
      )}

      {/* 2. Video Player View (When a movie is actively playing) */}
      {selectedMovie && (
        <div style={{ marginBottom: '40px' }}>
          <VidSrcPlayer
            key={selectedMovie.imdbID}
            movie={selectedMovie}
            initialSeason={currentWatchRecord?.season || selectedMovie.season || 1}
            initialEpisode={currentWatchRecord?.episode || selectedMovie.episode || 1}
            onEpisodeChange={handleEpisodeChange}
            isCompleted={Boolean(currentWatchRecord?.completed)}
            onToggleCompleted={handleToggleCompleted}
            onBack={() => setSelectedMovie(null)}
          />
        </div>
      )}

      {/* 3. HOME VIEW ('/') - Only visible when not playing a video */}
      {!selectedMovie && (
        <div style={{ textAlign: 'left' }}>
          {/* SECTION A: CONTINUE WATCHING (Unfinished movies & shows only) */}
          <section
            style={{
              marginBottom: '36px',
              padding: '20px',
              borderRadius: '12px',
              background: 'var(--social-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: 'var(--text-h)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⏳ Continue Watching</span>
                  {unfinishedTitles.length > 0 && (
                    <span
                      style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: 'var(--accent)',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    >
                      {unfinishedTitles.length}
                    </span>
                  )}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)' }}>
                  Movies and shows in progress. Completed titles are automatically removed.
                </p>
              </div>
            </div>

            {unfinishedTitles.length === 0 ? (
              <div
                style={{
                  padding: '30px 20px',
                  textAlign: 'center',
                  background: 'var(--bg)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border)',
                  color: 'var(--text)',
                }}
              >
                <p style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 500, color: 'var(--text-h)' }}>
                  No unfinished movies or shows
                </p>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Start watching any title below. As long as you haven't finished it, it will stay here on your home screen!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '16px',
                }}
              >
                {unfinishedTitles.map((item) => {
                  const isTv =
                    (item.Type || item.type || '').toLowerCase() === 'series' ||
                    (item.Type || item.type || '').toLowerCase() === 'tv';
                  const s = item.season || 1;
                  const ep = item.episode || 1;

                  return (
                    <div
                      key={item.imdbID}
                      onClick={() => handleSelectMovie(item)}
                      style={{
                        background: 'var(--bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Poster */}
                      <div style={{ position: 'relative', width: '100%', height: '260px', background: 'var(--code-bg)' }}>
                        <img
                          src={item.Poster && item.Poster !== 'N/A' ? item.Poster : 'https://placehold.co/200x300?text=No+Poster'}
                          alt={item.Title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 7px',
                            borderRadius: '4px',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {isTv ? `S${s}:E${ep}` : 'Movie'}
                        </span>
                        <button
                          type="button"
                          title="Remove from Continue Watching"
                          onClick={(e) => handleRemoveFromWatchList(e, item.imdbID)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.65)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      {/* Info & Card Actions */}
                      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                        <div>
                          <h3
                            style={{
                              margin: '0 0 4px 0',
                              fontSize: '14px',
                              fontWeight: 600,
                              color: 'var(--text-h)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.Title}
                          </h3>
                          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text)' }}>
                            {isTv ? `Resume S${s}:E${ep}` : `${item.Year} • Movie`}
                          </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectMovie(item);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 0',
                              borderRadius: '4px',
                              border: 'none',
                              background: 'var(--accent)',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            ▶ Resume {isTv ? `(S${s}:E${ep})` : ''}
                          </button>

                          <button
                            type="button"
                            title="Mark as finished to remove from Home screen"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCompleted(item.imdbID);
                            }}
                            style={{
                              width: '100%',
                              padding: '6px 0',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              background: 'var(--social-bg)',
                              color: 'var(--text-h)',
                              fontSize: '11px',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            ✓ Mark as Completed
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION B: SEARCH RESULTS (If searched) */}
          {movies.length > 0 && (
            <section style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-h)' }}>
                  Search Results for "{searchTerm}" ({movies.length})
                </h2>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  Clear Results
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '16px',
                }}
              >
                {movies.map((movie) => {
                  const watchRecord = watchItems.find((w) => w.imdbID === movie.imdbID);
                  const isFinished = watchRecord?.completed;
                  const isUnfinished = watchRecord && !watchRecord.completed;

                  return (
                    <div
                      key={movie.imdbID}
                      onClick={() => handleSelectMovie(movie)}
                      style={{
                        background: 'var(--bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', height: '240px', background: 'var(--code-bg)' }}>
                        <img
                          src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/200x300?text=No+Poster'}
                          alt={movie.Title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                        {isFinished && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              background: '#16a34a',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            ✓ Completed
                          </span>
                        )}
                        {isUnfinished && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              background: '#ca8a04',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            ⏳ Watching (S{watchRecord.season || 1}:E{watchRecord.episode || 1})
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h3
                            style={{
                              margin: '0 0 4px 0',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: 'var(--text-h)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {movie.Title}
                          </h3>
                          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text)' }}>
                            {movie.Year} • {movie.Type}
                          </p>
                        </div>
                        <button
                          type="button"
                          style={{
                            width: '100%',
                            padding: '6px 0',
                            borderRadius: '4px',
                            border: 'none',
                            background: isUnfinished ? 'var(--accent)' : 'var(--social-bg)',
                            color: isUnfinished ? '#fff' : 'var(--text-h)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {isUnfinished ? '▶ Resume' : '▶ Watch Now'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION C: POPULAR TITLES (Quick access to start watching) */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 600, color: 'var(--text-h)' }}>
              🔥 Popular Titles to Watch
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text)' }}>
              Select any movie or show to stream and track your progress
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '16px',
              }}
            >
              {POPULAR_TITLES.map((title) => {
                const watchRecord = watchItems.find((w) => w.imdbID === title.imdbID);
                const isFinished = watchRecord?.completed;
                const isUnfinished = watchRecord && !watchRecord.completed;

                return (
                  <div
                    key={title.imdbID}
                    onClick={() => handleSelectMovie(title)}
                    style={{
                      background: 'var(--bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: '220px', background: 'var(--code-bg)' }}>
                      <img
                        src={title.Poster}
                        alt={title.Title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      {isFinished && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: '#16a34a',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          ✓ Completed
                        </span>
                      )}
                      {isUnfinished && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: '#ca8a04',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          ⏳ Watching (S{watchRecord.season || 1}:E{watchRecord.episode || 1})
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3
                          style={{
                            margin: '0 0 4px 0',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-h)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {title.Title}
                        </h3>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text)' }}>
                          {title.Year} • {title.Type}
                        </p>
                      </div>
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          padding: '6px 0',
                          borderRadius: '4px',
                          border: 'none',
                          background: isUnfinished ? 'var(--accent)' : 'var(--social-bg)',
                          color: isUnfinished ? '#fff' : 'var(--text-h)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isUnfinished ? `▶ Resume (S${watchRecord.season || 1}:E${watchRecord.episode || 1})` : '▶ Play'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION D: COMPLETED TITLES (Hidden from main Continue Watching by default) */}
          {completedTitles.length > 0 && (
            <section
              style={{
                marginTop: '20px',
                padding: '14px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--code-bg)',
              }}
            >
              <div
                onClick={() => setShowCompletedSection(!showCompletedSection)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
                    ✅ Finished Titles Archive ({completedTitles.length})
                  </span>
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text)' }}>
                    (Excluded from Continue Watching)
                  </span>
                </div>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {showCompletedSection ? 'Hide ▲' : 'Show ▼'}
                </button>
              </div>

              {showCompletedSection && (
                <div
                  style={{
                    marginTop: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {completedTitles.map((item) => (
                    <div
                      key={item.imdbID}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <img
                          src={item.Poster && item.Poster !== 'N/A' ? item.Poster : 'https://placehold.co/200x300?text=No+Poster'}
                          alt={item.Title}
                          style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.Title}
                          </p>
                          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text)' }}>
                            {item.Year} • Finished
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleCompleted(item.imdbID)}
                          title="Move back to Continue Watching on Home"
                          style={{
                            flex: 1,
                            padding: '5px',
                            fontSize: '11px',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            background: 'var(--social-bg)',
                            color: 'var(--text-h)',
                            cursor: 'pointer',
                          }}
                        >
                          ↺ Move to Home
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveFromWatchList(e, item.imdbID)}
                          title="Delete from history"
                          style={{
                            padding: '5px 8px',
                            fontSize: '11px',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            background: 'var(--social-bg)',
                            color: '#ef4444',
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
