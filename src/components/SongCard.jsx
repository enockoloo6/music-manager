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
              <div style={{ background: '#f0f4ff', borderRadius: '8px', padding: '12px', border: '1px solid #c5d0f5' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: '700', color: '#1a237e', marginBottom: '10px' }}>
                  ✏️ Editing beat
                </div>

                <div className="form-grid">
                  <div>
                    <label>Song</label>
                    <input style={inputStyle} value={song.song_name} disabled />
                  </div>
                  <div>
                    <label>Keyboard *</label>
                    <select
                      style={{ ...inputStyle, padding: '6px 8px' }}
                      value={editData.keyboard_id}
                      onChange={e => onEditDataChange?.({ ...editData, keyboard_id: e.target.value })}
                    >
                      <option value="">Select…</option>
                      {keyboards.map(k => <option key={k.id} value={k.id}>{k.model_name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: '8px' }}>
                  <div>
                    <label>Beat Name *</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. 8-Beat Modern"
                      value={editData.beat_name}
                      onChange={e => onEditDataChange?.({ ...editData, beat_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Beat Category</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Ballad, Country…"
                      value={editData.location}
                      onChange={e => onEditDataChange?.({ ...editData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: '8px' }}>
                  <div>
                    <label>Tempo (BPM)</label>
                    <input
                      style={inputStyle}
                      type="number"
                      placeholder="e.g. 92"
                      value={editData.tempo}
                      onChange={e => onEditDataChange?.({ ...editData, tempo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Key</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. G, Bb"
                      value={editData.key}
                      onChange={e => onEditDataChange?.({ ...editData, key: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <label>Notes</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '56px', resize: 'vertical' }}
                    placeholder="Fill levels, variations…"
                    value={editData.notes}
                    onChange={e => onEditDataChange?.({ ...editData, notes: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button type="button" onClick={() => onSaveEdit?.(style.id)} disabled={saving}>
                    {saving ? '⏳…' : '💾 Save Changes'}
                  </button>
                  <button type="button" onClick={onCancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
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

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#555', marginTop: '5px' }}>
                  <span>⏱ <strong>{style.tempo || '--'}</strong> BPM</span>
                  <span>🎼 Key: <strong>{style.musical_key || '--'}</strong></span>
                </div>

                {style.notes && (
                  <p style={{ fontSize: '0.79rem', fontStyle: 'italic', color: '#7a8899', margin: '6px 0 0', paddingTop: '5px', borderTop: '1px dashed #e8eef4' }}>
                    💬 {style.notes}
                  </p>
                )}

                {role?.approved && (
                  <div className="no-print" style={{ display: 'flex', gap: '7px', marginTop: '8px' }}>
                    <button type="button" onClick={() => onStartEdit?.(style)}>
                      ✏️ Edit
                    </button>
                    <button type="button" onClick={() => onDeleteBeat?.(style.id)}>
                      🗑 Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <p style={{ fontSize: '0.82rem', color: '#b0bec5', padding: '12px 16px', margin: 0 }}>
            No beats added yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default SongCard;
