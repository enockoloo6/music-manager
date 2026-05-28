# Music Manager Resume Guide

Use this file when resuming development in a future chat or work session.

---

# Repository

```text
enockoloo6/music-manager
```

---

# Active Branch

Always continue work on:

```bash
git checkout eoloo
```

Do not work directly on `main` because it auto-deploys to Netlify production.

---

# Current Development Focus

## Active Release

```text
v1.1.0 — Lyrics Support
```

Current goal:

- allow lyrics to be saved per song
- make lyrics easy to view during singing
- prepare the app for audio playback later
- continue reducing the size of `src/App.jsx`

---

# Important Files to Read First

Before continuing work, review these files:

```text
ROADMAP.md
docs/refactor-progress.md
docs/lyrics-mode-plan.md
docs/audio-support-plan.md
```

These explain what is done, pending, and in progress.

---

# Database Migration Already Added

```text
supabase/migrations/20260528_add_lyrics_to_songs.sql
```

Adds:

```sql
music_manager.songs.lyrics text
```

Remember to run schema refresh after database changes:

```sql
notify pgrst, 'reload schema';
```

---

# Components Already Extracted

```text
src/components/LyricsMode.jsx
src/components/LyricsEditor.jsx
src/components/SongCard.jsx
src/components/SearchBar.jsx
src/components/AppFooter.jsx
src/components/VersionBadge.jsx
```

---

# Services Already Added

```text
src/services/songLyricsService.js
```

Includes:

- updating song lyrics
- lyrics-aware search helper

---

# Styles Already Added

```text
src/styles/lyricsMode.css
src/styles/lyricsEditor.css
src/styles/songCard.css
src/styles/searchBar.css
src/styles/appFooter.css
```

---

# Versioning Groundwork

```text
src/appVersion.js
```

Contains:

```js
APP_VERSION
APP_RELEASE_NAME
```

---

# Next Coding Task

The next important step is wiring the extracted pieces into `src/App.jsx`:

- import the new components
- import the new CSS files
- replace inline search with `SearchBar`
- replace inline song card rendering with `SongCard`
- add LyricsMode state
- add LyricsEditor state
- use `updateSongLyrics()` from `songLyricsService.js`
- use `songMatchesSearch()` for title + lyrics search
- render `AppFooter`

---

# Preserve Existing Working Features

While wiring the new components, avoid breaking:

- login/signup
- admin approval
- admin promotion
- protected super admin
- beat add/edit/delete
- default keyboard
- keyboard/style loading

---

# Next Release After Lyrics

```text
v1.2.0 — Audio Support
```

Planned:

- Supabase Storage bucket: `music-manager-audio`
- `song_audio` table
- upload audio
- play audio
- multiple recordings per song
- connect audio playback into Lyrics Mode

---

# Helpful Mental Model

Music Manager is moving from:

```text
simple beat library
```

toward:

```text
worship and performance music platform
```

Development should remain gradual and safe.
