-- Music Manager song metadata foundation
-- Supports better search, worship planning, setlists, and performance sessions.

alter table music_manager.songs
add column if not exists composer text,
add column if not exists theme text,
add column if not exists scripture_reference text,
add column if not exists default_key text,
add column if not exists default_tempo integer,
add column if not exists song_notes text;

comment on column music_manager.songs.composer is 'Optional composer, author, or source information for the song.';
comment on column music_manager.songs.theme is 'Optional worship theme or category, for example faith, altar call, communion, praise.';
comment on column music_manager.songs.scripture_reference is 'Optional Bible reference connected to the song.';
comment on column music_manager.songs.default_key is 'Optional default musical key for the song.';
comment on column music_manager.songs.default_tempo is 'Optional default tempo in BPM for the song.';
comment on column music_manager.songs.song_notes is 'Optional general song-level notes, separate from beat/style notes.';

notify pgrst, 'reload schema';
