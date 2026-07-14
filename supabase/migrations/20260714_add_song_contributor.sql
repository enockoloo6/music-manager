-- Track who first added a song so logged-in users can filter the library by contributor.

alter table music_manager.songs
add column if not exists created_by uuid references music_manager.profiles(id);

create index if not exists songs_created_by_idx
on music_manager.songs(created_by);

comment on column music_manager.songs.created_by is
'Profile id for the user who first added the song in Music Manager.';

notify pgrst, 'reload schema';
