# Lyrics Mode Implementation Plan

Target release:

v1.1.0

## Goals

- Allow lyrics to be pasted and stored per song.
- Make lyrics readable during singing.
- Support audio playback integration.
- Keep the existing beat/keyboard/admin flows stable.

---

# Planned UI

## Song Card

Each song card will support:

- lyrics preview
- open lyrics mode button
- future audio button

---

# Lyrics Mode

Planned features:

- large readable text
- dark background
- mobile-friendly layout
- distraction-free singing mode
- compact audio player when a song has playable audio
- manual lyrics reading while audio plays

---

# Audio Integration

Current:

- play audio while reading lyrics
- reference recordings
- choir practice support

Future:

- multiple recordings per song
- optional line timing if accurate lyric/audio sync is needed later

---

# Database

songs.lyrics

Type:

text

---

# Future Refactor

Current app logic still lives mostly inside App.jsx.

Future extraction targets:

- SongCard component
- LyricsMode component
- AdminPanel component
- SongForm component
- SearchBar component

---

# Notes

This file exists to make resuming work easier later.
