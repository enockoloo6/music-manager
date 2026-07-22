-- Allow public visitors to submit song suggestions.

revoke select on music_manager.song_suggestions from anon;
grant insert on music_manager.song_suggestions to anon;
grant usage, select on sequence music_manager.song_suggestions_id_seq to anon;

notify pgrst, 'reload schema';
