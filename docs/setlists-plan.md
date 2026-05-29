# Setlists and Worship Sessions Plan

Future target release: v1.4.0.

## Goal

Allow users to prepare an ordered list of songs for a service, rehearsal, or worship session.

## Why This Fits Music Manager

The app already stores:

- songs
- lyrics
- beats
- keyboard information
- future audio references

Setlists will connect these into a practical worship flow.

## Main Features

- create a setlist
- add songs to a setlist
- reorder songs
- open lyrics from the setlist
- move next or previous during service
- show beat and keyboard notes per song
- later play reference audio

## Example

Sunday Morning Service

1. How Great Thou Art
2. Only Believe
3. Amazing Grace
4. He Touched Me

## Suggested Tables

music_manager.setlists

- id
- name
- description
- service_date
- created_by
- created_at

music_manager.setlist_songs

- id
- setlist_id
- song_id
- position
- notes
- created_at

## Future UI

Possible components:

src/components/SetlistPanel.jsx
src/components/SetlistSongRow.jsx
src/components/WorshipSessionMode.jsx

## Offline Relationship

Setlists should be cache-friendly.

A prepared service should work offline after being opened once online.

## Audio Relationship

Future worship session mode can show:

- lyrics
- beat information
- audio reference
- next song
- previous song

## Development Order

1. Finish lyrics support.
2. Add audio support.
3. Improve mobile layout.
4. Add setlists.
5. Add offline support for setlists and lyrics.
