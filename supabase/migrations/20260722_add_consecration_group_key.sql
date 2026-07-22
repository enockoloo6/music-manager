-- Optional musical key for Consecration style groups.

alter table music_manager.consecration_beat_groups
add column if not exists musical_key text;

comment on column music_manager.consecration_beat_groups.musical_key is
'Optional key for a Consecration keyboard style group.';

notify pgrst, 'reload schema';
