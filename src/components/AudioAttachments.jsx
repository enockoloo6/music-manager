import React, { useEffect, useRef, useState } from 'react';
import { deleteSongAudio, fetchSongAudio, uploadSongAudio } from '../services/songAudioService';

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

export default function AudioAttachments({ song, user, canManage }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [savingRecording, setSavingRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [recordingError, setRecordingError] = useState('');

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  async function load() {
    if (!song?.id) return;
    setLoading(true);
    try {
      setItems(await fetchSongAudio(song.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [song?.id]);

  useEffect(() => {
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      streamRef.current?.getTracks?.().forEach(track => track.stop());
    };
  }, [recordingUrl]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadSongAudio({ songId: song.id, file, userId: user?.id });
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(audio) {
    if (!window.confirm('Delete audio attachment?')) return;
    await deleteSongAudio(audio);
    await load();
  }

  async function startRecording() {
    setRecordingError('');
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
    } catch (err) {
      setRecordingError(err.message || 'Unable to access microphone.');
      streamRef.current?.getTracks?.().forEach(track => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
    }
  }

  function stopRecording() {
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
      alert(err.message);
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
              <button type="button" onClick={stopRecording} disabled={!recording}>
                ⏹ Stop Recording
              </button>
            </div>

            {recording && <div className="audio-recorder__status">Recording…</div>}
            {recordingError && <div className="audio-recorder__error">{recordingError}</div>}

            {recordingUrl && (
              <div className="audio-recorder__preview">
                <span>Preview recording</span>
                <audio controls src={recordingUrl} preload="metadata" />
                <div className="audio-recorder__controls">
                  <button type="button" onClick={saveRecording} disabled={savingRecording}>
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
          {items.length === 0 && <div className="audio-attachments__empty">No audio attachments yet.</div>}
          {items.map(audio => (
            <div key={audio.id} className="audio-attachments__item">
              {audio.signed_url && <audio controls src={audio.signed_url} preload="none" />}
              <span>{audio.file_name}</span>
              {canManage && (
                <button type="button" onClick={() => handleDelete(audio)}>
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
