import { Fragment, useState } from 'react';
import AudioAttachments from './AudioAttachments';
import LyricsEditor from './LyricsEditor';

function getFirstLyricLine(lyrics) {
  return (lyrics || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean) || '';
}

function isDisplayableBeatUse(value) {
  return ['Worship', 'Praise', 'Other'].includes(value);
}

function beatMetaParts(style) {
  return [
    isDisplayableBeatUse(style.style_category) ? style.style_category : null,
    style.tempo ? `${style.tempo} BPM` : null,
    style.musical_key ? `Key ${style.musical_key}` : null
  ].filter(Boolean);
}

function beatDisplayName(style) {
  const category = style.keyboard_location?.trim();
  return category ? `${style.beat_name} (${category})` : style.beat_name;
}

function formatPresentationDate(value) {
  if (!value) return '';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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
  onDuplicateSong,
  onMarkPresented,
  onOpenSongStats,
  onRequestSongVisibilityChange,
  onUpdateSongPlanning,
  onStartSongEdit,
  onCancelSongEdit,
  onSaveSongEdit,
  onEditSongNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDataChange,
  onEditLyrics,
  onOpenLyrics,
  onSaveLyrics,
  user,
  canManageAudio,
  isEditingSong,
  editSongName,
  isEditingLyrics
}) {
  const [showMore, setShowMore] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showBeats, setShowBeats] = useState(false);
  const hasLyrics = Boolean(getFirstLyricLine(song.lyrics));
  const hasAudio = (song.song_audio?.length || 0) > 0;
  const hasBeats = (song.styles?.length || 0) > 0;
  const hasPresentationDate = Boolean(song.is_highlighted && song.presentation_date);
  const presentationCount = song.song_presentations?.length || 0;
  const canManageSong = Boolean(role?.approved || role?.admin);
  const canOpenAudio = hasAudio || canManageAudio;
  const hasPublicDetails = !canManageSong && Boolean(hasBeats || hasPresentationDate);
  const hasMoreActions = Boolean(canManageSong || hasPublicDetails);
  const showPublicDetails = hasPublicDetails && showMore;
  const cardClasses = [
    'card',
    'song-card',
    song.is_highlighted ? 'song-card--highlighted' : '',
    song.is_hidden ? 'song-card--hidden' : ''
  ].filter(Boolean).join(' ');

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

  function openLyricsEditor() {
    setShowMore(false);
    setShowAudio(false);
    setShowBeats(false);
    onEditLyrics?.(song);
  }

  function openLyricsMode() {
    setShowMore(false);
    setShowAudio(false);
    setShowBeats(false);
    onOpenLyrics?.(song);
  }

  function toggleAudio() {
    setShowAudio(current => {
      const nextOpen = !current;
      if (nextOpen) {
        setShowMore(false);
        setShowBeats(false);
        onEditLyrics?.(null);
      }
      return nextOpen;
    });
  }

  function toggleBeats() {
    setShowBeats(current => {
      const nextOpen = !current;
      if (nextOpen) {
        setShowMore(false);
        setShowAudio(false);
        onEditLyrics?.(null);
      }
      return nextOpen;
    });
  }

  function toggleMore() {
    setShowMore(current => {
      const nextOpen = !current;
      if (nextOpen) {
        setShowAudio(false);
        setShowBeats(false);
        onEditLyrics?.(null);
      }
      return nextOpen;
    });
  }

  return (
    <div className={cardClasses}>
      <div className="card-header song-card__header">
        <div className="song-card__title-wrap">
          <strong className="song-title">{song.song_name}</strong>
          {song.is_highlighted && (
            <span className="song-card__status song-card__status--highlighted">
              Highlighted
            </span>
          )}
          {song.is_hidden && role?.admin && (
            <span className="song-card__status song-card__status--hidden">
              Hidden
            </span>
          )}
        </div>

        <div className="song-card__actions no-print">
          {hasLyrics ? (
            <button type="button" className="song-card__link-action" onClick={openLyricsMode}>
              Lyrics
            </button>
          ) : role?.approved ? (
            <button
              type="button"
              className={`song-card__link-action song-card__link-action--needed${isEditingLyrics ? ' song-card__link-action--active' : ''}`}
              onClick={openLyricsEditor}
              aria-expanded={isEditingLyrics}
            >
              Add Lyrics
            </button>
          ) : null}

          {canOpenAudio && (
            <button
              type="button"
              className={`song-card__link-action${hasAudio ? '' : ' song-card__link-action--needed'}${showAudio ? ' song-card__link-action--active' : ''}`}
              onClick={toggleAudio}
              aria-expanded={showAudio}
            >
              {showAudio ? 'Hide Audio' : hasAudio ? 'Audio' : 'Add Audio'}
            </button>
          )}

          {hasBeats && canManageSong && (
            <button
              type="button"
              className={`song-card__link-action${showBeats ? ' song-card__link-action--active' : ''}`}
              onClick={toggleBeats}
              aria-expanded={showBeats}
            >
              {showBeats ? 'Hide Beats' : 'Beats'}
            </button>
          )}

          {hasMoreActions && (
            <button
              type="button"
              className={`song-card__link-action${showMore ? ' song-card__link-action--active' : ''}`}
              onClick={toggleMore}
              aria-expanded={showMore}
            >
              {showMore ? 'Hide More' : 'More'}
            </button>
          )}
        </div>
      </div>

      {showMore && (canManageSong || hasPresentationDate) && (
        <div className="song-card__more no-print">
          {hasPresentationDate && (
            <div className="song-card__presentation">
              <span className="song-card__presentation-label">Presentation</span>
              <strong>{formatPresentationDate(song.presentation_date)}</strong>
              {song.presentation_owner?.email && (
                <span>Marked by {song.presentation_owner.email}</span>
              )}
            </div>
          )}

          {role?.admin && (
            <div className="song-card__planning">
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(song.is_highlighted)}
                  onChange={event => onUpdateSongPlanning?.(song.id, { is_highlighted: event.target.checked })}
                  disabled={saving}
                />
                Highlight song
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={Boolean(song.is_hidden)}
                  onChange={event => onRequestSongVisibilityChange?.(song, event.target.checked)}
                  disabled={saving}
                />
                Hide from library
              </label>

              <label>
                Presentation date
                <input
                  type="date"
                  value={song.presentation_date || ''}
                  onChange={event => onUpdateSongPlanning?.(song.id, { presentation_date: event.target.value })}
                  disabled={saving}
                />
              </label>
            </div>
          )}

          {canManageSong && (
            <div className="song-card__more-actions">
              {role?.approved && (
                <button
                  type="button"
                  onClick={() => onStartSongEdit?.(song)}
                >
                  Edit Song
                </button>
              )}

              {role?.approved && (
                <button
                  type="button"
                  onClick={() => onDuplicateSong?.(song)}
                  disabled={saving}
                >
                  Duplicate Song
                </button>
              )}

              {role?.approved && hasLyrics && (
                <button
                  type="button"
                  onClick={openLyricsEditor}
                >
                  Edit Lyrics
                </button>
              )}

              {canManageSong && (
                <button
                  type="button"
                  onClick={() => onMarkPresented?.(song)}
                  disabled={saving}
                >
                  Mark Presented
                </button>
              )}

              {canManageSong && (
                <button
                  type="button"
                  onClick={() => onOpenSongStats?.(song)}
                >
                  Song Stats{presentationCount ? ` (${presentationCount})` : ''}
                </button>
              )}

              {role?.admin && (
                <button
                  type="button"
                  onClick={() => onDeleteSong?.(song)}
                  className="song-card__delete"
                >
                  Delete Song
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isEditingSong && (
        <form
          className="song-card__song-editor no-print"
          onSubmit={event => {
            event.preventDefault();
            onSaveSongEdit?.(song.id);
          }}
        >
          <div>
            <label>Song Name</label>
            <input
              value={editSongName}
              onChange={event => onEditSongNameChange?.(event.target.value)}
              required
            />
          </div>

          <div className="song-card__song-editor-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Song'}
            </button>
            <button type="button" onClick={onCancelSongEdit} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
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

      {(showBeats || showPublicDetails) && (
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

                  <div
                    className="form-grid"
                    style={{ marginTop: '8px' }}
                  >
                    <div>
                      <label>Beat Use</label>
                      <select
                        style={{
                          ...inputStyle,
                          padding: '6px 8px'
                        }}
                        value={editData.beat_use}
                        onChange={e =>
                          onEditDataChange?.({
                            ...editData,
                            beat_use: e.target.value
                          })
                        }
                      >
                        <option value="">Not specified</option>
                        <option value="Worship">Worship</option>
                        <option value="Praise">Praise</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', letterSpacing: 0 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(editData.is_favorite)}
                        onChange={e =>
                          onEditDataChange?.({
                            ...editData,
                            is_favorite: e.target.checked
                          })
                        }
                        style={{ width: 'auto' }}
                      />
                      Preferred beat
                    </label>
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
                      {style.is_favorite && (
                        <>
                          <span className="beat-row__separator">|</span>
                          <span className="beat-row__meta beat-row__meta--favorite">
                            Preferred
                          </span>
                        </>
                      )}
                      {beatMetaParts(style).map(part => (
                        <Fragment key={part}>
                          <span className="beat-row__separator">|</span>
                          <span className="beat-row__meta">
                            {part}
                          </span>
                        </Fragment>
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
                          onClick={() => onDeleteBeat?.(style)}
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
      )}
    </div>
  );
}

export default SongCard;
