function formatRecentPresentation(value) {
  if (!value) return 'No date';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function MostPresentedSongs({ songs = [] }) {
  const rankedSongs = songs
    .map(song => {
      const presentations = song.song_presentations || [];
      return {
        id: song.id,
        name: song.song_name,
        count: presentations.length,
        lastPresented: presentations[0]?.presented_on || null
      };
    })
    .filter(song => song.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);

  if (rankedSongs.length === 0) return null;

  return (
    <section className="most-presented no-print" aria-label="Most presented songs">
      <h3>Most Presented Songs</h3>

      <div className="most-presented__list">
        {rankedSongs.map(song => (
          <article key={song.id} className="most-presented__item">
            <div>
              <strong>{song.name}</strong>
              <span>Last presented {formatRecentPresentation(song.lastPresented)}</span>
            </div>
            <span className="most-presented__count">
              {song.count}x
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MostPresentedSongs;
