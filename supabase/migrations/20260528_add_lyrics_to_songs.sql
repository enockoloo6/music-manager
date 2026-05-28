-- Music Manager v1.1.0 lyrics support
-- Run this in Supabase SQL editor or through the Supabase CLI.

alter table music_manager.songs
add column if not exists lyrics text;

comment on column music_manager.songs.lyrics is
'Song lyrics pasted or edited in Music Manager. Used by Lyrics/Singing Mode.';

-- Refresh PostgREST/Supabase schema cache after changing the schema.
notify pgrst, 'reload schema';
