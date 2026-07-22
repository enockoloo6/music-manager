-- Optional public-facing name for song suggestions.

alter table music_manager.song_suggestions
add column if not exists suggester_name text;

notify pgrst, 'reload schema';
