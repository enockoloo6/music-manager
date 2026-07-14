# Music Manager Project State

Repository:
enockoloo6/music-manager

Branch:
eoloo

---

# Source of Truth

Repository code and repository documentation are the source of truth.

Never rely on previous chats.

Verify repository state first.

---

# Current Release Status

## v1.2.0 Category Quick Filters

Status:
Complete
Verified

Implemented:

* Category filters
* Search + Category combination
* Mobile support

Verification completed.

---

## v1.3.0 Audio Upload & Playback

Status:
Complete
Verified

Implemented:

* Audio upload
* Audio playback
* Audio deletion
* Signed URLs
* song_audio metadata
* Storage integration

Storage Bucket:

music-manager-audio

Database:

music_manager.song_audio

Verification completed.

---

## v1.4.0 Microphone Recording

Status:
In Progress

Implemented:

* getUserMedia()
* MediaRecorder
* Start Recording
* Stop Recording
* Preview Recording
* Save Recording
* Existing upload pipeline reuse
* Recording UI styling

Pending:

* Full verification
* Mobile testing
* Audio visibility cleanup

---

## v1.5.0 Song Foundation

Status:
Started

Implemented direction:

* Primary add flow starts with Song Name.
* Lyrics can be entered before any beat or keyboard setting exists.
* Piano settings remain available as optional beat details.
* A song can be saved without a beat.
* Optional beat details can be attached during song creation or added later from the saved song.
* Default preferences live in Settings instead of the main library page.
* Admin-only user management lives on an Admin page instead of the main library page.

---

# Current Product Direction

Music Manager is transitioning from:

Beat-Centric

to

Song-Centric

Target:

Song
├─ Lyrics
├─ Audio
├─ Notes
├─ Tags
└─ Beats

Songs must be creatable without beats.

Immediate implementation rule:

Do not require keyboard, beat name, tempo, key, category, or beat notes to save a song.
Only create a beat/style record when beat details are provided.
Keep default settings outside the main library workflow.
Keep admin management outside the main library workflow.

---

# Current Technical Debt

Largest technical debt:

src/AppIntegrated.jsx

Strategy:

Gradual extraction into:

* components
* hooks
* services

No rewrites.

Only incremental refactoring.

---

# Known Issues

## Audio Visibility

Logged-out users currently receive confusing audio state information.

Need separation between:

* Metadata visibility
* Playback visibility

Investigation pending.

---

## Recently Added

Issue:

Dates appear similar.

Need audit of:

* database values
* display logic

Decision pending:

Recently Added

or

Recently Added / Updated

---

# Mobile UX Decisions

Song cards should display:

Song Name

First lyric line...

Only.

Not full lyrics.

---

# Offline First Requirement

Priority:

High

Cache:

* Songs
* Lyrics
* Beats
* Keyboards
* Categories

Preferred technology:

* IndexedDB
* Service Worker

Goal:

Online once
↓
Cached
↓
Usable offline
