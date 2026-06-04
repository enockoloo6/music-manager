# Music Manager Architecture

---

# Current Architecture

Music Manager currently behaves mostly as a Beat Library.

Relationships:

Song
└─ Styles / Beats
├─ Keyboard
├─ Tempo
├─ Key
└─ Notes

Many workflows still assume a beat exists.

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

Private bucket

music-manager-audio

Metadata:

music_manager.song_audio

Need separation between:

Metadata visibility
and
Playback visibility

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

