# Music Manager Changelog

---

# v1.5.0 Song Foundation

Status:
Started

Date:
July 2026

---

## Added

### Song-First Add Flow

Implemented:

* Add form now starts with Song Name.
* Lyrics can be entered in the initial add flow.
* Songs can be saved without keyboard or beat details.
* Piano settings are available behind an optional toggle.
* A style/beat row is created only when optional beat details are supplied.
* Default keyboard moved from the library page into Settings.
* Admin user management moved from the library page into an Admin-only view.
* Reports moved out of the library page into a Reports view.
* Category filters are collapsed by default.
* Sort, Category, and Added by controls now sit behind a Filters toggle while Search remains visible.
* Add Song now appears after Search and opens the add form directly beneath its action row.
* Song-card secondary actions moved behind More.
* Beat edit/remove actions are collapsed behind Beat actions.
* Audio tools load only when opened for a song.
* Add/edit forms across Library and Consecration now use a consistent gold work-form treatment.
* Consecration saved groups keep the blue list treatment while add/edit forms keep the gold work-form treatment.
* Consecration groups support style groups, no-style groups, due highlighting, subgroup sizing, highlighted subgroups, subgroup collapse, and drag-and-drop song movement between subgroups.
* Consecration group summaries use compact style details such as `Style (Category) | 142 BPM | Key F`.
* Added a public Suggestions tab where anyone can search first, then submit song suggestions for Consecration, Presentation, Library, or Other review.
* Suggestions now allow an optional suggester name, avoid app-internal style/group wording, hide the suggestion list from logged-out visitors, and leave song adding as a manual action for permitted users.
* Super admins can clear the Log Trail; the clear action is recorded immediately after cleanup.
* New auth signups now create pending `music_manager.profiles` rows automatically, and the login form supports forgot-password emails plus password reset from the Supabase recovery link.
* Removed a stale shared Supabase auth trigger that inserted into missing `public.profiles` and caused signup to fail with `Database error saving new user`.
* Added a centralized frontend RBAC layer in `src/rbac.js` so action links are hidden unless the user has the matching capability, and rebuilt Admin as a stored-access plus effective-capabilities matrix.
* Split Add and Planning into explicit Admin checkboxes: Add controls Add Song, Duplicate Song, Add Beat, Add Audio, and Add Consecration groups; Planning controls highlight, hide, presentation date planning, and Mark Presented.
* Admin user cards now collapse by default, showing status badges, an access summary, and a capability count until Manage is opened.
* Manage Protected is now treated as a separate authority from Super Admin; protected switches stay visible but dimmed until the current admin has that checkbox enabled.
* The in-app Manual documents the Consecration drag workflow.
* Logged-out users no longer query audio metadata from song cards.
* Global Print action removed from the header; Lyrics Mode keeps its print action.
* Main navigation moved into the header.
* Version and role labels reduced to quiet status badges.
* Song headers changed from dark blue to pastel blue.
* Lyrics previews removed from song cards.
* Audio is a primary action beside Lyrics.
* Beat metadata is shown on one line where space allows, with mobile wrapping.
* Song count moved beside Add Song.
* Search and Categories now share one library control row, stacking on mobile.
* Audio links appear for public users only when a song has audio.
* Approved users can still open Audio for songs without audio to upload recordings.
* Added public read migration for `music_manager.song_audio` metadata and `music-manager-audio` storage objects.
* Lyrics links appear only when a song has lyrics.
* Users with Edit permission see Add Lyrics when a song has no lyrics.
* Add/Edit Lyrics opens inline on the selected song card instead of above the library list.
* Lyrics Mode closes with Escape.
* Mobile back closes Lyrics Mode and returns to the library before leaving the app.
* Lyrics print output suppresses the rest of the app layout to avoid blank extra pages.
* Lyrics Mode now includes a compact audio player for songs with audio, so lyrics can be read while playback continues.
* Approved users can edit song names inline from the song card.
* Open song-card actions, such as Hide Audio, are visually emphasized for easier scanning.
* Users with Add permission now see Add Audio when a song has no audio.
* Inline lyrics and audio actions share the same active visual treatment when open.
* Song-card sections now behave as a single-open panel, so opening Lyrics, Audio, Beats, or More closes competing sections on that card.
* Library cards now auto-collapse open sections on other songs by default, with a Settings checkbox to disable that local display preference.
* Library defaults to latest-added songs first, using the newest beat timestamp available for each song.
* Added a compact sort control beside the song count.
* Moved Category filtering beside the library sort control and removed the category tab beside search.
* Library sort and category controls are available to public users.
* Song count uses compact wording without `in library`.
* Logged-in users can filter songs by contributor email.
* Added `music_manager.songs.created_by` to track who first added new songs.
* Backfilled existing songs to `ngoziredorcas@gmail.com` as contributor.
* Added a minimal light-blue Song Steward greeting for approved users with their display name, auto-rotating KJV encouragement verses, and a hide control.
* Added admin-controlled app title settings with `Music Manager` as the default.
* Admin user-management controls now style Revoke and Remove Admin as pastel dangerous actions, and Make Admin as a sensitive permission grant.
* Added Android-friendly install metadata and a music-focused app mark.
* Added a read-only local cache foundation for songs, keyboards, and app title.
* Added IndexedDB audio caching for offline playback after online access, with estimated data warnings on mobile or unknown network types.
* Tightened mobile layout for the header, library filters, and song-card actions.
* Added beat preference fields for favorite/preferred beats and Worship/Praise use labels.
* Added song duplication workflow for copying a song with its lyrics and beat settings.
* Song duplication now lets users choose whether to copy lyrics, beat settings, song metadata, and presentation planning.
* Moved beat lists behind a Beats action so songs with many beats stay readable.
* Public users see the beat-details action as More.
* Removed timestamp values from beat use display and cleaned existing timestamp-like beat-use rows.
* Beat details now use pipe separators and the subdued piano model color.
* Audio recording now has a standard maximum duration, visible timer, and automatic stop.
* Lyrics Mode close action is more visible.
* Song cards no longer show beat count or lyrics status badges.
* Beat category from `styles.keyboard_location` now appears attached to the beat name as `Beat(category)`.
* Keyboard model is visually separated to the right of each beat row where space allows.
* Keyboard model text is smaller and subdued, matching beat notes.
* Logged-out audio load failures now say public playback is not enabled instead of implying login is the required fix.
* Public users no longer see Category filtering or the library song count.
* Public library filtering ignores stale category state after logout.
* Mobile song titles keep a strong bold weight to match desktop scanning.
* Save Recording is green after audio capture so the save action is easier to spot.
* Added a logged-in Manual view with quick usage guidance.
* Manual and Settings now explain online/offline capabilities, including offline audio and data-size warnings.
* Moved the app version badge from the header into Settings.
* Missing Lyrics and Audio actions remain link-style actions with a softer visible color emphasis.
* Song card headers and outlines use a deeper blue treatment for better visibility.
* Lyrics Mode song titles are larger, bolder, and higher contrast.
* Added admin song planning controls under More for highlighting songs, hiding songs from non-admins, and setting presentation dates.
* Highlighted songs now use a muted warm card treatment for easier scanning.
* Hidden songs are muted for admins and removed from non-admin library views.
* Presentation dates are shown in the song More panel only for highlighted songs and store the admin who last updated the planning state.
* Added `music_manager.song_presentations` to track each time a song is presented with date and user.
* Added Mark Presented and Song Stats actions to song More controls; Mark Presented is now controlled by Planning permission.
* Mark Presented uses an in-app modal instead of browser prompt dialogs.
* Duplicate, hide/show, delete song, remove beat, and delete audio also use app-owned modals instead of browser prompts or confirms.
* Highlighted songs with overdue presentation dates now show an in-app reminder modal until marked presented, with Remind Later quieting it for the day.
* Delete Song now stays last in song More actions after edit, duplicate, lyrics, Mark Presented, and Song Stats.
* Reports now show most-presented songs for repeated/favorite team usage.
* Highlighted songs now appear first in the library, ordered by earliest presentation date before regular sorting.
* Public users now get one More action for highlighted song presentation details and beat details instead of duplicate More links.
* Added a protected account experience for `enockoloo6@gmail.com` with a PROTECTED badge and protected panel in the frontend.
* Added fine-grained user access for edit, delete, admin, super admin, protected status, and protected-status management.
* Added Log Trail for edit/delete actions and limited Settings, Admin, and Log Trail to super-admin/protected access.
* Added configurable inactivity logout, defaulting to 30 minutes.
* Added a phone install prompt for PWA installation, including iOS Add to Home Screen guidance.
* Updated the in-app Manual to display help based on the logged-in user's capabilities.
* Approved editors can now add another beat directly from a saved song card, including keyboard, beat category, tempo, key, use, preferred status, and notes.
* Beat add/edit key fields now use standard musical key choices while still preserving older custom key values already stored on a song.
* Updated the in-app Manual with the Add Another Beat workflow and key-selection behavior.
* Added a Consecration Songs tab for logged-in approved users, matching the document-style flow where one beat/header can list many songs underneath it.
* Added `music_manager.consecration_beat_groups` and `music_manager.consecration_beat_group_songs` so pasted Consecration song lists keep their order under each piano beat.
* Consolidated secondary navigation into a role-aware More menu, keeping Library and Consecration as primary tabs while preserving owner-only access for Settings, Log Trail, and Admin.
* More menu now closes when the user clicks outside it, mobile logout is quieter, and the Consecration form uses an Add Song list builder with bulk paste support instead of requiring manual line breaks.
* Beat Category fields in Library and Consecration now suggest existing categories while still allowing users to type new category names.
* Piano Beat fields now suggest existing beat names while still allowing new names, and Consecration bulk song entry now asks how pasted songs are separated before splitting them.
* Save/edit actions now use visible primary styling, cancel actions use red styling, and a cleanup migration normalizes matching beat/category values for `Country Waltz`, `16 Beat`, `Christmas Waltz`, `Midnight Swing`, `Happy Reggae`, `SWING & JAZZ`, and `POP & ROCK`.

