-- Existing songs were created before contributor tracking existed.
-- Treat them as added by ngoziredorcas@gmail.com so the contributor filter has no unknown rows.

update music_manager.songs
set created_by = (
  select id
  from music_manager.profiles
  where email = 'ngoziredorcas@gmail.com'
  limit 1
)
where created_by is null
  and exists (
    select 1
    from music_manager.profiles
    where email = 'ngoziredorcas@gmail.com'
  );

notify pgrst, 'reload schema';
