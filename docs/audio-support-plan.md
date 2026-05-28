# Audio Support Plan

Target release:

v1.2.0

## Goal

Allow songs to contain playable audio recordings alongside lyrics and beat information.

---

# Storage Strategy

Use:

Supabase Storage

Recommended bucket:

music-manager-audio

Audio files should NOT be stored directly in PostgreSQL.

---

# Planned Table

music_manager.song_audio

Suggested columns:

- id
- song_id
- file_path
- file_name
- duration_seconds
- uploaded_by
- created_at

---

# Planned Features

## Upload Audio

- drag/drop upload
- file picker
- mobile upload support

## Playback

- embedded audio player
- play/pause
- future seek controls

## Multiple Recordings

Support future:

- instrumental versions
- choir versions
- practice versions
- live recordings

---

# Lyrics Mode Integration

Lyrics Mode will later support:

- synchronized playback
- optional auto-scroll
- live worship mode

---

# Future Possibilities

- waveform preview
- recording directly from browser
- offline caching
- playlists/setlists
