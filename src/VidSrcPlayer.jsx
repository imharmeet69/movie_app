import { useState } from 'react';

function VidSrcPlayer({
  movie,
  initialSeason = 1,
  initialEpisode = 1,
  onEpisodeChange,
  isCompleted,
  onToggleCompleted,
  onBack,
}) {
  const isTv =
    (movie.Type || movie.type || '').toLowerCase() === 'series' ||
    (movie.Type || movie.type || '').toLowerCase() === 'tv';

  const [season, setSeason] = useState(initialSeason || 1);
  const [episode, setEpisode] = useState(initialEpisode || 1);
  const [selectedServer, setSelectedServer] = useState('vidsrcme');
  const [justCompletedToast, setJustCompletedToast] = useState(false);

  const handleSeasonSelect = (s) => {
    const newSeason = Math.max(1, parseInt(s, 10) || 1);
    setSeason(newSeason);
    if (onEpisodeChange) {
      onEpisodeChange(newSeason, episode);
    }
  };

  const handleEpisodeSelect = (ep) => {
    const newEp = Math.max(1, parseInt(ep, 10) || 1);
    setEpisode(newEp);
    if (onEpisodeChange) {
      onEpisodeChange(season, newEp);
    }
  };

  const handlePrevEpisode = () => {
    if (episode > 1) {
      handleEpisodeSelect(episode - 1);
    }
  };

  const handleNextEpisode = () => {
    handleEpisodeSelect(episode + 1);
  };

  const handleToggle = () => {
    const willBeCompleted = !isCompleted;
    onToggleCompleted(movie.imdbID);
    if (willBeCompleted) {
      setJustCompletedToast(true);
      setTimeout(() => setJustCompletedToast(false), 4500);
    } else {
      setJustCompletedToast(false);
    }
  };

  // Build clean stream embed URL without timestamp parameter
  const streamUrl = (() => {
    if (selectedServer === 'vidsrc.to') {
      return isTv
        ? `https://vidsrc.to/embed/tv/${movie.imdbID}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${movie.imdbID}`;
    }
    if (selectedServer === 'vidsrc.cc') {
      return isTv
        ? `https://vidsrc.cc/v2/embed/tv/${movie.imdbID}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${movie.imdbID}`;
    }
    return isTv
      ? `https://vidsrcme.ru/embed/tv/${movie.imdbID}/${season}/${episode}`
      : `https://vidsrcme.ru/embed/movie/${movie.imdbID}`;
  })();

  const commonEpisodes = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div style={{ width: '100%', maxWidth: '1020px', margin: '0 auto', textAlign: 'left' }}>
      {/* Top Navigation & Status Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--social-bg)',
            color: 'var(--text-h)',
          }}
        >
          ← Back to Home
        </button>

        {/* Server & Completion Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text)' }}>
            Server:
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-h)',
                fontSize: '13px',
              }}
            >
              <option value="vidsrcme">VidSrc (Primary)</option>
              <option value="vidsrc.to">VidSrc.to (Mirror 1)</option>
              <option value="vidsrc.cc">VidSrc.cc (Mirror 2)</option>
            </select>
          </label>

          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              background: isCompleted ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: isCompleted ? '#16a34a' : '#ca8a04',
              border: `1px solid ${isCompleted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
            }}
          >
            {isCompleted ? '✓ Completed' : '⏳ In Progress'}
          </span>

          <button
            onClick={handleToggle}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '6px',
              border: isCompleted ? '1px solid var(--border)' : '1px solid #16a34a',
              background: isCompleted ? 'var(--social-bg)' : '#16a34a',
              color: isCompleted ? 'var(--text-h)' : '#ffffff',
              transition: 'background 0.2s',
            }}
          >
            {isCompleted ? '↺ Mark as Unfinished' : '✓ Mark as Completed'}
          </button>
        </div>
      </div>

      {justCompletedToast && (
        <div
          style={{
            padding: '10px 16px',
            marginBottom: '16px',
            borderRadius: '6px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#15803d',
            fontSize: '14px',
          }}
        >
          🎉 <strong>Marked as completed!</strong> This title will no longer appear in your Continue Watching list on the home page.
        </div>
      )}

      {/* Title & Info */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 600, color: 'var(--text-h)' }}>
          {movie.Title}
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>
          {movie.Year} • {isTv ? `TV Series (Watching Season ${season}, Episode ${episode})` : 'Movie'}
        </p>
      </div>

      {/* TV Series Episode & Season Navigation Panel */}
      {isTv && (
        <div
          style={{
            padding: '14px 18px',
            marginBottom: '16px',
            borderRadius: '8px',
            background: 'var(--code-bg)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '14px' }}>
                Season:
              </span>
              <div style={{ display: 'inline-flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSeasonSelect(s)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: season === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: season === s ? 'var(--accent)' : 'var(--bg)',
                      color: season === s ? '#fff' : 'var(--text-h)',
                      fontWeight: season === s ? 700 : 400,
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    S{s}
                  </button>
                ))}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text)' }}>
                Custom S:
                <input
                  type="number"
                  min="1"
                  value={season}
                  onChange={(e) => handleSeasonSelect(e.target.value)}
                  style={{
                    width: '46px',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-h)',
                    fontSize: '13px',
                  }}
                />
              </label>
            </div>

            {/* Prev / Next Episode Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handlePrevEpisode}
                disabled={episode <= 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: episode <= 1 ? 'var(--text)' : 'var(--text-h)',
                  cursor: episode <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                }}
              >
                ⏮ Prev Ep
              </button>
              <button
                onClick={handleNextEpisode}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--accent-border)',
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Next Ep ⏭
              </button>
            </div>
          </div>

          {/* Quick Episode Grid */}
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>
              Select Episode (Season {season}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {commonEpisodes.map((epNum) => {
                const isActive = episode === epNum;
                return (
                  <button
                    key={epNum}
                    onClick={() => handleEpisodeSelect(epNum)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: isActive ? 'var(--accent)' : 'var(--bg)',
                      color: isActive ? '#fff' : 'var(--text-h)',
                      fontWeight: isActive ? 700 : 400,
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Ep {epNum}
                  </button>
                );
              })}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginLeft: '6px' }}>
                More:
                <input
                  type="number"
                  min="1"
                  value={episode}
                  onChange={(e) => handleEpisodeSelect(e.target.value)}
                  style={{
                    width: '50px',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-h)',
                    fontSize: '12px',
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Video Stream Iframe */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '560px',
          background: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
        }}
      >
        <iframe
          key={`${movie.imdbID}-s${season}-e${episode}-${selectedServer}`}
          src={streamUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
          title={`VidSrc Player - ${movie.Title}`}
        />
      </div>

      <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text)' }}>
        Your current episode (Season {season}, Episode {episode}) is saved. When you return to the home screen and click "Resume", it will open this episode.
      </div>
    </div>
  );
}

export default VidSrcPlayer;
