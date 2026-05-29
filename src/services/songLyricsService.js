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

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function monthIndexFromName(value) {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const normalized = value.toLowerCase();
  return months.findIndex(month => month.startsWith(normalized));
}

function getDateRangeFromSearch(search) {
  const now = new Date();
  const normalized = search.trim().toLowerCase();

  if (normalized === 'today') {
    return { start: startOfDay(now), end: endOfDay(now) };
  }

  if (normalized === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
  }

  if (normalized === 'this week') {
    const start = startOfDay(now);
    start.setDate(now.getDate() - now.getDay());
    return { start, end: endOfDay(now) };
  }

  if (normalized === 'last week') {
    const start = startOfDay(now);
    start.setDate(now.getDate() - now.getDay() - 7);
    const end = endOfDay(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }

  const monthYearMatch = normalized.match(/^([a-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthIndex = monthIndexFromName(monthYearMatch[1]);
    const year = Number(monthYearMatch[2]);

    if (monthIndex >= 0 && year > 1900) {
      return {
        start: new Date(year, monthIndex, 1, 0, 0, 0, 0),
        end: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)
      };
    }
  }

  const dayMonthYearMatch = normalized.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})$/);
  if (dayMonthYearMatch) {
    const day = Number(dayMonthYearMatch[1]);
    const monthIndex = monthIndexFromName(dayMonthYearMatch[2]);
    const year = Number(dayMonthYearMatch[3]);

    if (monthIndex >= 0 && year > 1900) {
      const date = new Date(year, monthIndex, day);
      return { start: startOfDay(date), end: endOfDay(date) };
    }
  }

  return null;
}

function songWasAddedWithinRange(song, range) {
  if (!range) return false;

  return (song.styles || []).some(style => {
    if (!style.created_at) return false;

    const createdAt = new Date(style.created_at);
    if (Number.isNaN(createdAt.getTime())) return false;

    return createdAt >= range.start && createdAt <= range.end;
  });
}

export function songMatchesSearch(song, rawSearch) {
  const search = rawSearch.trim().toLowerCase();
  if (!search) return true;

  const songName = song.song_name?.toLowerCase() || '';
  const lyrics = song.lyrics?.toLowerCase() || '';
  const dateRange = getDateRangeFromSearch(search);

  return songName.includes(search) || lyrics.includes(search) || songWasAddedWithinRange(song, dateRange);
}
