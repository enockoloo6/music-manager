-- Highlight and due-date planning for Consecration song groups.

alter table music_manager.consecration_beat_groups
add column if not exists is_highlighted boolean not null default false,
add column if not exists due_date date;

comment on column music_manager.consecration_beat_groups.is_highlighted is
'Marks a Consecration song group as due or needing attention.';

comment on column music_manager.consecration_beat_groups.due_date is
'Optional due date for a highlighted Consecration song group.';

update music_manager.consecration_beat_groups
set beat_name = 'Play without styles'
where beat_name in ('Piano', 'Play without beats/styles')
  and beat_category is null
  and tempo is null
  and variation is null;

grant update on music_manager.consecration_beat_groups to authenticated;
grant update on music_manager.consecration_beat_group_songs to authenticated;
grant delete on music_manager.consecration_beat_group_songs to authenticated;

notify pgrst, 'reload schema';
