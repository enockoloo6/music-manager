-- Display and highlight settings for Consecration song subgroups.

alter table music_manager.consecration_beat_groups
add column if not exists subgroup_size int not null default 6,
add column if not exists highlighted_subgroup_index int;

alter table music_manager.consecration_beat_groups
drop constraint if exists consecration_beat_groups_subgroup_size_check;

alter table music_manager.consecration_beat_groups
add constraint consecration_beat_groups_subgroup_size_check
check (subgroup_size between 1 and 50);

comment on column music_manager.consecration_beat_groups.subgroup_size is
'Number of songs shown in each Consecration subgroup chunk.';

comment on column music_manager.consecration_beat_groups.highlighted_subgroup_index is
'Optional 1-based subgroup number highlighted inside a Consecration group.';

notify pgrst, 'reload schema';
