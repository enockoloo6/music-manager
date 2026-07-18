import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchSongAudio } from '../services/songAudioService';
import {
  attachCachedAudioUrls,
  buildAudioCacheEstimate,
  cacheAudioFile,
  getCachedAudioForSong,
  shouldAskBeforeAudioCache
} from '../services/offlineAudioCacheService';

function buildCachedAudioItems(cachedItems) {
  return (cachedItems || []).map(item => ({
    id: item.id,
    song_id: item.songId,
    file_name: item.fileName,
    mime_type: item.mimeType,
    size_bytes: item.sizeBytes,
    cached_audio: item,
    cached_url: URL.createObjectURL(item.blob)
  }));
}

function revokeCachedUrls(items) {
  (items || []).forEach(item => {
    if (item.cached_url) URL.revokeObjectURL(item.cached_url);
  });
}

function LyricsMode({ song, onClose }) {
  const [fontScale, setFontScale] = useState(1);
  const [audioItems, setAudioItems] = useState([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [audioCachePrompt, setAudioCachePrompt] = useState(null);
  const [audioCacheNotice, setAudioCacheNotice] = useState('');
  const [audioCaching, setAudioCaching] = useState(false);
  const onCloseRef = useRef(onClose);
  const historyStateRef = useRef(false);
  const lyricsBodyRef = useRef(null);

  const lyrics = song?.lyrics?.trim();
  const fontSize = useMemo(() => `${Math.round(1.55 * fontScale * 100) / 100}rem`, [fontScale]);
  const hasAudio = Boolean(song?.song_audio?.length);
  const activeAudio = audioItems.find(item => item.cached_url || item.signed_url);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    async function saveForOffline(items) {
      const estimate = buildAudioCacheEstimate(items);
      if (estimate.items.length === 0) return;

      setAudioCaching(true);
      setAudioCacheNotice('');

      try {
        await Promise.all(estimate.items.map(cacheAudioFile));
        const withCachedUrls = await attachCachedAudioUrls(items);
        if (!cancelled) {
          setAudioItems(withCachedUrls);
          setAudioCacheNotice('Audio saved for offline playback.');
        }
      } catch (err) {
        console.error('lyrics audio cache failed:', err);
        if (!cancelled) {
          setAudioCacheNotice('Audio could not be saved for offline playback.');
        }
      } finally {
        if (!cancelled) {
          setAudioCaching(false);
          setAudioCachePrompt(null);
        }
      }
    }

    async function loadAudio() {
      if (!song?.id || !hasAudio) {
        if (!cancelled) {
          setAudioItems([]);
          setAudioError('');
          setAudioLoading(false);
          setAudioCachePrompt(null);
        }
        return;
      }

      if (!cancelled) {
        setAudioLoading(true);
        setAudioError('');
        setAudioCachePrompt(null);
      }

      try {
        const items = await fetchSongAudio(song.id);
        const withCachedUrls = await attachCachedAudioUrls(items);
        if (!cancelled) {
          setAudioItems(withCachedUrls);
          const estimate = buildAudioCacheEstimate(withCachedUrls);
          if (estimate.items.length > 0) {
            if (shouldAskBeforeAudioCache()) {
              setAudioCachePrompt(estimate);
            } else {
              await saveForOffline(withCachedUrls);
            }
          }
        }
      } catch (err) {
        console.error('lyrics mode audio load error:', err);
        const cachedItems = buildCachedAudioItems(await getCachedAudioForSong(song.id));
        if (!cancelled) {
          setAudioItems(cachedItems);
          setAudioError(cachedItems.length > 0 ? '' : 'Audio could not be loaded here.');
          if (cachedItems.length > 0) {
            setAudioCacheNotice('Playing locally saved audio.');
          }
        }
      } finally {
        if (!cancelled) {
          setAudioLoading(false);
        }
      }
    }

    void Promise.resolve().then(loadAudio);

    return () => {
      cancelled = true;
    };
  }, [song?.id, hasAudio]);

  useEffect(() => {
    return () => revokeCachedUrls(audioItems);
  }, [audioItems]);

  useEffect(() => {
    document.body.classList.add('lyrics-mode-open');

    if (window.history?.pushState) {
      window.history.pushState(
        { ...(window.history.state || {}), musicManagerLyricsMode: true },
        '',
        window.location.href
      );
      historyStateRef.current = true;
    }

    function closeFromHistory() {
      historyStateRef.current = false;
      onCloseRef.current?.();
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeLyricsMode();
      }
    }

    function handlePopState() {
      closeFromHistory();
    }

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.body.classList.remove('lyrics-mode-open');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // Create one temporary history entry per opened lyrics screen.
  }, [song?.id]);

  function closeLyricsMode() {
    if (historyStateRef.current) {
      window.history.back();
      return;
    }

    onCloseRef.current?.();
  }

  if (!song) return null;

  return (
    <div className="lyrics-mode">
      <div className="lyrics-mode__topbar no-print">
        <div>
          <div className="lyrics-mode__label">Presentation Mode</div>
          <h1>{song.song_name}</h1>
        </div>

        <div className="lyrics-mode__actions">
          <button type="button" onClick={() => setFontScale(current => Math.max(0.8, current - 0.1))}>A−</button>
          <button type="button" onClick={() => setFontScale(current => Math.min(1.8, current + 0.1))}>A+</button>
          <button type="button" onClick={() => window.print()}>Print</button>
          <button type="button" className="lyrics-mode__close" onClick={closeLyricsMode}>Close</button>
        </div>
      </div>

      <main className="lyrics-mode__body" ref={lyricsBodyRef}>
        {lyrics ? (
          <pre style={{ fontSize }}>{lyrics}</pre>
        ) : (
          <div className="lyrics-mode__empty">
            No lyrics have been saved for this song yet.
          </div>
        )}
      </main>

      {hasAudio && (
        <div className="lyrics-mode__audio no-print">
          <div className="lyrics-mode__audio-copy">
            <span className="lyrics-mode__audio-label">Audio</span>
            <span className="lyrics-mode__audio-name">
              {activeAudio?.file_name || (audioLoading ? 'Loading audio...' : 'Background playback')}
            </span>
          </div>

          {activeAudio ? (
            <audio
              controls
              src={activeAudio.cached_url || activeAudio.signed_url}
              preload="metadata"
            />
          ) : (
            <div className="lyrics-mode__audio-empty">
              {audioLoading ? 'Preparing player...' : audioError || 'No playable audio found.'}
            </div>
          )}

          {audioCachePrompt && (
            <div className="lyrics-mode__audio-cache">
              <span>Save offline? Est. data: {audioCachePrompt.label}</span>
              <button type="button" onClick={() => {
                const items = audioItems;
                setAudioCaching(true);
                Promise.all(buildAudioCacheEstimate(items).items.map(cacheAudioFile))
                  .then(() => attachCachedAudioUrls(items))
                  .then(withCachedUrls => {
                    setAudioItems(withCachedUrls);
                    setAudioCacheNotice('Audio saved offline.');
                  })
                  .catch(err => {
                    console.error('lyrics audio cache failed:', err);
                    setAudioCacheNotice('Could not save audio offline.');
                  })
                  .finally(() => {
                    setAudioCaching(false);
                    setAudioCachePrompt(null);
                  });
              }} disabled={audioCaching}>
                {audioCaching ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setAudioCachePrompt(null)} disabled={audioCaching}>Not now</button>
            </div>
          )}
          {audioCacheNotice && <div className="lyrics-mode__audio-cache">{audioCacheNotice}</div>}
        </div>
      )}
    </div>
  );
}

export default LyricsMode;
