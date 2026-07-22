-- Create a Music Manager profile as soon as a Supabase auth user is created.

create or replace function music_manager.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = music_manager, public
as $$
declare
  user_email text := new.email;
  protected_owner boolean := lower(coalesce(new.email, '')) = 'enockoloo6@gmail.com';
begin
  insert into music_manager.profiles (
    id,
    email,
    is_approved,
    is_admin,
    is_super_admin,
    is_protected,
    can_manage_protected_users,
    can_add_songs,
    can_edit_songs,
    can_delete_songs,
    can_plan_presentations,
    logout_timeout_minutes
  )
  values (
    new.id,
    user_email,
    protected_owner,
    protected_owner,
    protected_owner,
    protected_owner,
    protected_owner,
    protected_owner,
    protected_owner,
    protected_owner,
    protected_owner,
    30
  )
  on conflict (id) do update
  set email = coalesce(excluded.email, music_manager.profiles.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_music_manager_profile on auth.users;

create trigger on_auth_user_created_music_manager_profile
after insert on auth.users
for each row execute function music_manager.handle_new_auth_user();

comment on function music_manager.handle_new_auth_user() is
'Creates a pending Music Manager profile for each Supabase auth signup.';

notify pgrst, 'reload schema';
