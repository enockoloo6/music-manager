# Development Checkpoints

Use this file to decide when to run SQL, when to test, and what must be verified before a milestone is considered complete.

---

## Current Milestone

```text
v1.2.0 - Category Quick Filters
```

Current active task:

```text
Integrate src/components/CategoryFilters.jsx into src/AppIntegrated.jsx.
```

Important notes:

- `CategoryFilters.jsx` already exists.
- Do not recreate `CategoryFilters.jsx`.
- Categories are stored in `styles.keyboard_location`, not `songs.category`.
- No SQL migration is needed for Category Quick Filters.

---

## Checkpoint 1: Lyrics

Migration file:

```text
supabase/migrations/20260528_add_lyrics_to_songs.sql
```

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

---

## Checkpoint 2: Song Metadata

Migration file:

```text
supabase/migrations/20260529_add_song_metadata.sql
```

Status:

```text
Migration exists, but metadata UI should only be resumed intentionally.
```

Do not create a duplicate metadata migration.

When metadata UI work resumes, verify:

- tempo field
- musical key field
- notes field
- metadata search
- admin-only audit visibility where applicable

---

## Checkpoint 3: Category Quick Filters

Status:

```text
In progress
```

No SQL required.

Expected implementation:

1. Import existing `src/components/CategoryFilters.jsx` into `src/AppIntegrated.jsx`.
2. Add `selectedCategory` state.
3. Generate category options from `songs[].styles[].keyboard_location`.
4. Filter songs using both existing search logic and selected category.
5. Provide an `All` option to clear the category filter.
6. Keep styling light and mobile-friendly.

Category filtering must use the styles array, for example:

```js
song.styles.some((style) => style.keyboard_location === selectedCategory)
```

Do not use `songs.category`; that field does not exist.

Test after implementation:

- category buttons render below search
- categories are derived from existing style/beat locations
- selecting a category narrows the song list
- `All` restores the full searched list
- search text and category filter work together
- songs with multiple styles still appear when any matching style has the selected category
- mobile layout remains usable

---

## Checkpoint 4: Audio

Status:

```text
Not ready yet
```

Later this will need:

- `song_audio` table
- `music-manager-audio` Supabase Storage bucket
- upload UI
- playback UI

---

## Full Regression Testing Order

Before merging to main, test on `eoloo`:

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

```text
✓ Admins can see audit information
✗ Normal users cannot see audit information
```

Normal users must not see who added or modified a song/beat.

---

## Documentation Rule

After every milestone completion, update:

```text
START_HERE_MUSIC_MANAGER.md
docs/resume-guide.md
docs/checkpoints.md
docs/app-integration-switch.md
ROADMAP.md
```

---

## Main Rule

Do not merge to `main` until testing passes on `eoloo`.
