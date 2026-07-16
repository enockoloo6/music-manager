# Development Checkpoints

---

# Current Milestone

v1.5.0 Song Foundation

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
Implemented

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
Implemented

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
* Inline Add Lyrics appears on the selected song card.
* Inline Add Audio appears on the selected song card.
* Duplicate Song copies lyrics and beat settings.
* Multiple beats can be managed from the Beats or More action.
* Favorite/preferred and Worship/Praise/Other beat labels can be saved.
* Manual view opens for logged-in users.
* App version appears in Settings.
* Missing Lyrics and Audio actions are visibly emphasized.
* Song card background and Lyrics Mode title remain easy to see.

---

# Checkpoint 5

Audio Visibility

Status:
Implemented

Verify:

Logged In

* audio available
* playback available

Logged Out

* songs with audio show audio access
* songs without audio hide audio access
* no private-storage diagnostic message appears as the public action

---

# Checkpoint 6

Offline Foundation

Status:
Read-only cache implemented

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

Not included:

* audio file caching
* offline edits
* sync queue

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
