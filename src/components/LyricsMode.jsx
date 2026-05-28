import React from 'react';

function LyricsMode({ song, onClose }) {
  if (!song) return null;

  const lyrics = song.lyrics?.trim();

  return (
    <div className="lyrics-mode">
      <div className="lyrics-mode__topbar no-print">
        <div>
          <div className="lyrics-mode__label">Singing Mode</div>
          <h1>{song.song_name}</h1>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <main className="lyrics-mode__body">
        {lyrics ? (
          <pre>{lyrics}</pre>
        ) : (
          <div className="lyrics-mode__empty">
            No lyrics have been saved for this song yet.
          </div>
        )}
      </main>
    </div>
  );
}

export default LyricsMode;
