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
* Song-card secondary actions moved behind More.
* Beat edit/remove actions are collapsed behind Beat actions.
* Audio tools load only when opened for a song.
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
* Approved users see Add Lyrics when a song has no lyrics.
* Lyrics Mode close action is more visible.
* Song cards no longer show beat count or lyrics status badges.
* Beat category now appears attached to the beat name as `Beat(category)`.
* Keyboard model is visually separated to the right of each beat row where space allows.

Public audio visibility depends on applying the public read migration to the active Supabase project.

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
