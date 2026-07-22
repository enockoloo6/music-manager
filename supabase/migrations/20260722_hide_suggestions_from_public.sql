-- Public visitors can submit suggestions but cannot read the suggestion list.

revoke select on music_manager.song_suggestions from anon;
grant insert on music_manager.song_suggestions to anon;

notify pgrst, 'reload schema';
