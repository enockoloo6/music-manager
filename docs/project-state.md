# Music Manager Project State

Repository:
enockoloo6/music-manager

Branch:
eoloo

---

# Source of Truth

Repository code and repository documentation are the source of truth.

Never rely on previous chats.

Verify repository state first.

---

# Current Release Status

## v1.2.0 Category Quick Filters

Status:
Complete
Verified

Implemented:

* Category filters
* Search + Category combination
* Mobile support

Verification completed.

---

## v1.3.0 Audio Upload & Playback

Status:
Complete
Verified

Implemented:

* Audio upload
* Audio playback
* Audio deletion
* Signed URLs
* song_audio metadata
* Storage integration

Storage Bucket:

music-manager-audio

Database:

music_manager.song_audio

Verification completed.

---

## v1.4.0 Microphone Recording

Status:
Implemented

Implemented:

* getUserMedia()
* MediaRecorder
* Start Recording
* Stop Recording
* Preview Recording
* Save Recording
* Existing upload pipeline reuse
* Recording UI styling

Pending:

* Full regression verification
* Broader mobile browser testing

---

## v1.5.0 Song Foundation

Status:
In Progress

Implemented direction:

* Primary add flow starts with Song Name.
* Lyrics can be entered before any beat or keyboard setting exists.
* Piano settings remain available as optional beat details.
* A song can be saved without a beat.
* Optional beat details can be attached during song creation or added later from the saved song.
* Default preferences live in Settings instead of the main library page.
* Admin-only user management lives on an Admin page instead of the main library page.
* Reports-only information moves to a Reports page instead of the main library page.
* Category filters are collapsed until needed.
* Library search stays visible, while Sort, Category, and Added by controls are tucked behind a Filters toggle.
* Add Song sits after Search and opens the add form directly below its button with filters out of the way.
* Song-card secondary actions are grouped so the primary song list stays compact.
* Audio controls are opened on demand instead of rendering on every song card.
* Logged-out users do not trigger audio permission errors.
* Main navigation lives in the header.
* Song cards use a softer pastel blue treatment instead of dark blue headers.
* Version and role labels stay visually quiet.
* Lyrics previews are not shown on song cards because Lyrics opens the full view.
* Audio is visible as a primary song action next to Lyrics.
* Audio links are shown only for songs that have audio.
* Public users can see and play audio when a song has audio.
* Lyrics links are shown only for songs that have lyrics.
* Users with Edit permission see Add Lyrics when a song has no lyrics.
* Add/Edit Lyrics opens inside the selected song card, beside the song context, not as a separate panel above the library list.
* Lyrics Mode close action is prominent.
* Lyrics Mode can be closed with Escape.
* Mobile back closes Lyrics Mode and returns to the library before the browser/app can leave the page.
* Lyrics Mode loads the song's playable audio attachment and keeps a compact audio player visible while lyrics are read.
* Lyrics printing should include only the lyrics content and no blank app-layout pages.
* Approved users can edit the song name inline from the song card.
* Open song-card actions, such as Hide Audio, are visually stronger than inactive action links.
* Audio follows the same empty-state pattern as lyrics: users with Add permission see Add Audio when no audio exists.
* Open inline song-card actions use the same active visual treatment across lyrics, audio, and More.
* Opening one song-card section closes the other open sections on that card so Lyrics, Audio, Beats, and More do not compete.
* Library song cards auto-collapse open sections on other songs by default; Settings includes a local Display checkbox to disable that behavior on the current device.
* Duplicate, hide/show, delete song, remove beat, delete audio, and Mark Presented use app-owned modals instead of browser prompts or confirms.
* Library defaults to latest-added songs first, using the newest beat timestamp available for each song.
* Compact library sort and category controls sit beside the song count for logged-in users.
* Public users can sort and search the library, but Category filtering and song counts are hidden.
* Song count uses compact wording, for example `38 songs`.
* Logged-in users can filter songs by contributor email.
* New songs store the profile id of the user who first added the song.
* Existing songs are backfilled to `ngoziredorcas@gmail.com` as contributor.
* Approved users see a minimal light-blue Song Steward greeting with their display name, auto-rotating KJV encouragement verse, hide control, and a warm heart marker.
* Admins can set the visible app title from Settings.
* Admin user-management actions visually distinguish calm approval from pastel dangerous revoke/remove-admin actions and sensitive admin grants.
* The default app title and Android install name should be `Music Manager`.
* The header uses a music-focused mark instead of a piano-specific icon.
* The app has basic install metadata for Android, a read-only local cache for library data, and IndexedDB audio caching for offline playback after online access.
* Mobile layout keeps the header, library filters, and song-card actions stacked without horizontal overflow.
* Approved users can duplicate an existing song, including lyrics and beat settings, then edit the copy.
* Song duplication lets users choose which parts to copy: lyrics, beat settings, song metadata, and presentation planning.
* Songs can have multiple beats; beats open from a Beats action instead of always crowding the card.
* Approved editors can add another beat directly from a saved song card.
* Public users see that beat-details action as More.
* Beats can be marked as favorite/preferred and labelled for Worship, Praise, or other use.
* Beat add/edit forms use standard musical key choices while preserving older custom key values.
* Search no longer has a separate category tab beside it.
* Beat details use pipe separators and share the subdued piano model color.
* Audio recording has a standard maximum duration with a visible timer and automatic stop.
* Song cards do not show beat count or lyrics status badges.
* Beat rows show Beat Category from `styles.keyboard_location` attached to the beat name as `Beat(category)`.
* Beat row text uses the same visual weight, with keyboard model aligned separately on the right where space allows.
* Keyboard model text remains smaller and subdued, matching the beat notes color.
* Song count appears beside Add Song.
* Search and category filtering share one control row.
* Invalid timestamp-like beat use values have been removed from live data and are hidden in the UI.
* Public library filtering ignores stale category state after logout.
* Mobile song names keep a bold visual weight matching desktop.
* Save Recording is green after audio capture to make the save action easier to find.
* Logged-in users can open a Manual view from the header for quick usage guidance.
* Manual and Settings include brief online/offline capability notes, including offline audio behavior and data-size warnings.
* The app version is shown in Settings instead of the primary header.
* Missing Lyrics and Audio actions remain link-style actions with a softer visible color emphasis.
* Song card headers and outlines use a deeper blue treatment so the song background is more visible.
* Lyrics Mode displays the song title with stronger contrast and visual weight.
* Users with Planning permission can highlight songs so they receive a muted warm card treatment in the library.
* Users with Planning permission can hide songs from non-planning library views without deleting them.
* Users with Planning permission can mark songs with a presentation date, visible from the song More panel only when the song is highlighted.
* Presentation planning stores the admin who last updated the planning state.
* Users with Planning permission can mark songs as presented from an in-app modal, creating dated presentation-history rows.
* Highlighted songs with overdue presentation dates trigger an in-app reminder modal until marked presented, with Remind Later quieting it for the day.
* Logged-in users can open Song Stats from a song More panel to see presentation count and dates.
* Song More actions keep Delete Song last after edit, duplicate, lyrics, Mark Presented, and Song Stats actions.
* Reports show most-presented songs so the team can see repeated favorites over time.
* Highlighted songs display first in the library, ordered by earliest presentation date before the normal library sort is applied.
* Public highlighted songs use a single More action that opens presentation and beat details together, avoiding duplicate More links.
* `enockoloo6@gmail.com` is treated as the protected owner, receives full access, and cannot be restricted from user management.
* Protected users have full access and remain immune to ordinary super-admin restrictions.
* Users with `can_manage_protected_users` can add or remove protected status for other users; Super Admin does not automatically grant this separate protected-management authority.
* Settings, Admin, and Log Trail are visible only to super admins/protected users.
* The in-app Manual is capability-aware and only displays instructions for actions available to the logged-in account.
* The app prompts phone users to install Music Manager when the browser reports install support, with iOS Add to Home Screen instructions where native install is unavailable.
* Logged-in approved users can use a Consecration Songs tab to add style groups or Play without styles groups and paste the songs that belong under them, preserving the document order for team playing while keeping the main Library workflow separate.
* Consecration groups can be highlighted, assigned due dates, split into configurable song subgroups, and given a highlighted subgroup.
* Consecration edit mode lets users drag songs by the handle to reorder them or move them between subgroups; dropping onto a song places it there, while dropping inside a subgroup moves it to the end.
* Consecration saved groups use the blue list treatment; add/edit forms use the shared gold work-form treatment.
* Suggestions are stored in `music_manager.song_suggestions`; public visitors can search first, then submit song ideas for Consecration, Presentation, Library, or Other, with an optional suggester name. Logged-out visitors cannot see the suggestion list. Permitted logged-in users can view details, manually add songs through the proper Library or Consecration steps, and delete suggestions; delete actions are written to Log Trail.
* Super admins can clear the Log Trail through `music_manager.clear_audit_logs()`, which immediately writes a fresh `log_clear` record after cleanup.
* Supabase auth signups trigger `music_manager.handle_new_auth_user()` so pending profiles appear for Admin approval without relying on the new user logging in first.
* A stale shared Supabase trigger named `on_auth_user_created` was removed because it inserted into missing `public.profiles` and caused `Database error saving new user`; Music Manager keeps its own guarded auth trigger.
* Password reset is handled from the login form: users request a reset email, open the Supabase recovery link, then enter and confirm a new password in the app.
* Frontend action visibility is centralized through `src/rbac.js`; components receive capability flags so users do not see Add, Edit, Delete, Planning, audio, Consecration, Log Trail, Settings, or Admin controls unless their role grants that action. The Admin page shows stored access switches beside an effective capability matrix for each user.
* Add actions and Planning are separate stored permissions: `can_add_songs` controls Add Song, Duplicate Song, Add Beat, Add Audio, and Add Consecration groups; `can_plan_presentations` controls highlight, hide, presentation date planning, and Mark Presented.
* Admin user cards are collapsed by default with status badges, an access summary, and a capability count; opening Manage on one user reveals that user's switches and capability matrix.
* Protected and Manage Protected switches remain visible but dimmed unless the current admin has `can_manage_protected_users`.

