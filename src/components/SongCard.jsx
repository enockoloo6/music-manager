import React, { useState } from 'react';
import AudioAttachments from './AudioAttachments';
import LyricsEditor from './LyricsEditor';

function getFirstLyricLine(lyrics) {
  return (lyrics || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean) || '';
}

function beatMetaParts(style) {
  return [
    style.tempo ? `${style.tempo} BPM` : null,
    style.musical_key ? `Key ${style.musical_key}` : null
  ].filter(Boolean);
}

function beatDisplayName(style) {
  const category = style.keyboard_location?.trim();
  return category ? `${style.beat_name}(${category})` : style.beat_name;
}

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
  onOpenLyrics,
  onSaveLyrics,
  user,
  canManageAudio,
  isEditingLyrics
}) {
  const [showMore, setShowMore] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const hasLyrics = Boolean(getFirstLyricLine(song.lyrics));
  const hasAudio = (song.song_audio?.length || 0) > 0;
  const canOpenAudio = hasAudio || canManageAudio;
  const hasMoreActions = Boolean(role?.approved || role?.admin);

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
        </div>

        <div className="song-card__actions no-print">
          {hasLyrics ? (
            <button type="button" className="song-card__link-action" onClick={() => onOpenLyrics?.(song)}>
              Lyrics
            </button>
          ) : role?.approved ? (
            <button type="button" className="song-card__link-action" onClick={() => onEditLyrics?.(song)}>
              Add Lyrics
            </button>
          ) : null}

          {canOpenAudio && (
            <button
              type="button"
              className="song-card__link-action"
              onClick={() => setShowAudio(current => !current)}
              aria-expanded={showAudio}
            >
              {showAudio ? 'Hide Audio' : 'Audio'}
            </button>
          )}

          {hasMoreActions && (
            <button
              type="button"
              className="song-card__link-action"
              onClick={() => setShowMore(current => !current)}
              aria-expanded={showMore}
            >
              More
            </button>
          )}
        </div>
      </div>

      {showMore && (
        <div className="song-card__more no-print" style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', padding: '9px 16px', borderBottom: '1px solid #eef2f7', background: '#f8fafc' }}>
          {role?.approved && hasLyrics && (
            <button
              type="button"
              onClick={() => onEditLyrics?.(song)}
            >
              Edit Lyrics
            </button>
          )}

          {role?.admin && (
            <button
              type="button"
              onClick={() => onDeleteSong?.(song.id)}
              className="song-card__delete"
            >
              Delete Song
            </button>
          )}
        </div>
      )}

      {isEditingLyrics && (
        <div className="song-card__lyrics-editor no-print">
          <LyricsEditor
            song={song}
            saving={saving}
            onCancel={() => onEditLyrics?.(null)}
            onSave={onSaveLyrics}
          />
        </div>
      )}

      {showAudio && (
        <AudioAttachments
          song={song}
          user={user}
          canManage={canManageAudio}
        />
      )}

      <div>
        {song.styles?.length > 0 ? (
          song.styles.map((style, idx) => (
            <div
              key={style.id}
              className="beat-row"
              style={{
                background: idx % 2 === 0 ? '#fff' : '#f8fafc'
              }}
            >
              {editingId === style.id ? (
                <div
                  style={{
                    background: '#f0f4ff',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #c5d0f5'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: '700',
                      color: '#1a237e',
                      marginBottom: '10px'
                    }}
                  >
                    Editing beat
                  </div>

                  <div className="form-grid">
                    <div>
                      <label>Song</label>
                      <input
                        style={inputStyle}
                        value={song.song_name}
                        disabled
                      />
                    </div>

                    <div>
                      <label>Keyboard *</label>
                      <select
                        style={{
                          ...inputStyle,
                          padding: '6px 8px'
                        }}
                        value={editData.keyboard_id}
                        onChange={e =>
                          onEditDataChange?.({
                            ...editData,
                            keyboard_id: e.target.value
                          })
                        }
                      >
                        <option value="">Select…</option>

                        {keyboards.map(k => (
                          <option
                            key={k.id}
                            value={k.id}
                          >
                            {k.model_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    className="form-grid"
                    style={{ marginTop: '8px' }}
                  >
                    <div>
                      <label>Beat Name *</label>

                      <input
                        style={inputStyle}
                        placeholder="e.g. 8-Beat Modern"
                        value={editData.beat_name}
                        onChange={e =>
                          onEditDataChange?.({
                            ...editData,
                            beat_name: e.target.value
                          })
                        }
                      />
                    </div>

                    <div>
                      <label>Beat Category</label>

                      <input
                        style={inputStyle}
                        placeholder="e.g. Ballad, Country…"
                        value={editData.location}
                        onChange={e =>
                          onEditDataChange?.({
                            ...editData,
                            location: e.target.value
                          })
                        }
                      />
                    </div>
                  </div>

                  <div
                    className="form-grid"
                    style={{ marginTop: '8px' }}
                  >
                    <div>
                      <label>Tempo (BPM)</label>

                      <input
                        style={inputStyle}
                        type="number"
                        placeholder="e.g. 92"
                        value={editData.tempo}
                        onChange={e =>
                          onEditDataChange?.({
                            ...editData,
                            tempo: e.target.value
                          })
                        }
                      />
                    </div>

                    <div>
                      <label>Key</label>

                      <input
                        style={inputStyle}
                        placeholder="e.g. G, Bb"
                        value={editData.key}
                        onChange={e =>
                          onEditDataChange?.({
                            ...editData,
                            key: e.target.value
                          })
                        }
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <label>Notes</label>

                    <textarea
                      style={{
                        ...inputStyle,
                        minHeight: '56px',
                        resize: 'vertical'
                      }}
                      placeholder="Fill levels, variations…"
                      value={editData.notes}
                      onChange={e =>
                        onEditDataChange?.({
                          ...editData,
                          notes: e.target.value
                        })
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '10px'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSaveEdit?.(style.id)}
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>

                    <button
                      type="button"
                      onClick={onCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="beat-row__summary">
                    <div className="beat-row__details">
                      <span className="beat-row__name">{beatDisplayName(style)}</span>
                      {beatMetaParts(style).map(part => (
                        <span key={part} className="beat-row__meta">
                          {part}
                        </span>
                      ))}
                    </div>

                    {style.keyboards?.model_name && (
                      <span className="beat-row__keyboard">
                        {style.keyboards.model_name}
                      </span>
                    )}
                  </div>

                  {style.notes && (
                    <p
                      style={{
                        fontSize: '0.79rem',
                        fontStyle: 'italic',
                        color: '#7a8899',
                        margin: '6px 0 0',
                        paddingTop: '5px',
                        borderTop: '1px dashed #e8eef4'
                      }}
                    >
                      {style.notes}
                    </p>
                  )}

                  {role?.approved && (
                    <details className="no-print" style={{ marginTop: '8px' }}>
                      <summary style={{ cursor: 'pointer', color: '#1a237e', fontSize: '0.78rem', fontWeight: 700 }}>
                        Beat actions
                      </summary>

                      <div
                        style={{
                          display: 'flex',
                          gap: '7px',
                          marginTop: '7px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onStartEdit?.(style)}
                        >
                          Edit Beat
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteBeat?.(style.id)}
                        >
                          Remove Beat
                        </button>
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p
            style={{
              fontSize: '0.82rem',
              color: '#b0bec5',
              padding: '12px 16px',
              margin: 0
            }}
          >
            No beats added yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default SongCard;
