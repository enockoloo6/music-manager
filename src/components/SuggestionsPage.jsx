const SUGGESTION_AREAS = [
  { value: 'consecration', label: 'Consecration' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'library', label: 'Library' },
  { value: 'other', label: 'Other' }
];

function formatSuggestionDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getAreaLabel(value) {
  return SUGGESTION_AREAS.find(area => area.value === value)?.label || value;
}

function SuggestionsPage({
  suggestions = [],
  formData,
  onFormChange,
  onSubmit,
  onViewDetails,
  onDelete,
  existingSongNames = [],
  saving = false,
  canDelete = false,
  canSeeSuggestions = false
}) {
  const normalizedSongName = formData.song_name?.trim().toLowerCase();
  const existingSongMatch = existingSongNames.find(songName => songName.toLowerCase() === normalizedSongName);

  return (
    <section className="suggestions-page no-print" aria-labelledby="suggestions-heading">
      <div className="suggestions-page__header">
        <span className="suggestions-page__eyebrow">Song input</span>
        <h2 id="suggestions-heading">Suggestions</h2>
        <p>
          Search the existing library first. Add a suggestion only when the song is not already listed.
          Suggestions stay here until someone with permission reviews them. Songs are added manually by the responsible user.
        </p>
      </div>

      <form className="suggestions-form app-work-form app-work-form--add" onSubmit={onSubmit}>
        <div className="app-work-form__banner">
          <span>Adding Suggestion</span>
          <strong>Song suggestion</strong>
        </div>

        <div className="form-grid">
          <div>
            <label>Song Name *</label>
            <input
              value={formData.song_name}
              onChange={event => onFormChange?.({ ...formData, song_name: event.target.value })}
              placeholder="Search or type the song"
              list="suggestion-existing-song-options"
              required
            />
            <datalist id="suggestion-existing-song-options">
              {existingSongNames.map(songName => (
                <option key={songName} value={songName} />
              ))}
            </datalist>
            <span className={existingSongMatch ? 'suggestions-form__match suggestions-form__match--found' : 'suggestions-form__match'}>
              {existingSongMatch
                ? `"${existingSongMatch}" is already in the library. Use the existing song instead of suggesting it.`
                : 'Type here to search the current library before submitting.'}
            </span>
          </div>

          <div>
            <label>Suggestion For *</label>
            <select
              value={formData.suggestion_area}
              onChange={event => onFormChange?.({ ...formData, suggestion_area: event.target.value })}
              required
            >
              {SUGGESTION_AREAS.map(area => (
                <option key={area.value} value={area.value}>{area.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label>Your Name (Optional)</label>
          <input
            value={formData.suggester_name || ''}
            onChange={event => onFormChange?.({ ...formData, suggester_name: event.target.value })}
            placeholder="Type your name if you want"
          />
        </div>

        <div>
          <label>Details</label>
          <textarea
            value={formData.details}
            onChange={event => onFormChange?.({ ...formData, details: event.target.value })}
            placeholder="Anything helpful about the song, version, language, or occasion."
            rows={4}
          />
        </div>

        <div className="app-work-form__actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Submit Suggestion'}
          </button>
        </div>
      </form>

      {canSeeSuggestions && (
        <div className="suggestions-list">
          {suggestions.length === 0 ? (
            <p className="suggestions-list__empty">No suggestions yet.</p>
          ) : (
            suggestions.map(suggestion => (
              <article key={suggestion.id} className="suggestion-card">
                <div className="suggestion-card__main">
                  <div>
                    <strong>{suggestion.song_name}</strong>
                    <span>{getAreaLabel(suggestion.suggestion_area)}</span>
                    {suggestion.suggester_name && (
                      <span>Suggested by: {suggestion.suggester_name}</span>
                    )}
                  </div>
                  <small>
                    {suggestion.suggester_email || 'Unknown user'}
                    {suggestion.created_at ? ` | ${formatSuggestionDate(suggestion.created_at)}` : ''}
                  </small>
                </div>

                {suggestion.details && <p>{suggestion.details}</p>}

                {canDelete && (
                  <div className="suggestion-card__review">
                    <button type="button" onClick={() => onViewDetails?.(suggestion)} disabled={saving}>
                      View Details
                    </button>

                    <button type="button" className="suggestion-card__delete" onClick={() => onDelete?.(suggestion)} disabled={saving}>
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default SuggestionsPage;