---

# Current Product Direction

Music Manager is transitioning from:

Beat-Centric

to

Song-Centric

Target:

Song
├─ Lyrics
├─ Audio
├─ Notes
├─ Tags
└─ Beats

Songs must be creatable without beats.

Immediate implementation rule:

Do not require keyboard, beat name, tempo, key, category, or beat notes to save a song.
Only create a beat/style record when beat details are provided.
Keep default settings outside the main library workflow.
Keep admin management outside the main library workflow.
Keep reports, secondary actions, and audio management outside the first-view song entry workflow.
Use a soft blue and light-blue theme for content surfaces and reserve dark header color for global navigation only.
Use song-level planning flags for visibility, highlighting, and presentation scheduling instead of duplicating songs.

---

# Current Technical Debt

Largest technical debt:

src/AppIntegrated.jsx

Strategy:

Gradual extraction into:

* components
* hooks
* services

No rewrites.

Only incremental refactoring.

---

# Known Issues

## Offline Audio and Sync

Read-only local cache exists for library data.
Audio files are saved in IndexedDB for offline playback after online access. On Wi-Fi the app saves audio without a data warning; on mobile or unknown network types, it shows the estimated audio size before saving.

Not implemented yet:

* Offline song, lyric, beat, or audio edits
* Save queue and later synchronization

---

## Recently Added

Issue:

Dates appear similar.

Need audit of:

* database values
* display logic

Decision pending:

Recently Added

or

Recently Added / Updated

---

# Mobile UX Decisions

Song cards should display:

Song Name

First lyric line...

Only.

Not full lyrics.

---

# Offline First Requirement

Priority:

High

Cache:

* Songs
* Lyrics
* Beats
* Keyboards
* Categories

Preferred technology:

* IndexedDB
* Service Worker

Goal:

Online once
↓
Cached
↓
Usable offline
