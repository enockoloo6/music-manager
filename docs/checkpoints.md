# Development Checkpoints

Use this file to decide when to run SQL and when to test.

## Checkpoint 1: Lyrics

Migration file:

supabase/migrations/20260528_add_lyrics_to_songs.sql

Run this when AppIntegrated is activated and we are ready to test lyrics.

Test after running it:

- edit lyrics
- save lyrics
- reload page
- open lyrics mode
- search by lyrics

## Checkpoint 2: Song Metadata

Migration file:

supabase/migrations/20260529_add_song_metadata.sql

Do not run this yet.

Run it only after metadata fields are added to the UI.

## Checkpoint 3: Audio

Not ready yet.

Later this will need:

- song_audio table
- music-manager-audio storage bucket

## Testing Order

Before merging to main, test on eoloo:

1. login
2. signup
3. admin approval
4. add beat
5. edit beat
6. delete beat
7. default keyboard
8. lyrics edit
9. lyrics mode
10. search
11. mobile layout
12. offline banner
13. print view

## Main Rule

Do not merge to main until testing passes on eoloo.
