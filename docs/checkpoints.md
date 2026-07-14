# Development Checkpoints

---

# Current Milestone

v1.4.0 Microphone Recording

Status:
In Progress

---

# Checkpoint 1

Lyrics System

Status:
Verified

Verify:

* Edit lyrics
* Save lyrics
* Reload
* Search lyrics
* Presentation mode
* Printing

---

# Checkpoint 2

Category Quick Filters

Status:
Verified

Verify:

* Category filtering
* Search + category combination
* Mobile usability

---

# Checkpoint 3

Audio Upload & Playback

Status:
Verified

Verify:

* Upload audio
* Playback audio
* Delete audio
* Signed URLs
* Refresh persistence

---

# Checkpoint 4

Microphone Recording

Status:
In Progress

Verify:

* Start Recording
* Stop Recording
* Preview Recording
* Save Recording
* Upload recording
* Refresh persistence
* Mobile browser testing

---

# Checkpoint 4A

Song-First Add Flow

Status:
In Progress

Verify:

* Add form starts with Song Name and Lyrics.
* Song can be saved with only a song name.
* Song can be saved with song name and lyrics.
* Keyboard is not required to save a song.
* Beat details are optional.
* A beat/style row is created only when optional beat details are provided.
* Existing default keyboard still pre-fills optional piano settings.
* Default keyboard selector appears in Settings, not on the main library page.
* Admin panel appears only in Admin view.
* Admin navigation appears only for admins.
* Existing beat edit flow still works.

---

# Checkpoint 5

Audio Visibility

Status:
Investigation

Verify:

Logged In

* audio available
* playback available

Logged Out

* metadata state clear
* no misleading messages

---

# Checkpoint 6

Offline Foundation

Status:
Planned

Verify:

* Songs cached
* Lyrics cached
* Beats cached
* Keyboards cached
* Categories cached

Offline:

* search works
* lyrics work
* beats visible

---

# Full Regression Suite

Before merge:

* login
* signup
* logout
* admin approval
* admin promotion
* protected super admin
* add beat
* edit beat
* delete beat
* delete song
* default keyboard
* lyrics edit
* lyrics search
* presentation mode
* category filters
* audio upload
* audio playback
* audio delete
* microphone recording
* recently added
* statistics
* mobile layout
