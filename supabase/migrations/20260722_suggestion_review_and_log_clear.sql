-- Suggestion review fields/actions and super-admin log cleanup.

alter table music_manager.song_suggestions
add column if not exists expected_presentation text;

grant delete on music_manager.song_suggestions to authenticated;

alter table music_manager.audit_logs
drop constraint if exists audit_logs_action_type_check;

alter table music_manager.audit_logs
add constraint audit_logs_action_type_check
check (
  action_type in (
    'song_edit',
    'beat_edit',
    'lyrics_edit',
    'song_delete',
    'beat_delete',
    'suggestion_status',
    'suggestion_add_library',
    'suggestion_add_consecration',
    'suggestion_delete',
    'log_clear'
  )
);

create or replace function music_manager.clear_audit_logs()
returns void
language plpgsql
security definer
set search_path = music_manager, public
as $$
declare
  actor_email text;
  actor_id uuid := auth.uid();
begin
  select profiles.email
  into actor_email
  from music_manager.profiles
  where profiles.id = actor_id
    and (profiles.is_super_admin = true or profiles.is_protected = true);

  if actor_email is null then
    raise exception 'Only super admins can clear the log trail.';
  end if;

  delete from music_manager.audit_logs;

  insert into music_manager.audit_logs (
    action_type,
    target_table,
    target_id,
    target_label,
    actor_id,
    actor_email
  )
  values (
    'log_clear',
    'audit_logs',
    null,
    'Log trail cleared',
    actor_id,
    actor_email
  );
end;
$$;

grant execute on function music_manager.clear_audit_logs() to authenticated;

notify pgrst, 'reload schema';
