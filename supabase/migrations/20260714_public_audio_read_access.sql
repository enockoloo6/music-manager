-- Allow public read access for song audio metadata and playback links.
-- Audio upload/delete management remains controlled by existing authenticated policies.

grant select on music_manager.song_audio to anon, authenticated;

drop policy if exists "Public can read music manager audio objects"
on storage.objects;

create policy "Public can read music manager audio objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'music-manager-audio');

notify pgrst, 'reload schema';
