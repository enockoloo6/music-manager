-- Avoid ambiguous column/parameter references in app settings RPC.

drop function if exists music_manager.admin_set_app_setting(text, text);

create or replace function music_manager.admin_set_app_setting(
  setting_key text,
  setting_value text
)
returns void
language plpgsql
security definer
set search_path = music_manager, public
as $$
begin
  if nullif(trim(admin_set_app_setting.setting_value), '') is null then
    raise exception 'Setting value is required.';
  end if;

  if not exists (
    select 1
    from music_manager.profiles
    where id = auth.uid()
      and is_admin = true
  ) then
    raise exception 'Only admins can update app settings.';
  end if;

  insert into music_manager.app_settings (
    setting_key,
    setting_value,
    updated_at,
    updated_by
  )
  values (
    admin_set_app_setting.setting_key,
    nullif(trim(admin_set_app_setting.setting_value), ''),
    now(),
    auth.uid()
  )
  on conflict on constraint app_settings_pkey do update
    set setting_value = excluded.setting_value,
        updated_at = excluded.updated_at,
        updated_by = excluded.updated_by;
end;
$$;

grant execute on function music_manager.admin_set_app_setting(text, text) to authenticated;

notify pgrst, 'reload schema';
