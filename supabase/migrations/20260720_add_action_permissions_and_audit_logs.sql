-- Fine-grained profile permissions and edit/delete audit trail.

alter table music_manager.profiles
add column if not exists can_edit_songs boolean not null default false,
add column if not exists can_delete_songs boolean not null default false,
add column if not exists is_protected boolean not null default false,
add column if not exists can_manage_protected_users boolean not null default false;

update music_manager.profiles
set can_edit_songs = true
where is_approved = true
  and can_edit_songs = false;

update music_manager.profiles
set can_edit_songs = true,
    can_delete_songs = true
where is_super_admin = true;

update music_manager.profiles
set is_approved = true,
    is_admin = true,
    is_super_admin = true,
    is_protected = true,
    can_edit_songs = true,
    can_delete_songs = true,
    can_manage_protected_users = true
where email = 'enockoloo6@gmail.com';

update music_manager.profiles
set is_approved = true,
    is_admin = true,
    is_super_admin = true,
    can_edit_songs = true,
    can_delete_songs = true
where is_protected = true;

create table if not exists music_manager.audit_logs (
  id bigserial primary key,
  action_type text not null check (action_type in ('song_edit', 'beat_edit', 'lyrics_edit', 'song_delete', 'beat_delete')),
  target_table text not null,
  target_id text,
  target_label text,
  actor_id uuid references music_manager.profiles(id),
  actor_email text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx
on music_manager.audit_logs (created_at desc);

create or replace function music_manager.log_user_action(
  action_type text,
  target_table text,
  target_id text,
  target_label text
)
returns void
language plpgsql
security definer
set search_path = music_manager, public
as $$
declare
  actor_email text;
begin
  select email
  into actor_email
  from music_manager.profiles
  where profiles.id = auth.uid();

  insert into music_manager.audit_logs (
    action_type,
    target_table,
    target_id,
    target_label,
    actor_id,
    actor_email
  )
  values (
    log_user_action.action_type,
    log_user_action.target_table,
    log_user_action.target_id,
    log_user_action.target_label,
    auth.uid(),
    actor_email
  );
end;
$$;

create or replace function music_manager.get_audit_logs()
returns table (
  id bigint,
  action_type text,
  target_table text,
  target_id text,
  target_label text,
  actor_email text,
  created_at timestamptz
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
    raise exception 'Only super admins can view the log trail.';
  end if;

  return query
  select
    audit_logs.id,
    audit_logs.action_type,
    audit_logs.target_table,
    audit_logs.target_id,
    audit_logs.target_label,
    audit_logs.actor_email::text,
    audit_logs.created_at
  from music_manager.audit_logs
  order by audit_logs.created_at desc
  limit 200;
end;
$$;

drop function if exists music_manager.get_all_profiles();

create or replace function music_manager.get_all_profiles()
returns table (
  id uuid,
  email text,
  is_approved boolean,
  is_admin boolean,
  is_super_admin boolean,
  is_protected boolean,
  can_edit_songs boolean,
  can_delete_songs boolean,
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
    profiles.can_edit_songs,
    profiles.can_delete_songs,
    profiles.can_manage_protected_users
  from music_manager.profiles
  order by profiles.email;
end;
$$;

drop function if exists music_manager.admin_update_profile(uuid, boolean, boolean);
drop function if exists music_manager.admin_update_profile(uuid, boolean, boolean, boolean, boolean, boolean);
drop function if exists music_manager.admin_update_profile(uuid, boolean, boolean, boolean, boolean, boolean, boolean);

create or replace function music_manager.admin_update_profile(
  target_id uuid,
  new_is_approved boolean,
  new_is_admin boolean,
  new_is_super_admin boolean default null,
  new_is_protected boolean default null,
  new_can_edit_songs boolean default null,
  new_can_delete_songs boolean default null,
  new_can_manage_protected_users boolean default null
)
returns void
language plpgsql
security definer
set search_path = music_manager, public
as $$
declare
  actor_is_admin boolean;
  actor_is_super_admin boolean;
  actor_is_protected boolean;
  actor_can_manage_protected_users boolean;
  target_email text;
  target_is_super_admin boolean;
  target_is_protected boolean;
begin
  select is_admin, is_super_admin, is_protected, can_manage_protected_users
  into actor_is_admin, actor_is_super_admin, actor_is_protected, actor_can_manage_protected_users
  from music_manager.profiles
  where profiles.id = auth.uid();

  if coalesce(actor_is_super_admin, false) = false and coalesce(actor_is_protected, false) = false then
    raise exception 'Only super admins can update profiles.';
  end if;

  select email, is_super_admin, is_protected
  into target_email, target_is_super_admin, target_is_protected
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
      or admin_update_profile.new_can_edit_songs = false
      or admin_update_profile.new_can_delete_songs = false
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
      or admin_update_profile.new_can_edit_songs = false
      or admin_update_profile.new_can_delete_songs = false
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
    or admin_update_profile.new_can_edit_songs is not null
    or admin_update_profile.new_can_delete_songs is not null
  ) and coalesce(actor_is_super_admin, false) = false and coalesce(actor_is_protected, false) = false then
    raise exception 'Only a super admin can grant action permissions.';
  end if;

  update music_manager.profiles
  set is_approved = admin_update_profile.new_is_approved,
      is_admin = admin_update_profile.new_is_admin,
      is_super_admin = coalesce(admin_update_profile.new_is_super_admin, is_super_admin),
      is_protected = coalesce(admin_update_profile.new_is_protected, is_protected),
      can_manage_protected_users = coalesce(admin_update_profile.new_can_manage_protected_users, can_manage_protected_users),
      can_edit_songs = case
        when admin_update_profile.new_is_protected = true or admin_update_profile.new_is_super_admin = true then true
        else coalesce(admin_update_profile.new_can_edit_songs, can_edit_songs)
      end,
      can_delete_songs = case
        when admin_update_profile.new_is_protected = true or admin_update_profile.new_is_super_admin = true then true
        else coalesce(admin_update_profile.new_can_delete_songs, can_delete_songs)
      end
  where id = admin_update_profile.target_id;
end;
$$;

grant execute on function music_manager.log_user_action(text, text, text, text) to authenticated;
grant execute on function music_manager.get_audit_logs() to authenticated;
grant execute on function music_manager.get_all_profiles() to authenticated;
grant execute on function music_manager.admin_update_profile(uuid, boolean, boolean, boolean, boolean, boolean, boolean, boolean) to authenticated;

notify pgrst, 'reload schema';
