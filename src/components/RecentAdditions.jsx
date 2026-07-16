import { useEffect, useState } from 'react';

const STORAGE_KEY = 'music-manager-recent-additions-open';

function formatAddedDate(value) {
  if (!value) return 'date not recorded';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'date not recorded';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function RecentAdditions({ items = [] }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(STORAGE_KEY) !== 'false';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(isOpen));
    }
  }, [isOpen]);

  if (!items.length) return null;

  return (
    <section className={`recent-additions no-print ${isOpen ? 'recent-additions--open' : 'recent-additions--closed'}`} aria-label="Recently added songs">
      <button
        type="button"
        className="recent-additions__toggle"
        onClick={() => setIsOpen(current => !current)}
        aria-expanded={isOpen}
      >
        <span className="recent-additions__icon" aria-hidden="true">🕘</span>
        <span className="recent-additions__title">Recently Added</span>
        <span className="recent-additions__chevron" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
      </button>

      {isOpen && (
        <div className="recent-additions__list">
          {items.map(item => (
            <article key={item.id} className="recent-additions__item">
              <strong>{item.songName}</strong>
              <time className="recent-additions__date" dateTime={item.createdAt || undefined}>
                {formatAddedDate(item.createdAt)}
              </time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentAdditions;
