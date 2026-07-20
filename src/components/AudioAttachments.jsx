import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteSongAudio, fetchSongAudio, uploadSongAudio } from '../services/songAudioService';
import {
  attachCachedAudioUrls,
  buildAudioCacheEstimate,
  cacheAudioFile,
  getCachedAudioForSong,
  shouldAskBeforeAudioCache
} from '../services/offlineAudioCacheService';

const MAX_RECORDING_SECONDS = 300;

function getPreferredAudioMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg'
  ];

  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || '';
}

function getRecordingExtension(mimeType) {
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('mpeg')) return 'mp3';
  return 'webm';
}

function getAudioLoadMessage(err, user) {
  const message = err?.message || 'Audio could not be loaded.';
  const lowerMessage = message.toLowerCase();

  if (!user) {
    return 'Audio exists, but public playback is not enabled for this file yet.';
  }

  if (lowerMessage.includes('permission') || lowerMessage.includes('policy') || lowerMessage.includes('rls')) {
    return 'Audio exists, but your account does not currently have permission to read it.';
  }

  return message;
}

function formatRecordingTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

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

export default function AudioAttachments({ song, user, canManage, onNotify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [savingRecording, setSavingRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [recordingError, setRecordingError] = useState('');
  const [recordingNotice, setRecordingNotice] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioToDelete, setAudioToDelete] = useState(null);
  const [cachePrompt, setCachePrompt] = useState(null);
  const [cacheNotice, setCacheNotice] = useState('');
  const [cachingAudio, setCachingAudio] = useState(false);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const recordingTimeoutRef = useRef(null);

  function clearRecordingTimers() {
    if (recordingIntervalRef.current) {
      window.clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }

  const saveAudioForOffline = useCallback(async targetItems => {
    const estimate = buildAudioCacheEstimate(targetItems);
    if (estimate.items.length === 0) return;

    setCachingAudio(true);
    setCacheNotice('');

    try {
      await Promise.all(estimate.items.map(cacheAudioFile));
      const withCachedUrls = await attachCachedAudioUrls(targetItems);
      setItems(withCachedUrls);
      setCacheNotice('Audio saved for offline playback.');
    } catch (err) {
      console.error('offline audio cache failed:', err);
      setCacheNotice('Audio could not be saved for offline playback.');
    } finally {
      setCachingAudio(false);
      setCachePrompt(null);
    }
  }, []);

  const prepareOfflineCache = useCallback(async loadedItems => {
    const estimate = buildAudioCacheEstimate(loadedItems);
    if (estimate.items.length === 0) return;

    if (shouldAskBeforeAudioCache()) {
      setCachePrompt(estimate);
      return;
    }

    await saveAudioForOffline(loadedItems);
  }, [saveAudioForOffline]);

  const load = useCallback(async () => {
    if (!song?.id) return;
    setLoading(true);
    setLoadError('');
    setCachePrompt(null);
    try {
      const onlineItems = await fetchSongAudio(song.id);
      const withCachedUrls = await attachCachedAudioUrls(onlineItems);
      setItems(withCachedUrls);
      await prepareOfflineCache(withCachedUrls);
    } catch (err) {
      console.error('audio load error:', err);
      const cachedItems = buildCachedAudioItems(await getCachedAudioForSong(song.id));
      setItems(cachedItems);
      setLoadError(cachedItems.length > 0 ? '' : getAudioLoadMessage(err, user));
      if (cachedItems.length > 0) {
        setCacheNotice('Playing locally saved audio.');
      }
    } finally {
      setLoading(false);
    }
  }, [prepareOfflineCache, song?.id, user]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    return () => {
      clearRecordingTimers();
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      streamRef.current?.getTracks?.().forEach(track => track.stop());
    };
  }, [recordingUrl]);

  useEffect(() => {
    return () => revokeCachedUrls(items);
  }, [items]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadSongAudio({ songId: song.id, file, userId: user?.id });
      await load();
    } catch (err) {
      onNotify?.(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(audio) {
    await deleteSongAudio(audio);
    setAudioToDelete(null);
    await load();
  }

  async function startRecording() {
    setRecordingError('');
    setRecordingNotice('');
    setRecordingSeconds(0);
    setRecordedBlob(null);
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl('');

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingError('Microphone recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getPreferredAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = event => {
        if (event.data?.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blobType = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        setRecordedBlob(blob);
        setRecordingUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
      };

      recorder.start();
      setRecording(true);
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(current => Math.min(current + 1, MAX_RECORDING_SECONDS));
      }, 1000);
      recordingTimeoutRef.current = window.setTimeout(() => {
        setRecordingNotice(`Recording stopped at the ${formatRecordingTime(MAX_RECORDING_SECONDS)} maximum.`);
        stopRecording();
      }, MAX_RECORDING_SECONDS * 1000);
    } catch (err) {
      setRecordingError(err.message || 'Unable to access microphone.');
      clearRecordingTimers();
      streamRef.current?.getTracks?.().forEach(track => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
    }
  }

  function stopRecording() {
    clearRecordingTimers();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    setRecording(false);
  }

  function discardRecording() {
    setRecordedBlob(null);
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl('');
    setRecordingError('');
    setRecordingNotice('');
    setRecordingSeconds(0);
  }

  async function saveRecording() {
    if (!recordedBlob) return;

    setSavingRecording(true);
    try {
      const mimeType = recordedBlob.type || 'audio/webm';
      const extension = getRecordingExtension(mimeType);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([recordedBlob], `microphone-recording-${timestamp}.${extension}`, {
        type: mimeType
      });

      await uploadSongAudio({ songId: song.id, file, userId: user?.id });
      discardRecording();
      await load();
    } catch (err) {
      onNotify?.(err.message);
    } finally {
      setSavingRecording(false);
    }
  }

  return (
    <div className="audio-attachments">
      <strong>🔊 Audio</strong>

      {canManage && (
        <div className="audio-attachments__manager">
          <label className="audio-attachments__upload">
            <span>Upload audio</span>
            <input type="file" accept="audio/*" onChange={handleUpload} disabled={uploading || recording} />
          </label>

          <div className="audio-recorder">
            <div className="audio-recorder__controls">
              <button type="button" onClick={startRecording} disabled={recording || uploading || savingRecording}>
                🎙 Start Recording
              </button>
              <button type="button" onClick={() => stopRecording()} disabled={!recording}>
                ⏹ Stop Recording
              </button>
            </div>

            <div className="audio-recorder__limit">
              Max recording time: {formatRecordingTime(MAX_RECORDING_SECONDS)}
            </div>

            {recording && (
              <div className="audio-recorder__status">
                Recording {formatRecordingTime(recordingSeconds)} / {formatRecordingTime(MAX_RECORDING_SECONDS)}
              </div>
            )}
            {recordingNotice && <div className="audio-recorder__notice">{recordingNotice}</div>}
            {recordingError && <div className="audio-recorder__error">{recordingError}</div>}

            {recordingUrl && (
              <div className="audio-recorder__preview">
                <span>Preview recording</span>
                <audio controls src={recordingUrl} preload="metadata" />
                <div className="audio-recorder__controls">
                  <button
                    type="button"
                    className="audio-recorder__save"
                    onClick={saveRecording}
                    disabled={savingRecording}
                  >
                    ☁ Save Recording
                  </button>
                  <button type="button" onClick={discardRecording} disabled={savingRecording}>
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading audio…</div>
      ) : (
        <div className="audio-attachments__list">
          {loadError && <div className="audio-attachments__error">{loadError}</div>}
          {cacheNotice && <div className="audio-attachments__cache-note">{cacheNotice}</div>}
          {cachePrompt && (
            <div className="audio-attachments__cache-prompt">
              <span>
                Save this audio for offline use? Estimated mobile data: {cachePrompt.label}.
              </span>
              <div className="audio-attachments__cache-actions">
                <button type="button" onClick={() => saveAudioForOffline(items)} disabled={cachingAudio}>
                  {cachingAudio ? 'Saving...' : 'Save Offline'}
                </button>
                <button type="button" onClick={() => setCachePrompt(null)} disabled={cachingAudio}>
                  Not Now
                </button>
              </div>
            </div>
          )}
          {!loadError && items.length === 0 && <div className="audio-attachments__empty">No audio attachments yet.</div>}
          {items.map(audio => (
            <div key={audio.id} className="audio-attachments__item">
              {audio.cached_url || audio.signed_url ? (
                <audio controls src={audio.cached_url || audio.signed_url} preload="none" />
              ) : (
                <div className="audio-attachments__error">
                  Audio file found, but playback link could not be generated.
                </div>
              )}
              <span>
                {audio.file_name}
                {audio.cached_audio && <small className="audio-attachments__offline-label">Offline ready</small>}
              </span>
              {canManage && (
                <button type="button" onClick={() => setAudioToDelete(audio)}>
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {audioToDelete && (
        <div className="app-modal no-print" role="dialog" aria-modal="true" aria-labelledby="delete-audio-title">
          <div className="app-modal__panel">
            <div>
              <span className="app-modal__eyebrow">Delete audio</span>
              <h2 id="delete-audio-title">Delete audio attachment?</h2>
              <p>This removes the recording from this song.</p>
            </div>

            <div className="app-modal__actions">
              <button type="button" className="app-modal__danger" onClick={() => handleDelete(audioToDelete)}>
                Delete Audio
              </button>
              <button type="button" onClick={() => setAudioToDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
