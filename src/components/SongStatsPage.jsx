function formatStatDate(value) {
  if (!value) return 'Date not recorded';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Date not recorded';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function SongStatsPage({ song, onBack }) {
  const presentations = song?.song_presentations || [];

  if (!song) {
    return (
      <section className="panel no-print song-stats-page">
        <h2>Song Stats</h2>
        <p>No song selected.</p>
        <button type="button" onClick={onBack}>Back to Library</button>
      </section>
    );
  }

  return (
    <section className="panel no-print song-stats-page">
      <div className="song-stats-page__header">
        <div>
          <span className="song-stats-page__eyebrow">Song Stats</span>
          <h2>{song.song_name}</h2>
          <p>
            Presented {presentations.length} time{presentations.length === 1 ? '' : 's'}.
          </p>
        </div>

        <button type="button" onClick={onBack}>Back to Library</button>
      </div>

      {presentations.length > 0 ? (
        <div className="song-stats-page__list">
          {presentations.map(presentation => (
            <article key={presentation.id} className="song-stats-page__item">
              <strong>{formatStatDate(presentation.presented_on)}</strong>
              {presentation.presenter?.email && (
                <span>Marked by {presentation.presenter.email}</span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="song-stats-page__empty">
          This song has not been marked as presented yet.
        </p>
      )}
    </section>
  );
}

export default SongStatsPage;
