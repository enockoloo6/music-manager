# Audio Support Plan

Target release:

v1.2.0

Current status:

Implemented and extended.

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

- file picker upload
- mobile upload support
- approved users see Add Audio inline when a song has no audio

## Playback

- embedded audio player
- play/pause
- Lyrics Mode player for reading lyrics while audio plays
- future seek controls
- public users can access audio when a song has audio
- public users do not see audio actions when a song has no audio
- offline playback after audio is saved locally
- mobile or unknown data estimate before saving offline audio

## Multiple Recordings

Support future:

- instrumental versions
- choir versions
- practice versions
- live recordings

Current implementation uses one primary song audio entry in the UI.

---

# Lyrics Mode Integration

Lyrics Mode supports:

- playing the song audio attachment while lyrics remain readable

Lyrics Mode may later support:

- synchronized playback
- optional line timing if accurate lyric/audio sync is needed later
- live worship mode

---

# Future Possibilities

- waveform preview
- recording directly from browser
- offline cache management controls
- playlists/setlists

Recording directly from the browser is implemented with a standard maximum duration, visible timer, and automatic stop.
