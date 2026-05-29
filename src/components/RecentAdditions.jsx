import React from 'react';

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
  if (!items.length) return null;

  return (
    <section className="recent-additions no-print" aria-label="Recently added beats">
      <div className="recent-additions__header">
        <div>
          <div className="recent-additions__eyebrow">Recently Added</div>
          <h2>Latest 5 additions</h2>
        </div>
        <span>{items.length}</span>
      </div>

      <div className="recent-additions__list">
        {items.map(item => (
          <div key={item.id} className="recent-additions__item">
            <div>
              <strong>{item.songName}</strong>
              <div className="recent-additions__meta">
                {item.beatName || 'Unnamed beat'}
                {item.category ? ` (${item.category})` : ''}
                {item.keyboardName ? ` • ${item.keyboardName}` : ''}
              </div>
            </div>
            <time dateTime={item.createdAt || undefined}>{formatAddedDate(item.createdAt)}</time>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentAdditions;
