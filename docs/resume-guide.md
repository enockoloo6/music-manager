# Music Manager Resume Guide

Use this document when continuing work in a new chat.

---

# Repository

enockoloo6/music-manager

Branch:

eoloo

Never work on main.

---

# Mandatory Read Order

1. START_HERE_MUSIC_MANAGER.md
2. docs/project-state.md
3. docs/resume-guide.md
4. docs/checkpoints.md
5. docs/changelog.md
6. docs/architecture.md
7. ROADMAP.md

---

# Mandatory Process

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

Do not allow stale documentation.

---

# Current Completed Milestones

v1.2.0 Category Quick Filters

Status:
Verified

v1.3.0 Audio Upload & Playback

Status:
Verified

---

# Current Active Milestone

v1.5.0 Song Foundation

Status:
In Progress

Implemented:

* Song-first add flow
* Optional lyrics, audio, and beat settings
* Settings, Admin, and Reports navigation
* Public audio visibility
* Inline Add Lyrics and Add Audio
* Latest/category/contributor filters
* App title setting and Android install metadata
* Read-only offline cache foundation
* Song duplication
* Multiple beat management with favorite/preferred and Worship/Praise/Other labels
* Public beat-details action labelled More
* Invalid timestamp-like beat use values cleaned and hidden

Recent commits:

6e7729a

282a27c

---

# Product Direction

Music Manager is becoming Song-Centric.

Target workflow:

Create Song
↓
Add Lyrics
↓
Save
↓
Add Beat Later
↓
Add Audio Later

Do not design new features assuming a beat must exist.

---

# Immediate Priorities

1. Full regression testing before production merge
2. Offline audio caching design
3. Offline save and synchronization
4. Further AppIntegrated.jsx extraction
5. Reports and audit expansion
6. Microphone mobile verification

---

# Important UX Decisions

## Mobile

Song cards should stay compact, with actions visible and no full lyrics preview.

## Reports

Move:

* Recently Added
* Library Statistics

under:

Reports

## Categories

Category filtering is available as a compact dropdown beside sorting.

## Offline

Offline support is a product requirement.
