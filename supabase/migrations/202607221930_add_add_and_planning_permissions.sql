-- Split Add and Planning into first-class RBAC permissions.

alter table music_manager.profiles
add column if not exists can_add_songs boolean not null default false,
add column if not exists can_plan_presentations boolean not null default false;

update music_manager.profiles
set can_add_songs = true
where can_edit_songs = true
  and can_add_songs = false;

update music_manager.profiles
set can_plan_presentations = true
where (is_admin = true or is_super_admin = true or is_protected = true)
  and can_plan_presentations = false;

update music_manager.profiles
set can_add_songs = true,
    can_edit_songs = true,
    can_delete_songs = true,
    can_plan_presentations = true,
    can_manage_protected_users = true
where lower(coalesce(email, '')) = 'enockoloo6@gmail.com'
   or is_super_admin = true
   or is_protected = true;

drop function if exists music_manager.get_all_profiles();

create or replace function music_manager.get_all_profiles()
returns table (
  id uuid,
  email text,
  is_approved boolean,
  is_admin boolean,
  is_super_admin boolean,
  is_protected boolean,
  can_add_songs boolean,
  can_edit_songs boolean,
  can_delete_songs boolean,
  can_plan_presentations boolean,
  can_manage_protected_users boolean
)
language plpgsql
security definer
set search_path = music_manager, public
as $$
begin
  if not exists (
    select 1
    from music_manager.profiles
    where profiles.id = auth.uid()
      and (profiles.is_super_admin = true or profiles.is_protected = true)
  ) then
    raise exception 'Only super admins can view profiles.';
  end if;

  return query
  select
    profiles.id,
    profiles.email::text,
    profiles.is_approved,
    profiles.is_admin,
    profiles.is_super_admin,
    profiles.is_protected,
    profiles.can_add_songs,
    profiles.can_edit_songs,
    profiles.can_delete_songs,
    profiles.can_plan_presentations,
    profiles.can_manage_protected_users
  from music_manager.profiles
  order by profiles.email;
end;
$$;

drop function if exists music_manager.admin_update_profile(uuid, boolean, boolean, boolean, boolean, boolean, boolean, boolean);
drop function if exists music_manager.admin_update_profile(uuid, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean);

create or replace function music_manager.admin_update_profile(
  target_id uuid,
  new_is_approved boolean,
  new_is_admin boolean,
  new_is_super_admin boolean default null,
  new_is_protected boolean default null,
  new_can_add_songs boolean default null,
  new_can_edit_songs boolean default null,
  new_can_delete_songs boolean default null,
  new_can_plan_presentations boolean default null,
  new_can_manage_protected_users boolean default null
)
returns void
language plpgsql
security definer
set search_path = music_manager, public
as $$
declare
  actor_is_super_admin boolean;
  actor_is_protected boolean;
  actor_can_manage_protected_users boolean;
  target_email text;
  target_is_protected boolean;
begin
  select is_super_admin, is_protected, can_manage_protected_users
  into actor_is_super_admin, actor_is_protected, actor_can_manage_protected_users
  from music_manager.profiles
  where profiles.id = auth.uid();

  if coalesce(actor_is_super_admin, false) = false and coalesce(actor_is_protected, false) = false then
    raise exception 'Only super admins can update profiles.';
  end if;

  select email, is_protected
  into target_email, target_is_protected
  from music_manager.profiles
  where id = admin_update_profile.target_id;

  if not found then
    raise exception 'Profile not found.';
  end if;

  if coalesce(target_is_protected, false) = true
    and (
      admin_update_profile.new_is_approved = false
      or admin_update_profile.new_is_admin = false
      or admin_update_profile.new_is_super_admin = false
      or admin_update_profile.new_can_add_songs = false
      or admin_update_profile.new_can_edit_songs = false
      or admin_update_profile.new_can_delete_songs = false
      or admin_update_profile.new_can_plan_presentations = false
      or admin_update_profile.new_can_manage_protected_users = false
      or (
        admin_update_profile.new_is_protected = false
        and coalesce(actor_can_manage_protected_users, false) = false
      )
    )
  then
    raise exception 'Protected users cannot be restricted.';
  end if;

  if lower(coalesce(target_email, '')) = 'enockoloo6@gmail.com'
    and (
      admin_update_profile.new_is_approved = false
      or admin_update_profile.new_is_admin = false
      or admin_update_profile.new_is_super_admin = false
      or admin_update_profile.new_is_protected = false
      or admin_update_profile.new_can_add_songs = false
      or admin_update_profile.new_can_edit_songs = false
      or admin_update_profile.new_can_delete_songs = false
      or admin_update_profile.new_can_plan_presentations = false
      or admin_update_profile.new_can_manage_protected_users = false
    )
  then
    raise exception 'The protected owner cannot be restricted.';
  end if;

  if (
    admin_update_profile.new_is_protected is not null
    or admin_update_profile.new_can_manage_protected_users is not null
  ) and coalesce(actor_can_manage_protected_users, false) = false then
    raise exception 'Only a protected-access manager can change protected access.';
  end if;

  if (
    admin_update_profile.new_is_super_admin is not null
    or admin_update_profile.new_can_add_songs is not null
    or admin_update_profile.new_can_edit_songs is not null
    or admin_update_profile.new_can_delete_songs is not null
    or admin_update_profile.new_can_plan_presentations is not null
  ) and coalesce(actor_is_super_admin, false) = false and coalesce(actor_is_protected, false) = false then
    raise exception 'Only a super admin can grant action permissions.';
  end if;

  update music_manager.profiles
  set is_approved = admin_update_profile.new_is_approved,
      is_admin = admin_update_profile.new_is_admin,
      is_super_admin = coalesce(admin_update_profile.new_is_super_admin, is_super_admin),
      is_protected = coalesce(admin_update_profile.new_is_protected, is_protected),
      can_manage_protected_users = coalesce(admin_update_profile.new_can_manage_protected_users, can_manage_protected_users),
      can_add_songs = case
        when admin_update_profile.new_is_protected = true or admin_update_profile.new_is_super_admin = true then true
        else coalesce(admin_update_profile.new_can_add_songs, can_add_songs)
      end,
      can_edit_songs = case
        when admin_update_profile.new_is_protected = true or admin_update_profile.new_is_super_admin = true then true
        else coalesce(admin_update_profile.new_can_edit_songs, can_edit_songs)
      end,
      can_delete_songs = case
        when admin_update_profile.new_is_protected = true or admin_update_profile.new_is_super_admin = true then true
        else coalesce(admin_update_profile.new_can_delete_songs, can_delete_songs)
      end,
      can_plan_presentations = case
        when admin_update_profile.new_is_protected = true or admin_update_profile.new_is_super_admin = true then true
        else coalesce(admin_update_profile.new_can_plan_presentations, can_plan_presentations)
      end
  where id = admin_update_profile.target_id;
end;
$$;

grant execute on function music_manager.get_all_profiles() to authenticated;
grant execute on function music_manager.admin_update_profile(uuid, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean) to authenticated;

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

notify pgrst, 'reload schema';
