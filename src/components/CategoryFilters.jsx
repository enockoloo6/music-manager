function CategoryFilters({ categories = [], selectedCategory = 'All', onSelect }) {
  if (!categories.length) return null;

  return (
    <section className="category-filters no-print" aria-label="Category quick filters">
      {categories.map(category => {
        const active = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            className={`category-filters__pill ${active ? 'category-filters__pill--active' : ''}`}
            onClick={() => onSelect?.(active ? 'All' : category)}
            aria-pressed={active}
          >
            {active && category !== 'All' ? '🎵 ' : ''}{category}
          </button>
        );
      })}
    </section>
  );
}

export default CategoryFilters;
