import { supabase } from '../supabaseClient';

export const AUDIO_BUCKET = 'music-manager-audio';

export async function uploadSongAudio({ songId, file }) {
  if (!songId) {
    throw new Error('Song ID is required.');
  }

  if (!file) {
    throw new Error('Audio file is required.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${songId}-${Date.now()}.${fileExt}`;
  const filePath = `songs/${fileName}`;

  const { error: uploadError } = await supabase
    .storage
    .from(AUDIO_BUCKET)
    .upload(filePath, file, {
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase
    .storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: data.publicUrl
  };
}
