import React, { useEffect, useMemo, useState } from 'react';

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

  const summary = useMemo(() => {
    if (!items.length) return 'No recent additions yet';
    const latest = items[0];
    return `${latest.songName} was added most recently`;
  }, [items]);

  if (!items.length) return null;

  return (
    <section className={`recent-additions no-print ${isOpen ? 'recent-additions--open' : 'recent-additions--closed'}`} aria-label="Recently added beats">
      <button
        type="button"
        className="recent-additions__toggle"
        onClick={() => setIsOpen(current => !current)}
        aria-expanded={isOpen}
      >
        <span className="recent-additions__icon" aria-hidden="true">🕘</span>
        <span className="recent-additions__title-block">
          <span className="recent-additions__eyebrow">Recently Added</span>
          <span className="recent-additions__title">Latest {items.length} additions</span>
          <span className="recent-additions__summary">{summary}</span>
        </span>
        <span className="recent-additions__count">{items.length}</span>
        <span className="recent-additions__chevron" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
      </button>

      {isOpen && (
        <div className="recent-additions__list">
          {items.map(item => (
            <article key={item.id} className="recent-additions__item">
              <div className="recent-additions__item-main">
                <strong>{item.songName}</strong>
                <div className="recent-additions__meta">
                  <span>{item.beatName || 'Unnamed beat'}</span>
                  {item.category && <span>{item.category}</span>}
                  {item.keyboardName && <span>{item.keyboardName}</span>}
                </div>
              </div>
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
