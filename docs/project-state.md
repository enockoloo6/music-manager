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
Implemented

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

* Full regression verification
* Broader mobile browser testing

---

## v1.5.0 Song Foundation

Status:
In Progress

Implemented direction:

* Primary add flow starts with Song Name.
* Lyrics can be entered before any beat or keyboard setting exists.
* Piano settings remain available as optional beat details.
* A song can be saved without a beat.
* Optional beat details can be attached during song creation or added later from the saved song.
* Default preferences live in Settings instead of the main library page.
* Admin-only user management lives on an Admin page instead of the main library page.
* Reports-only information moves to a Reports page instead of the main library page.
* Category filters are collapsed until needed.
* Song-card secondary actions are grouped so the primary song list stays compact.
* Audio controls are opened on demand instead of rendering on every song card.
* Logged-out users do not trigger audio permission errors.
* Main navigation lives in the header.
* Song cards use a softer pastel blue treatment instead of dark blue headers.
* Version and role labels stay visually quiet.
* Lyrics previews are not shown on song cards because Lyrics opens the full view.
* Audio is visible as a primary song action next to Lyrics.
* Audio links are shown only for songs that have audio.
* Public users can see and play audio when a song has audio.
* Lyrics links are shown only for songs that have lyrics.
* Approved users see Add Lyrics when a song has no lyrics.
* Add/Edit Lyrics opens inside the selected song card, beside the song context, not as a separate panel above the library list.
* Lyrics Mode close action is prominent.
* Lyrics Mode can be closed with Escape.
* Lyrics printing should include only the lyrics content and no blank app-layout pages.
* Approved users can edit the song name inline from the song card.
* Open song-card actions, such as Hide Audio, are visually stronger than inactive action links.
* Audio follows the same empty-state pattern as lyrics: approved users see Add Audio when no audio exists.
* Open inline song-card actions use the same active visual treatment across lyrics, audio, and More.
* Library defaults to latest-added songs first, using the newest beat timestamp available for each song.
* Compact library sort and category controls sit beside the song count for logged-in users.
* Public users can sort and search the library, but Category filtering and song counts are hidden.
* Song count uses compact wording, for example `38 songs`.
* Logged-in users can filter songs by contributor email.
* New songs store the profile id of the user who first added the song.
* Existing songs are backfilled to `ngoziredorcas@gmail.com` as contributor.
* Admins can set the visible app title from Settings.
* The default app title and Android install name should be `Music Manager`.
* The header uses a music-focused mark instead of a piano-specific icon.
* The app has basic install metadata for Android and a read-only local cache for library data, but offline audio caching and offline save/sync are not implemented yet.
* Mobile layout keeps the header, library filters, and song-card actions stacked without horizontal overflow.
* Approved users can duplicate an existing song, including lyrics and beat settings, then edit the copy.
* Songs can have multiple beats; beats open from a Beats action instead of always crowding the card.
* Public users see that beat-details action as More.
* Beats can be marked as favorite/preferred and labelled for Worship, Praise, or other use.
* Search no longer has a separate category tab beside it.
* Beat details use pipe separators and share the subdued piano model color.
* Audio recording has a standard maximum duration with a visible timer and automatic stop.
* Song cards do not show beat count or lyrics status badges.
* Beat rows show Beat Category from `styles.keyboard_location` attached to the beat name as `Beat(category)`.
* Beat row text uses the same visual weight, with keyboard model aligned separately on the right where space allows.
* Keyboard model text remains smaller and subdued, matching the beat notes color.
* Song count appears beside Add Song.
* Search and category filtering share one control row.
* Invalid timestamp-like beat use values have been removed from live data and are hidden in the UI.
* Public library filtering ignores stale category state after logout.
* Mobile song names keep a bold visual weight matching desktop.
* Save Recording is green after audio capture to make the save action easier to find.
* Logged-in users can open a Manual view from the header for quick usage guidance.
* The app version is shown in Settings instead of the primary header.
* Missing Lyrics and Audio actions use amber emphasis to make incomplete song details easier to spot.
* Song card headers and outlines use a deeper blue treatment so the song background is more visible.
* Lyrics Mode displays the song title with stronger contrast and visual weight.

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
Keep reports, secondary actions, and audio management outside the first-view song entry workflow.
Use pastel colors for content surfaces and reserve dark header color for global navigation only.

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

## Offline Audio and Sync

Read-only local cache exists for library data.

Not implemented yet:

* Offline audio file caching
* Offline song, lyric, beat, or audio edits
* Save queue and later synchronization

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