Public audio visibility depends on applying the public read migration to the active Supabase project.
The migration file exists at `supabase/migrations/20260714_public_audio_read_access.sql`; applying it requires Supabase CLI authentication or a Postgres admin connection string.
Applied to Supabase project `gqmhpgujemdcgrtczche`; anon read verification returned one readable `music_manager.song_audio` row.

This starts the transition from beat-first entry to the documented song-centric workflow.

---

## Commits

Documentation Sync

4674f63

Song-First Add Flow

3424320

Settings Defaults View

d9aae1d

Admin User Management View

127faad

Library Cleanup

bfaa5c0

Pastel Header Navigation

bda332f

Library Search Controls

623354a

Public Audio Links

6df6921

Lyrics Action Refinements

4a2ba68

Song Card Beat Display

5505f13

Inline Lyrics Editor

8d4f30f

Lyrics Mode and Song Editing Fixes

48a56fc

Active Song Action Styling

2b9543a

Latest-First Library Sorting

6121017

Library Filter and Recording Refinements

26f9803

Aligned Audio and Lyrics Actions

f289130

Public Library Sorting Controls

5624635

Contributor Library Filter

9316f65

Configurable App Title and Install Metadata

0c69183

App Settings RPC Fix

fffc084

Contributor Backfill and Offline Cache Scope

