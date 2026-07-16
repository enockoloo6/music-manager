import { useState } from 'react';

function LyricsEditorForm({ song, saving, onCancel, onSave }) {
  const [lyrics, setLyrics] = useState(song?.lyrics || '');

  if (!song) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSave?.(song, lyrics);
  }

  return (
    <form className="lyrics-editor no-print" onSubmit={handleSubmit}>
      <div className="lyrics-editor__header">
        <div>
          <div className="lyrics-editor__label">Song lyrics</div>
          <strong>{song.song_name}</strong>
        </div>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>

      <textarea
        value={lyrics}
        onChange={e => setLyrics(e.target.value)}
        placeholder="Paste song lyrics here..."
        rows={12}
      />

      <div className="lyrics-editor__actions">
        <span>{lyrics.trim().length} characters</span>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving lyrics...' : 'Save lyrics'}
        </button>
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
