import { useState } from 'react';

function LyricsEditorForm({ song, saving, onCancel, onSave }) {
  const [lyrics, setLyrics] = useState(song?.lyrics || '');

  if (!song) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSave?.(song, lyrics);
  }

  return (
    <form className="lyrics-editor app-work-form app-work-form--edit no-print" onSubmit={handleSubmit}>
      <div className="app-work-form__banner">
        <span>Editing Lyrics</span>
        <strong>{song.song_name}</strong>
      </div>

      <textarea
        value={lyrics}
        onChange={e => setLyrics(e.target.value)}
        placeholder="Paste song lyrics here..."
        rows={12}
      />

      <div className="lyrics-editor__actions">
        <span>{lyrics.trim().length} characters</span>
        <div>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving lyrics...' : 'Save lyrics'}
          </button>
          <button type="button" className="lyrics-editor__cancel" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

function LyricsEditor({ song, saving = false, onCancel, onSave }) {
  return (
    <LyricsEditorForm
      key={`${song?.id || 'empty'}:${song?.lyrics || ''}`}
      song={song}
      saving={saving}
      onCancel={onCancel}
      onSave={onSave}
    />
  );
}

export default LyricsEditor;