129e0a8

Read-Only Offline Cache

184d811

Mobile Library Layout Pass

934798f

Song Duplication and Beat Preference Scope

60bd113

Song Duplication and Beat Preferences

91ffad6

Public Beat Details Label

3845235

Inline Beat Add and Key Choices

eb97fb5

---

# v1.4.0 Microphone Recording

Status:
In Progress

Date:
June 2026

---

## Added

### Microphone Recording

Implemented:

* Browser microphone access
* navigator.mediaDevices.getUserMedia()
* MediaRecorder integration
* Start Recording
* Stop Recording
* Preview Recording
* Save Recording

Recordings reuse the existing audio upload pipeline.

No new database tables required.

No new storage buckets required.

---

### Recording UI

Added:

* Recording controls
* Recording preview
* Save recording workflow
* Recording status feedback

---

### Audio Diagnostics

Added diagnostic handling for audio loading failures.

Purpose:

Prevent audio access failures from appearing as missing audio.

Current investigation:

Logged-out users can still receive misleading audio state information.

Further refinement required.

---

## Architectural Decisions

### Song-Centric Direction

Music Manager is transitioning from:

Beat-Centric

to

Song-Centric

Target model:

Song
├─ Lyrics
├─ Audio
├─ Notes
├─ Tags
└─ Beats

Songs must be creatable before beats exist.

Beats become optional attachments.

---

### Documentation Governance

New project rule:

Discuss
↓
Agree
↓
Update Documentation
↓
Commit Documentation
↓
Implement Code
↓
Commit Code
↓
Update Documentation
↓
Commit Documentation

Documentation is part of the product.

---

### Offline First Strategy

Accepted direction:

Cache:

* Songs
* Lyrics
* Beats
* Keyboards
* Categories

Technology target:

* IndexedDB
* Service Worker

Goal:

Online once
↓
Cached
↓
Offline use

---

### Mobile UX Decisions

Song cards should show:

Song Name

First lyric line...

Only.

Not full lyrics.

---

### Dashboard Simplification

Planned:

Reports

├─ Recently Added
├─ Library Statistics
├─ Activity
└─ Audit

Category filters should become collapsible.

---

## Commits

Microphone Recording

35347701d408223b4b1f9aa900d0d073fb190241

Recording UI Styling

bad62ceb8cfaa088090e000e2737aa260e14e8f5

Audio Diagnostic Improvements

2a5f36d390b252c8e4b2f2478bead1ece8d8b1fc

Documentation Synchronization

f5bc391be5d1ef2d9ae96e52cf6fdb73938dd67f

Beat Use Timestamp Cleanup

6e7729a
