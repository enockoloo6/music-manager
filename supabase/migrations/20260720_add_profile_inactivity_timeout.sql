-- Per-user inactivity timeout preference. The app defaults existing and new
-- profiles to logging out after 30 minutes without activity.

alter table music_manager.profiles
add column if not exists logout_timeout_minutes integer not null default 30
check (logout_timeout_minutes in (15, 30, 60, 120, 240));

update music_manager.profiles
set logout_timeout_minutes = 30
where logout_timeout_minutes is null;

notify pgrst, 'reload schema';
