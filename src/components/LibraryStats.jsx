function StatItem({ icon, label, value }) {
  return (
    <div className="library-stats__item">
      <span className="library-stats__icon" aria-hidden="true">{icon}</span>
      <span className="library-stats__value">{value}</span>
      <span className="library-stats__label">{label}</span>
    </div>
  );
}

function LibraryStats({ songs = [], keyboards = [] }) {
  const totalSongs = songs.length;
  const totalBeats = songs.reduce((count, song) => count + (song.styles?.length || 0), 0);
  const totalKeyboards = keyboards.length;
  const songsWithLyrics = songs.filter(song => Boolean(song.lyrics?.trim())).length;

  return (
    <section className="library-stats no-print" aria-label="Library statistics">
      <StatItem icon="🎵" label="Songs" value={totalSongs} />
      <StatItem icon="🥁" label="Beats" value={totalBeats} />
      <StatItem icon="🎹" label="Keyboards" value={totalKeyboards} />
      <StatItem icon="🎤" label="Lyrics" value={songsWithLyrics} />
    </section>
  );
}

export default LibraryStats;
