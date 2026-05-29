# START HERE - Music Manager Handoff

Use this file first when a new chat says:

```text
Continue Music Manager
```

## Repository

```text
enockoloo6/music-manager
```

## Active Branch

```text
eoloo
```

Do not work on `main` directly because `main` auto-deploys to Netlify production.

---

# Very Important

Do not create duplicate migrations or combined all-in-one migrations without checking existing files first.

Existing migrations already prepared:

```text
supabase/migrations/20260528_add_lyrics_to_songs.sql
supabase/migrations/20260529_add_song_metadata.sql
```

Do not create another migration unless the roadmap explicitly says that a new migration is needed.

---

# Current Milestone

```text
v1.2.0 - Category Quick Filters
```

Current active task:

```text
Integrate src/components/CategoryFilters.jsx into src/AppIntegrated.jsx.
```

Important: `CategoryFilters.jsx` already exists. Do not recreate it.

Latest relevant component commit:

```text
43c2fe6fe538b85f36c6359ba2bbe030ddfeab89
```

---

# Current Important Files

Read these before making changes:

```text
ROADMAP.md
docs/resume-guide.md
docs/checkpoints.md
docs/app-integration-switch.md
docs/recent-additions-and-audit-plan.md
```

Then review:

```text
src/AppIntegrated.jsx
src/App.jsx
src/components/CategoryFilters.jsx
src/services/songLyricsService.js
```

---

# Current App Status

The active app switch has already been done. `src/App.jsx` exports `AppIntegrated`:

```js
import AppIntegrated from './AppIntegrated';

export default AppIntegrated;
```

The main active app logic is now in:

```text
src/AppIntegrated.jsx
```

---

# Completed Features

## Authentication and Admin

```text
✓ login
✓ signup
✓ logout
✓ admin approval
✓ admin promotion
✓ protected super admin
✓ default keyboard
```

Protected super admin:

```text
enockoloo6@gmail.com
```

## Library Management

```text
✓ song loading
✓ keyboard loading
✓ add beat
✓ edit beat
✓ delete beat
✓ delete song
```

## Lyrics / Presentation

```text
✓ lyrics storage
✓ lyrics editor
✓ lyrics search
✓ presentation mode
✓ font size controls
✓ print from presentation mode
```

## Dashboard

```text
✓ SearchBar
✓ Recently Added panel
✓ Recently Added collapse/expand
✓ Recently Added state persistence
✓ Library Statistics dashboard
```

## Search

Search currently supports:

```text
✓ song name
✓ lyrics
✓ beat name
✓ category
✓ keyboard model
✓ tempo
✓ musical key
✓ notes
✓ date search
```

Date search examples:

```text
today
yesterday
this week
last week
May 2026
29 May 2026
```

---

# Critical Data Model Note

There is currently no `songs.category` field.

Categories are stored on styles/beats:

```text
styles.keyboard_location
```

Category filtering must therefore use:

```js
song.styles.some(style => style.keyboard_location === selectedCategory)
```

This is important because one song can have multiple beats/styles/categories.

---

# User Action Rules

Do not ask the user to run SQL until there is a clear checkpoint.

Use these exact labels when action is needed:

```text
RUN SQL
TEST NOW
CONFIGURE SUPABASE
MANUAL ACTION REQUIRED
```

Current user action required:

```text
None
```

---

# SQL Status

Do not create or ask for new SQL for Category Quick Filters.

Lyrics SQL exists:

```text
supabase/migrations/20260528_add_lyrics_to_songs.sql
```

Song metadata SQL exists but should not be run until metadata UI is intentionally resumed:

```text
supabase/migrations/20260529_add_song_metadata.sql
```

---

# Components Currently Present

```text
AppFooter.jsx
CategoryFilters.jsx
LibraryStats.jsx
LyricsEditor.jsx
LyricsMode.jsx
OfflineBanner.jsx
RecentAdditions.jsx
SearchBar.jsx
SongCard.jsx
VersionBadge.jsx
```

---

# Next Recommended Work

1. Do not duplicate migrations.
2. Do not recreate `CategoryFilters.jsx`.
3. Integrate `CategoryFilters.jsx` into `AppIntegrated.jsx` below `SearchBar`.
4. Add `selectedCategory` state.
5. Generate categories from `styles.keyboard_location`.
6. Filter songs using both search and selected category.
7. Add light pill-button styling.
8. Then test on branch `eoloo`.

---

# Current Roadmap Snapshot

```text
v1.1.1 - Dashboard/search/presentation improvements - implemented
v1.2.0 - Category Quick Filters - in progress
v1.2.x - Search Hints / Recently Modified groundwork
v1.3.0 - Admin-only Audit Trail
v1.4.0 - Favorites / Audio Support
```

Audit trail rule:

```text
Only admins should see who added or modified a song/beat.
Normal users must not see audit details.
```
