-- Remove stale shared auth trigger that inserts into missing public.profiles.
-- Music Manager uses music_manager.handle_new_auth_user() instead.

drop trigger if exists on_auth_user_created on auth.users;

notify pgrst, 'reload schema';
