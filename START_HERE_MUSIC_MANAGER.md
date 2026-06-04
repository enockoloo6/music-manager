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

v1.4.0 Microphone Recording

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

Recent commits:

35347701d408223b4b1f9aa900d0d073fb190241
bad62ceb8cfaa088090e000e2737aa260e14e8f5
2a5f36d390b252c8e4b2f2478bead1ece8d8b1fc

---

# Known Issues

Audio visibility when logged out.

Current symptom:

Audio diagnostic message appears for all songs.

Root cause investigation:

Need separation between:

* Audio metadata visibility
* Audio playback visibility

---

# Mobile UX Decisions

Song cards should display:

Song Title

First lyric line...

Only.

Not entire lyrics.

---

# High Priority Roadmap

1. Audio visibility fix
2. Offline cache foundation
3. Song-centric foundation
4. Reports section
5. Category toggle
6. Recently Added audit
7. Microphone UX enhancements

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

---

# Read Next

1. docs/project-state.md
2. docs/resume-guide.md
3. docs/checkpoints.md
4. docs/changelog.md
5. docs/architecture.md
6. ROADMAP.md

