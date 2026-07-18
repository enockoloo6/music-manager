-- Song planning controls for admins.

alter table music_manager.songs
add column if not exists is_highlighted boolean not null default false,
add column if not exists is_hidden boolean not null default false,
add column if not exists presentation_date date,
add column if not exists presentation_owner_id uuid references music_manager.profiles(id),
add column if not exists presentation_marked_at timestamptz;

create index if not exists songs_is_hidden_idx
on music_manager.songs(is_hidden);

create index if not exists songs_presentation_date_idx
on music_manager.songs(presentation_date);

comment on column music_manager.songs.is_highlighted is
'Marks songs that should stand out visually in the library.';

comment on column music_manager.songs.is_hidden is
'Hides songs from non-admin library views without deleting them.';

comment on column music_manager.songs.presentation_date is
'Date when an admin expects the song to be presented.';

comment on column music_manager.songs.presentation_owner_id is
'Admin profile that last marked or updated the presentation planning state.';

comment on column music_manager.songs.presentation_marked_at is
'Timestamp when presentation planning state was last updated.';

notify pgrst, 'reload schema';
