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

# Current Development Focus

## Active Release

```text
v1.2.0 — Category Quick Filters
```

Current active task:

```text
Integrate src/components/CategoryFilters.jsx into src/AppIntegrated.jsx.
```

Important:

- `CategoryFilters.jsx` already exists.
- Do not recreate `CategoryFilters.jsx`.
- Categories are stored in `styles.keyboard_location`, not `songs.category`.
- `src/App.jsx` already exports `AppIntegrated`.

---

# Important Files to Read First

Before continuing work, review these files:

```text
START_HERE_MUSIC_MANAGER.md
ROADMAP.md
docs/checkpoints.md
docs/app-integration-switch.md
docs/recent-additions-and-audit-plan.md
```

Then review the active app files:

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

Main active app logic is now in:

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
✓ large lyrics display
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

Category filtering must therefore use the song styles array, for example:

```js
song.styles.some((style) => style.keyboard_location === selectedCategory)
```

This is important because one song can have multiple beats/styles/categories.

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

After every milestone completion, update the handoff documentation so a new chat can continue without guessing.

At minimum, keep these files synchronized:

```text
START_HERE_MUSIC_MANAGER.md
docs/resume-guide.md
docs/checkpoints.md
docs/app-integration-switch.md
ROADMAP.md
```

---

# Next Coding Task

Integrate Category Quick Filters:

1. Import existing `CategoryFilters.jsx` into `src/AppIntegrated.jsx`.
2. Derive available categories from `songs[].styles[].keyboard_location`.
3. Store selected category filter state.
4. Apply the selected category together with the existing search results.
5. Provide an `All` option to clear the category filter.
6. Keep the UI clean and musician-focused.

Do not create a new database migration for this task.

---

# Preserve Existing Working Features

While adding Category Quick Filters, avoid breaking:

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
