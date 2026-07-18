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
* Mobile Back closes presentation mode before leaving the app
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
* Search appears before Add Song.
* Add Song opens the form directly below its action row.
* Sort, Category, and Added by controls are hidden behind the Filters toggle.
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
* Opening one song-card section closes other open sections on that same song.
* Lyrics Mode can play available song audio while lyrics remain readable.
* Duplicate Song copies lyrics and beat settings.
* Duplicate Song can leave unchecked parts empty when users choose not to copy them.
* Multiple beats can be managed from the Beats or More action.
* Favorite/preferred and Worship/Praise/Other beat labels can be saved.
* Approved users see their minimal light-blue Song Steward greeting, verses rotate automatically, and the notification can be hidden.
* Manual view opens for logged-in users.
* Manual and Settings explain what works online and offline.
* App version appears in Settings.
* Admin Revoke and Remove Admin actions use pastel danger styling, while Make Admin is visually marked as sensitive.
* Missing Lyrics and Audio actions are visibly emphasized.
* Song card background and Lyrics Mode title remain easy to see.
* Admins can highlight a song from More and the song receives the highlighted card color.
* Admins can hide a song from More and non-admin users no longer see it.
* Admins can set a presentation date from More and the date appears in the More panel only when the song is highlighted.
* Approved users and admins can mark a song as presented from an in-app modal and Song Stats shows the presentation date.
* Highlighted songs with overdue presentation dates show a reminder only when a date exists and the song has not been marked presented for that date.
* Duplicate, hide/show, delete song, remove beat, delete audio, and Mark Presented use app-owned modals.
* Delete Song appears last in song More actions.
* Reports show most-presented songs with repeat counts.
* Highlighted songs appear first, sorted by earliest presentation date before regular library sorting.
* Public highlighted songs show only one More action, and it opens both presentation and beat details.
* Protected account shows PROTECTED treatment and cannot be changed from Admin user management.

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
* Audio files can be saved locally for offline playback after online access
* Mobile or unknown data connections show estimated audio cache size before saving

Offline:

* search works
* lyrics work
* beats visible

Not included:

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
* song highlighting
* hidden songs
* presentation dates
* statistics
* mobile layout
