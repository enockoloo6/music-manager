import React, { useMemo, useState } from 'react';

function LyricsMode({ song, onClose }) {
  const [fontScale, setFontScale] = useState(1);

  const lyrics = song?.lyrics?.trim();
  const fontSize = useMemo(() => `${Math.round(1.55 * fontScale * 100) / 100}rem`, [fontScale]);

  if (!song) return null;

  return (
    <div className="lyrics-mode">
      <div className="lyrics-mode__topbar no-print">
        <div>
          <div className="lyrics-mode__label">Presentation Mode</div>
          <h1>{song.song_name}</h1>
        </div>

        <div className="lyrics-mode__actions">
          <button type="button" onClick={() => setFontScale(current => Math.max(0.8, current - 0.1))}>A−</button>
          <button type="button" onClick={() => setFontScale(current => Math.min(1.8, current + 0.1))}>A+</button>
          <button type="button" onClick={() => window.print()}>Print</button>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>

      <main className="lyrics-mode__body">
        {lyrics ? (
          <pre style={{ fontSize }}>{lyrics}</pre>
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
