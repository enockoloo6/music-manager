const DB_NAME = 'music-manager-offline-audio';
const DB_VERSION = 1;
const STORE_NAME = 'audio';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Offline audio storage is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('songId', 'songId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Offline audio storage failed.'));
  });
}

async function runStore(mode, callback) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Offline audio request failed.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Offline audio transaction failed.'));
    };
  });
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'unknown size';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function getConnectionCost() {
  if (typeof navigator === 'undefined') return 'unknown';

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return 'unknown';
  if (connection.saveData) return 'metered';
  if (connection.type === 'wifi' || connection.type === 'ethernet') return 'unmetered';
  if (connection.type === 'cellular') return 'metered';

  return 'unknown';
}

export function shouldAskBeforeAudioCache() {
  return getConnectionCost() !== 'unmetered';
}

export async function getCachedAudio(audioId) {
  if (!audioId) return null;

  try {
    return await runStore('readonly', store => store.get(audioId));
  } catch (err) {
    console.error('offline audio get failed:', err);
    return null;
  }
}

export async function getCachedAudioForSong(songId) {
  if (!songId) return [];

  try {
    return await runStore('readonly', store => store.index('songId').getAll(songId));
  } catch (err) {
    console.error('offline song audio get failed:', err);
    return [];
  }
}

export async function cacheAudioFile(audio) {
  if (!audio?.id || !audio?.signed_url) {
    throw new Error('Playable audio link is required before it can be cached.');
  }

  const response = await fetch(audio.signed_url);
  if (!response.ok) {
    throw new Error('Audio download failed.');
  }

  const blob = await response.blob();
  const record = {
    id: audio.id,
    songId: audio.song_id,
    fileName: audio.file_name || 'Audio',
    mimeType: audio.mime_type || blob.type || 'audio/mpeg',
    sizeBytes: audio.size_bytes || blob.size,
    blob,
    cachedAt: new Date().toISOString()
  };

  await runStore('readwrite', store => store.put(record));
  return record;
}

export async function attachCachedAudioUrls(items) {
  const rows = items || [];

  return Promise.all(rows.map(async item => {
    const cached = await getCachedAudio(item.id);
    if (!cached?.blob) return item;

    return {
      ...item,
      cached_audio: cached,
      cached_url: URL.createObjectURL(cached.blob)
    };
  }));
}

export async function getUncachedAudioItems(items) {
  const rows = items || [];
  const results = await Promise.all(rows.map(async item => ({
    item,
    cached: await getCachedAudio(item.id)
  })));

  return results
    .filter(result => result.item.signed_url && !result.cached?.blob)
    .map(result => result.item);
}

export function buildAudioCacheEstimate(items) {
  const uncachedItems = (items || []).filter(item => item.signed_url && !item.cached_audio);
  const knownBytes = uncachedItems.reduce((total, item) => total + (Number(item.size_bytes) || 0), 0);

  return {
    items: uncachedItems,
    bytes: knownBytes,
    label: formatBytes(knownBytes)
  };
}
