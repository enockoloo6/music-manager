-- Beat-level preference and usage labels for song-focused workflows.

alter table music_manager.styles
add column if not exists style_category text,
add column if not exists is_favorite boolean not null default false;

comment on column music_manager.styles.style_category is
'Optional beat use label such as Worship, Praise, or Other.';

comment on column music_manager.styles.is_favorite is
'Marks the preferred beat/style for a song.';

notify pgrst, 'reload schema';
