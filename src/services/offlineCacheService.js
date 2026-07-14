const CACHE_PREFIX = 'music-manager-cache:';

function cacheKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

export function saveCachedValue(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(cacheKey(key), JSON.stringify({
      value,
      savedAt: new Date().toISOString()
    }));
  } catch (err) {
    console.error('offline cache save failed:', err);
  }
}

export function loadCachedValue(key) {
  if (typeof window === 'undefined') return null;

  try {
    const rawValue = window.localStorage.getItem(cacheKey(key));
    if (!rawValue) return null;
    return JSON.parse(rawValue);
  } catch (err) {
    console.error('offline cache load failed:', err);
    return null;
  }
}
