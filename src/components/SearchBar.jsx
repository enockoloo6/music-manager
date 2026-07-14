function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar no-print">
      <input
        placeholder="🔍 Search songs or lyrics..."
        value={value}
        onChange={e => onChange?.(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
