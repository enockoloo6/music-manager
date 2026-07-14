# START HERE - Music Manager Handoff

Repository: enockoloo6/music-manager
Branch: eoloo

---

# Source of Truth

Repository code and repository documentation are the source of truth.

If documentation and code disagree:

1. Verify repository code.
2. Update documentation.
3. Commit documentation.
4. Continue work.

Never work directly on main.

main auto-deploys to Netlify production.

---

# Development Rule

Always follow:

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
Update Documentation Again
↓
Commit Documentation Again

Do not allow stale documentation.

---

# Current Product Direction

Music Manager is transitioning from:

Beat-Centric

to

Song-Centric

Target architecture:

Song
├─ Lyrics
├─ Audio
├─ Notes
├─ Tags
└─ Beats

A song must be creatable before a beat exists.

Beats are optional attachments.

Users should be able to:

1. Add Song
2. Add Lyrics
3. Save
4. Add Beat Later
5. Add Audio Later

---

# Completed Milestones

v1.2.0 Category Quick Filters

Status:
Complete
Verified

v1.3.0 Audio Upload & Playback

Status:
Complete
Verified

Features:

* Upload audio
* Playback audio
* Delete audio
* Signed URLs
* song_audio metadata
* Private storage bucket

---

# Active Milestone

v1.5.0 Song Foundation

Status:
In Progress

Implemented:

* Song-first add flow
* Optional lyrics, audio, and beat attachments
* Settings, Reports, and Admin navigation
* Public audio visibility for songs that have audio
* Inline Add Lyrics and Add Audio actions for approved users
* Latest-added sorting, category filtering, and contributor filtering
* Configurable app title and Android install name: Music Manager
* Read-only local cache foundation
* Song duplication
* Multiple beat support with favorite/preferred and Worship/Praise/Other labels
* Public beat-details action labelled More
* Beat details hide invalid timestamp-like use values

Recent commits:

6e7729a
282a27c

---

# Known Issues

Offline audio caching and offline edit synchronization are not implemented.
The current offline work is read-only cache support for library data.

---

# Mobile UX Decisions

Song cards should display:

Song Title

Available actions

Only.

Not full lyrics previews or status badges.

---

# High Priority Roadmap

1. Finish full regression testing
2. Improve offline audio caching design
3. Add offline save and sync queue
4. Continue extracting AppIntegrated.jsx
5. Extend Reports and audit views
6. Polish microphone recording on mobile

---

# Offline First Requirement

After a user accesses data online:

Songs
Lyrics
Beats
Keyboards
Categories

should remain available offline.

Preferred stack:

* IndexedDB
* Service Worker
* Background Sync

Current implementation:

Read-only local cache foundation only. Audio files and offline edits are future work.

---

# Read Next

1. docs/project-state.md
2. docs/resume-guide.md
3. docs/checkpoints.md
4. docs/changelog.md
5. docs/architecture.md
6. ROADMAP.md
