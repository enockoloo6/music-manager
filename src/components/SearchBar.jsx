import React from 'react';

function SearchBar({ value, onChange, resultCount, totalCount }) {
  return (
    <div className="search-bar no-print">
      <input
        placeholder="🔍 Search songs or lyrics..."
        value={value}
        onChange={e => onChange?.(e.target.value)}
      />
      <div className="search-bar__meta">
        {value?.trim()
          ? `${resultCount} of ${totalCount} song${totalCount === 1 ? '' : 's'} matched`
          : `${totalCount} song${totalCount === 1 ? '' : 's'} in library`}
      </div>
    </div>
  );
}

export default SearchBar;
