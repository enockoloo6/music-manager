import React from 'react';

function SongCard({
  song,
  role,
  editingId,
  editData,
  keyboards,
  saving,
  onDeleteSong,
  onDeleteBeat,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDataChange,
  onEditLyrics,
  onOpenLyrics
}) {
  const hasLyrics = Boolean(song.lyrics?.trim());

  const inputStyle = {
    padding: '6px 8px',
    border: '1px solid #90caf9',
    borderRadius: '5px',
    fontSize: '0.85rem',
    background: '#f0f7ff',
    width: '100%',
    boxSizing: 'border-box',
    margin: 0
  };

  return (
    <div className="card song-card">
      <div className="card-header song-card__header">
        <div className="song-card__title-wrap">
          <span className="song-title">{song.song_name}</span>
          {song.styles?.length > 0 && (
            <span className="beat-count-badge">
              {song.styles.length} beat{song.styles.length > 1 ? 's' : ''}
            </span>
          )}
          {hasLyrics && <span className="song-card__lyrics-badge">Lyrics</span>}
        </div>

        <div className="song-card__actions no-print">
          <button type="button" onClick={() => onOpenLyrics?.(song)}>
            🎤 Lyrics
          </button>
          {role?.approved && (
            <button type="button" onClick={() => onEditLyrics?.(song)}>
              ✍️ Edit Lyrics
            </button>
          )}
          {role?.admin && (
            <button type="button" onClick={() => onDeleteSong?.(song.id)} className="song-card__delete">
              🗑 Delete
            </button>
          )}
        </div>
      </div>

      {hasLyrics && (
        <div className="song-card__lyrics-preview">
          {song.lyrics.trim().slice(0, 180)}{song.lyrics.trim().length > 180 ? '…' : ''}
        </div>
      )}

      <div>
        {song.styles?.length > 0 ? song.styles.map((style, idx) => (
          <div key={style.id} className="beat-row" style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
            {editingId === style.id ? (
              <div>{/* unchanged edit UI */}</div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontWeight: '700', color: '#1a237e', fontSize: '0.97rem' }}>
                    🥁 {style.beat_name}
                    {style.keyboard_location && (
                      <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '0.8rem', marginLeft: '6px' }}>
                        (<em>{style.keyboard_location}</em>)
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    🎹 {style.keyboards?.model_name || '--'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )) : null}
      </div>
    </div>
  );
}

export default SongCard;