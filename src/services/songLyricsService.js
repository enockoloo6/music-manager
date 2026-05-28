import { supabase } from '../supabaseClient';

export async function updateSongLyrics(songId, lyrics) {
  if (!songId) {
    throw new Error('Song ID is required to update lyrics.');
  }

  const { data, error } = await supabase
    .from('songs')
    .update({ lyrics: lyrics || null })
    .eq('id', songId)
    .select('id, song_name, lyrics')
    .single();

  if (error) throw error;
  return data;
}

export function songMatchesSearch(song, rawSearch) {
  const search = rawSearch.trim().toLowerCase();
  if (!search) return true;

  const songName = song.song_name?.toLowerCase() || '';
  const lyrics = song.lyrics?.toLowerCase() || '';

  return songName.includes(search) || lyrics.includes(search);
}
