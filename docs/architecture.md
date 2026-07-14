# Music Manager Architecture

---

# Current Architecture

Music Manager now uses a song-first workflow.

Current relationships:

Song
├─ Lyrics
├─ Audio
└─ Styles / Beats
   ├─ Keyboard
   ├─ Tempo
   ├─ Key
   ├─ Beat category
   ├─ Favorite/preferred flag
   └─ Worship/Praise/Other use label

Beats are optional attachments. A song can exist before lyrics, audio, or beat details are added.

---

# Target Architecture

Music Manager should become Song-Centric.

Song
├─ Lyrics
├─ Audio
├─ Notes
├─ Tags
└─ Beats
├─ Keyboard
├─ Tempo
├─ Key
└─ Notes

---

# Why

Real workflow:

Hear Song
↓
Create Song
↓
Add Lyrics
↓
Practice
↓
Find Beat Later
↓
Attach Beat
↓
Attach Audio

Current workflow incorrectly encourages:

Need Beat First
↓
Create Song

---

# Song Lifecycle

Draft
↓
Lyrics Added
↓
Needs Beat
↓
Beat Attached
↓
Ready
↓
Archived

---

# Offline First Architecture

Goal:

Library usable without internet.

Cache:

* Songs
* Lyrics
* Beats
* Categories
* Keyboards

Technology:

* IndexedDB
* Service Worker

Future:

* Background synchronization
* Selective audio caching

---

# Audio Architecture

Current:

Supabase Storage bucket

music-manager-audio

Metadata:

music_manager.song_audio

Current behavior:

* Songs with audio expose audio access publicly.
* Songs without audio hide the audio action for public users.
* Approved users can add audio inline when a song has no audio.
* Audio recording uses a standard maximum duration with a visible timer.

Future:

* Optional offline audio caching
* More detailed recording metadata

Audio playback policy to be reviewed.

---

# Refactor Strategy

Current technical debt:

src/AppIntegrated.jsx

Strategy:

Move functionality gradually into:

components/
hooks/
services/

Do not rewrite working functionality.

Incremental extraction only.
