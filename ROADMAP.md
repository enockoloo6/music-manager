# Music Manager Roadmap

---

## v1.4.0 Microphone Recording

Status:
In Progress

Implemented:

* getUserMedia
* MediaRecorder
* Recording controls
* Preview recording
* Save recording
* Existing upload pipeline reuse

Remaining:

* Verification
* Audio visibility cleanup
* Mobile testing

---

## v1.4.x Offline Foundation

Status:
Planned

Goal:

Offline-first operation.

Cache:

* Songs
* Lyrics
* Beats
* Keyboards
* Categories

Technology:

* IndexedDB
* Service Worker

Expected Result:

Online Once
↓
Data Cached
↓
Works Offline

---

## v1.5.0 Song Foundation

Status:
Started

Goal:

Move from Beat-Centric to Song-Centric.

Features:

* Add Song without Beat
* Add Lyrics without Beat
* Attach Beat later
* Song lifecycle support

Current implementation scope:

* The add form starts with song name and lyrics.
* Piano/beat settings are optional.
* Saving a song must not require keyboard selection.
* A style/beat row is created only when optional beat details are supplied.
* Default keyboard settings move to a dedicated Settings view.
* Admin user management moves to an Admin-only view.
* Reports move to a dedicated Reports view.
* Category filters are collapsed until needed.
* Song-card secondary actions and audio tools are shown on demand.
* Logged-out audio permission noise is suppressed.

---

## v1.6.0 Mobile UX

Status:
Planned

Features:

* First lyric line preview
* Compact song cards
* Better mobile navigation
* Category collapse

---

## v1.7.0 Reports

Status:
Planned

Reports section:

* Recently Added
* Library Statistics
* Activity
* Audit

Dashboard simplified for musicians.

---

## v2.0

Long Term Vision

Music Manager becomes:

Song
Lyrics
Audio
Beats
Practice

platform rather than a simple beat repository.
