# Music Manager Resume Guide

Use this file when resuming development in a future chat or work session.

---

# Repository

```text
enockoloo6/music-manager
```

---

# Active Branch

Always continue work on:

```bash
git checkout eoloo
```

Do not work directly on `main` because it auto-deploys to Netlify production.

---

# Repository-First Rule

The repository is the source of truth.

Before making decisions, verify documentation claims against the current code on branch `eoloo`.

If documentation and code disagree, update the documentation to match the code.

Primary state file:

```text
docs/project-state.md
```

---

# Current Development Focus

## Active Release

```text
v1.2.0 — Category Quick Filters
```

Current active task:

```text
Run the Category Quick Filters verification checklist and close the milestone only if testing passes.
```

Important verified repository facts:

- `src/App.jsx` exports `AppIntegrated`.
- `src/AppIntegrated.jsx` imports `CategoryFilters`.
- `src/AppIntegrated.jsx` imports `./styles/categoryFilters.css`.
- `selectedCategory` state exists in `src/AppIntegrated.jsx`.
- Categories are derived from `songs[].styles[].keyboard_location`.
- Search and category filtering are combined in `filteredSongs`.
- `CategoryFilters` renders below `SearchBar`.
- `src/components/CategoryFilters.jsx` exists.
- `src/styles/categoryFilters.css` exists.
- Do not recreate `CategoryFilters.jsx`.
- Do not create a database migration for Category Quick Filters.

---

# Important Files to Read First

Before continuing work, review these files in this order:

```text
START_HERE_MUSIC_MANAGER.md
docs/project-state.md
docs/resume-guide.md
docs/checkpoints.md
docs/app-integration-switch.md
docs/changelog.md
ROADMAP.md
```

Then review the active app files:

```text
src/App.jsx
src/AppIntegrated.jsx
src/components/CategoryFilters.jsx
src/styles/categoryFilters.css
src/components/LyricsMode.jsx
src/styles/lyricsMode.css
src/services/songLyricsService.js
```

Note: `docs/changelog.md` may need to be created if repository documentation continues to reference it.

---

# Current App Status

The active app switch has already been done. `src/App.jsx` exports `AppIntegrated`:

```js
import AppIntegrated from './AppIntegrated';

export default AppIntegrated;
```

Main active app logic is now in:

```text
src/AppIntegrated.jsx
```

---

# Completed / Implemented in Code

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
✓ large lyrics display
✓ font size controls
✓ print from presentation mode
✓ lyrics-only print isolation
```

Print isolation fix commit:

```text
6435b8042c5e4dfe7fedbd121738c50faef06847 - Fix print isolation for lyrics presentation mode
```

Accepted print limitation:

```text
Some browsers or PDF generators may still create trailing blank pages after lyrics printing.
```

## Dashboard

```text
✓ SearchBar
✓ Recently Added panel
✓ Recently Added collapse/expand
✓ Recently Added state persistence
✓ Library Statistics dashboard
```

## Search and Filtering

Search currently supports:

```text
✓ song name
✓ lyrics
✓ beat name
✓ category/location text
✓ keyboard model
✓ tempo
✓ musical key
✓ notes
✓ date search
```

Category Quick Filters are implemented in code and use `styles.keyboard_location` through the song styles array.

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

Category filtering must therefore use the song styles array, for example:

```js
(song.styles || []).some((style) => style.keyboard_location === selectedCategory)
```

This is important because one song can have multiple beats/styles/categories.

---

# Pending Manual Verification

Category Quick Filters should not be marked closed until the following has been tested in the browser:

- category buttons render below search
- categories are derived from existing style/beat locations
- selecting a category narrows the song list
- `All` restores the full searched list
- search text and category filter work together
- songs with multiple styles still appear when any matching style has the selected category
- mobile layout remains usable

Also verify the recent print fix:

- lyrics-only print output does not show dashboard/admin/general app UI
- printed lyrics flow across pages without repeated lyrics or page-break truncation

---

# Audit Policy

Audit information is admin-only.

```text
✓ Admins can see audit information
✗ Normal users cannot see audit information
```

Any audit trail UI or recently modified metadata must respect this policy.

---

# Documentation Rule

Documentation is part of the product.

After every milestone completion, update the handoff documentation so a new chat can continue without guessing.

At minimum, keep these files synchronized:

```text
START_HERE_MUSIC_MANAGER.md
docs/project-state.md
docs/resume-guide.md
docs/checkpoints.md
docs/app-integration-switch.md
docs/changelog.md
ROADMAP.md
```

---

# Next Work

Do not start new feature development until documentation synchronization and repository audit are complete.

Next steps:

1. Finish synchronizing stale documentation.
2. Run the Category Quick Filters verification checklist.
3. If testing passes, close v1.2.0 in documentation.
4. Continue to the next roadmap milestone.

---

# Preserve Existing Working Features

While verifying or changing Category Quick Filters, avoid breaking:

- login/signup
- admin approval
- admin promotion
- protected super admin
- beat add/edit/delete
- default keyboard
- keyboard/style loading
- lyrics editing
- lyrics search
- presentation mode
- print isolation
- date search
- recently added
- statistics dashboard

---

# Helpful Mental Model

Music Manager is moving from:

```text
simple beat library
```

toward:

```text
worship and performance music platform
```

Development should remain gradual, documented, and safe.
