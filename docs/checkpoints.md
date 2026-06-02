# Development Checkpoints

Use this file to decide when to run SQL, when to test, and what must be verified before a milestone is considered complete.

---

## Current Milestone

```text
v1.2.0 - Category Quick Filters Verification
```

Current active task:

```text
Verify implemented functionality and close the milestone only after successful testing.
```

Important verified repository facts:

- `CategoryFilters.jsx` exists.
- `categoryFilters.css` exists.
- `AppIntegrated.jsx` imports both files.
- `selectedCategory` state exists.
- Categories are derived from `styles.keyboard_location`.
- Search and category filtering are combined.
- No SQL migration is required.

---

## Checkpoint 1: Lyrics

Status:

```text
Implemented
```

Verify:

- edit lyrics
- save lyrics
- reload page
- open lyrics mode
- search by lyrics
- use presentation mode
- adjust font size controls
- print from presentation mode
- verify lyrics-only print isolation

Reference fix:

```text
6435b8042c5e4dfe7fedbd121738c50faef06847
```

---

## Checkpoint 2: Song Metadata

Status:

```text
Migration exists. Resume only intentionally.
```

Verify when resumed:

- tempo field
- musical key field
- notes field
- metadata search
- admin-only audit visibility

---

## Checkpoint 3: Category Quick Filters

Status:

```text
Implemented in code - awaiting manual verification
```

Verified implementation:

- CategoryFilters imported into AppIntegrated
- selectedCategory state exists
- categories derived from songs[].styles[].keyboard_location
- filtering combines search and category matching
- All option exists
- dedicated CSS file exists

Required verification:

- category buttons render below search
- categories are derived from existing style locations
- selecting a category narrows the song list
- All restores the full searched list
- search text and category filter work together
- songs with multiple styles appear when any style matches
- mobile layout remains usable

Milestone closure criteria:

- all checks above pass
- no regression in search behavior
- no regression in lyrics mode or presentation mode

---

## Checkpoint 4: Audio

Status:

```text
Not started
```

Future work:

- song_audio table
- music-manager-audio storage bucket
- upload UI
- playback UI

---

## Full Regression Testing Order

Before merging to main, test on eoloo:

1. login
2. signup
3. logout
4. admin approval
5. admin promotion
6. protected super admin cannot be demoted
7. add beat
8. edit beat
9. delete beat
10. delete song
11. default keyboard
12. keyboard/style loading
13. lyrics edit
14. lyrics mode
15. presentation mode
16. font size controls
17. print view
18. song name search
19. lyrics search
20. beat name search
21. category search/filter
22. keyboard model search
23. tempo search
24. musical key search
25. notes search
26. date search
27. recently added panel
28. statistics dashboard
29. mobile layout
30. offline banner

---

## Audit Policy

Audit information is admin-only.

Admins can see audit information.
Normal users must not see audit information.

---

## Documentation Rule

After every milestone completion, synchronize:

- START_HERE_MUSIC_MANAGER.md
- docs/project-state.md
- docs/resume-guide.md
- docs/checkpoints.md
- docs/app-integration-switch.md
- docs/changelog.md
- ROADMAP.md

---

## Main Rule

The repository is the source of truth.

Do not merge to main until testing passes on eoloo.
