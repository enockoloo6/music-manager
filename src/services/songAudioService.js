import { supabase } from '../supabaseClient';

export const AUDIO_BUCKET = 'music-manager-audio';

function requireSongId(songId) {
  if (!songId) {
    throw new Error('Song ID is required.');
  }
}

function safeFileName(name) {
  return (name || 'audio-file')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'audio-file';
}

function buildStoragePath({ userId, songId, fileName }) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${userId}/${songId}/${timestamp}-${safeFileName(fileName)}`;
}

async function attachSignedUrls(records) {
  const rows = records || [];

  return Promise.all(rows.map(async record => {
    if (!record.storage_path) return record;

    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(record.storage_path, 60 * 60);

    if (error) {
      console.error('audio signed URL error:', error.message);
      return { ...record, signed_url: null, signed_url_error: error.message };
    }

    return { ...record, signed_url: data?.signedUrl || null };
  }));
}

export async function fetchSongAudio(songId) {
  requireSongId(songId);

  const { data, error } = await supabase
    .from('song_audio')
    .select('*')
    .eq('song_id', songId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return attachSignedUrls(data || []);
}

export async function uploadSongAudio({ songId, file, userId }) {
  requireSongId(songId);

  if (!file) {
    throw new Error('Please select an audio file.');
  }

  if (!userId) {
    throw new Error('You must be signed in to upload audio.');
  }

  if (!file.type?.startsWith('audio/')) {
    throw new Error('Only audio files are allowed.');
  }

  const storagePath = buildStoragePath({ userId, songId, fileName: file.name });

  const { error: uploadError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from('song_audio')
    .insert({
      song_id: songId,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size || null,
      created_by: userId
    })
    .select('*')
    .single();

  if (insertError) {
    await supabase.storage.from(AUDIO_BUCKET).remove([storagePath]);
    throw insertError;
  }

  return data;
}

export async function deleteSongAudio(audio) {
  if (!audio?.id) {
    throw new Error('Audio record ID is required.');
  }

  if (audio.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([audio.storage_path]);

    if (storageError) throw storageError;
  }

  const { error } = await supabase
    .from('song_audio')
    .delete()
    .eq('id', audio.id);

  if (error) throw error;
}
