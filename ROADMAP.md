# Music Manager Roadmap

---

## v1.4.0 Microphone Recording

Status:
Implemented

Implemented:

* getUserMedia
* MediaRecorder
* Recording controls
* Preview recording
* Save recording
* Existing upload pipeline reuse

Remaining:

* Full regression verification
* Broader mobile browser testing

---

## v1.4.x Offline Foundation

Status:
Read-only cache implemented

Goal:

Offline-first operation.

Cache:

* Songs
* Lyrics
* Beats
* Keyboards
* Categories
* Audio files after online access

Technology:

* IndexedDB
* Service Worker

Expected Result:

Online Once
↓
Data Cached
↓
Works Offline

Current limitations:

* Offline edits are not queued or synchronized.

---

## v1.5.0 Song Foundation

Status:
In Progress

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
* Public audio links are visible only when audio exists.
* Approved users can add lyrics or audio inline when missing.
* Songs can be duplicated.
* Multiple beats are managed behind Beats or More.
* Beats can be favorite/preferred and labelled Worship, Praise, or Other.
* Invalid timestamp-like beat labels are cleaned from data and hidden in the UI.

---

## v1.6.0 Mobile UX

Status:
In Progress

Features:

* First lyric line preview
* Compact song cards
* Better mobile navigation
* Category collapse

Current direction:

Song cards should show the title and relevant actions, not lyrics previews or status badges.

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

---

## Future Todo

* Offline playlists from cached songs, with background playback while the app is open or minimized where the browser allows it. Use Media Session controls for lock-screen playback. Fully closed-app playlist continuation is not reliable in a browser/PWA and would require a native Android app for stronger support.
