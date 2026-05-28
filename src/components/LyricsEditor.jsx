import React, { useEffect, useState } from 'react';

function LyricsEditor({ song, saving = false, onCancel, onSave }) {
  const [lyrics, setLyrics] = useState(song?.lyrics || '');

  useEffect(() => {
    setLyrics(song?.lyrics || '');
  }, [song]);

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

export default LyricsEditor;
