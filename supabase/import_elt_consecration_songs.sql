begin;

with input_groups(group_key, beat_category, beat_name, tempo, variation, group_order) as (
  values
    ('opening-piano', null::text, 'Play without styles', null::int, null::text, 1),
    ('country-waltz', 'Country', 'Waltz', 53, null::text, 2),
    ('ballad-70s-glam-piano', 'Ballad', 'Ballad-70sGlamPiano', 50, 'B&C', 3)
),
input_songs(group_key, sort_order, song_name) as (
  values
    ('opening-piano', 1, 'Softly and Tenderly'),
    ('opening-piano', 2, 'We walk in the light'),
    ('opening-piano', 3, 'Jesus break every fetter'),
    ('opening-piano', 4, 'On a hill far away'),
    ('opening-piano', 5, 'Just as I am'),
    ('opening-piano', 6, 'I surrender'),
    ('opening-piano', 7, 'All over the world the spirit is moving'),
    ('opening-piano', 8, 'Just beyond the vail'),
    ('opening-piano', 9, 'Fill my cup'),
    ('opening-piano', 10, 'Teach me Lord to wait'),
    ('opening-piano', 11, 'Where He leads me I will follow'),
    ('opening-piano', 12, 'Jehova is your name'),
    ('country-waltz', 1, 'Amazing grace'),
    ('country-waltz', 2, 'Sweep over my soul'),
    ('country-waltz', 3, 'What a day'),
    ('country-waltz', 4, 'Burdens are lifted'),
    ('country-waltz', 5, 'Never alone'),
    ('country-waltz', 6, 'Just as I am'),
    ('country-waltz', 7, 'Wonderful peace'),
    ('country-waltz', 8, 'In the garden'),
    ('country-waltz', 9, 'Nothing here to hinder'),
    ('country-waltz', 10, 'Till the storm passes by'),
    ('country-waltz', 11, 'I wont have to cross Jordan alone'),
    ('country-waltz', 12, 'One day at a time'),
    ('country-waltz', 13, 'Let me hide myself in thee'),
    ('country-waltz', 14, 'Jesus keep me near the cross'),
    ('country-waltz', 15, 'Happy day'),
    ('country-waltz', 16, 'Marvelous Grace'),
    ('country-waltz', 17, 'Redeemed'),
    ('country-waltz', 18, 'Sweet hour of prayer'),
    ('country-waltz', 19, 'Kijito'),
    ('country-waltz', 20, 'Farther Along'),
    ('country-waltz', 21, 'Blessed assurance'),
    ('country-waltz', 22, 'To God be the glory'),
    ('country-waltz', 23, 'Showers of blessing'),
    ('country-waltz', 24, 'My Jesus I love thee'),
    ('country-waltz', 25, 'Ragged cross'),
    ('country-waltz', 26, 'This is my story'),
    ('country-waltz', 27, 'Jesus paid it all'),
    ('country-waltz', 28, 'Life boat is coming'),
    ('ballad-70s-glam-piano', 1, 'How great thou art'),
    ('ballad-70s-glam-piano', 2, 'My Jesus I love thee'),
    ('ballad-70s-glam-piano', 3, 'What a friend'),
    ('ballad-70s-glam-piano', 4, 'Just a closer walk'),
    ('ballad-70s-glam-piano', 5, 'In the sweet by and by'),
    ('ballad-70s-glam-piano', 6, 'At the cross'),
    ('ballad-70s-glam-piano', 7, 'Tis so sweet'),
    ('ballad-70s-glam-piano', 8, 'There is power'),
    ('ballad-70s-glam-piano', 9, 'I shall know Him'),
    ('ballad-70s-glam-piano', 10, 'Muda mwingi'),
    ('ballad-70s-glam-piano', 11, 'Pass me not'),
    ('ballad-70s-glam-piano', 12, 'Bringing in the sheaves'),
    ('ballad-70s-glam-piano', 13, 'Ukingoni mwa yordani'),
    ('ballad-70s-glam-piano', 14, 'Stand up for Jesus'),
    ('ballad-70s-glam-piano', 15, 'We are matching to Zion'),
    ('ballad-70s-glam-piano', 16, 'Count your blessings')
),
admin_profile as (
  select id
  from music_manager.profiles
  where email = 'enockoloo6@gmail.com'
  limit 1
),
new_songs as (
  insert into music_manager.songs (song_name, created_by)
  select distinct on (lower(input_songs.song_name))
    input_songs.song_name,
    admin_profile.id
  from input_songs
  cross join admin_profile
  where not exists (
    select 1
    from music_manager.songs existing_song
    where lower(existing_song.song_name) = lower(input_songs.song_name)
  )
  order by lower(input_songs.song_name), input_songs.song_name
  returning id, song_name
),
new_groups as (
  insert into music_manager.consecration_beat_groups (
    title,
    beat_category,
    beat_name,
    tempo,
    variation,
    created_by
  )
  select
    'Consecration Songs',
    input_groups.beat_category,
    input_groups.beat_name,
    input_groups.tempo,
    input_groups.variation,
    admin_profile.id
  from input_groups
  cross join admin_profile
  where not exists (
    select 1
    from music_manager.consecration_beat_groups existing_group
    where coalesce(lower(existing_group.beat_category), '') = coalesce(lower(input_groups.beat_category), '')
      and lower(trim(both ',' from existing_group.beat_name)) = lower(input_groups.beat_name)
      and coalesce(existing_group.tempo, -1) = coalesce(input_groups.tempo, -1)
      and coalesce(existing_group.variation, '') = coalesce(input_groups.variation, '')
  )
  returning id, beat_category, beat_name, tempo, variation
),
target_groups as (
  select distinct on (input_groups.group_key)
    input_groups.group_key,
    existing_group.id
  from input_groups
  join music_manager.consecration_beat_groups existing_group
    on coalesce(lower(existing_group.beat_category), '') = coalesce(lower(input_groups.beat_category), '')
   and lower(trim(both ',' from existing_group.beat_name)) = lower(input_groups.beat_name)
   and coalesce(existing_group.tempo, -1) = coalesce(input_groups.tempo, -1)
   and coalesce(existing_group.variation, '') = coalesce(input_groups.variation, '')
  order by input_groups.group_key, existing_group.id
),
target_groups_with_new as (
  select group_key, id
  from target_groups
  union
  select input_groups.group_key, new_groups.id
  from input_groups
  join new_groups
    on coalesce(lower(new_groups.beat_category), '') = coalesce(lower(input_groups.beat_category), '')
   and lower(trim(both ',' from new_groups.beat_name)) = lower(input_groups.beat_name)
   and coalesce(new_groups.tempo, -1) = coalesce(input_groups.tempo, -1)
   and coalesce(new_groups.variation, '') = coalesce(input_groups.variation, '')
),
target_songs as (
  select distinct on (lower(input_songs.song_name))
    input_songs.song_name,
    existing_song.id
  from input_songs
  join music_manager.songs existing_song
    on lower(existing_song.song_name) = lower(input_songs.song_name)
  order by lower(input_songs.song_name), existing_song.id
),
target_songs_with_new as (
  select song_name, id
  from target_songs
  union
  select song_name, id
  from new_songs
),
new_links as (
  insert into music_manager.consecration_beat_group_songs (group_id, song_id, sort_order)
  select
    target_groups_with_new.id,
    target_songs_with_new.id,
    input_songs.sort_order
  from input_songs
  join target_groups_with_new on target_groups_with_new.group_key = input_songs.group_key
  join target_songs_with_new on lower(target_songs_with_new.song_name) = lower(input_songs.song_name)
  on conflict (group_id, song_id) do nothing
  returning id
)
select
  (select count(*) from new_songs) as inserted_songs,
  (select count(*) from new_groups) as inserted_groups,
  (select count(*) from new_links) as inserted_group_song_links;

commit;
