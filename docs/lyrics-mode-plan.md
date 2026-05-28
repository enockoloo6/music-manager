# Lyrics Mode Implementation Plan

Target release:

v1.1.0

## Goals

- Allow lyrics to be pasted and stored per song.
- Make lyrics readable during singing.
- Support future audio playback integration.
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
- optional future auto-scroll

---

# Future Audio Integration

Audio support will later connect directly into Lyrics Mode.

Planned:

- play audio while reading lyrics
- reference recordings
- choir practice support
- multiple recordings per song

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
