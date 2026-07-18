import LibraryStats from './LibraryStats';
import MostPresentedSongs from './MostPresentedSongs';
import RecentAdditions from './RecentAdditions';

function ReportsPage({ recentAdditions = [], songs = [], keyboards = [] }) {
  return (
    <section className="no-print" aria-label="Reports">
      <div className="panel" style={{ borderTop: '4px solid #1a237e' }}>
        <h2 style={{ margin: '0 0 16px', color: '#1a237e', fontSize: '1.05rem' }}>
          Reports
        </h2>

        <LibraryStats songs={songs} keyboards={keyboards} />
        <MostPresentedSongs songs={songs} />
        <RecentAdditions items={recentAdditions} />
      </div>
    </section>
  );
}

export default ReportsPage;
