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

v1.4.0 Microphone Recording

Status:
In Progress

Implemented:

* Microphone capture
* MediaRecorder
* Recording controls
* Preview recording
* Save recording
* Recording UI styling

Recent commits:

35347701d408223b4b1f9aa900d0d073fb190241

bad62ceb8cfaa088090e000e2737aa260e14e8f5

2a5f36d390b252c8e4b2f2478bead1ece8d8b1fc

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

1. Fix audio visibility
2. Offline cache foundation
3. Song foundation
4. Reports section
5. Category toggle
6. Recently Added audit
7. Microphone verification

---

# Important UX Decisions

## Mobile

Only first lyric line should appear on song cards.

## Reports

Move:

* Recently Added
* Library Statistics

under:

Reports

## Categories

Make collapsible.

## Offline

Offline support is a product requirement.

