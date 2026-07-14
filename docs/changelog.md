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
