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

Do not create another migration such as:

```text
add_lyrics_audio_and_versions.sql
```

unless the roadmap explicitly says that a new migration is needed.

---

# Current Milestone

```text
v1.1.0 - Lyrics Support / Lyrics Release Candidate
```

Current active task:

```text
Stabilize AppIntegrated.jsx and prepare activation/testing.
```

---

# Current Important Files

Read these before making changes:

```text
ROADMAP.md
docs/resume-guide.md
docs/checkpoints.md
docs/app-integration-switch.md
docs/lyrics-release-test-plan.md
docs/refactor-progress.md
```

Then review:

```text
src/AppIntegrated.jsx
src/App.jsx
```

---

# Current App Status

The original active app is still:

```text
src/App.jsx
```

The new integrated lyrics-ready app is:

```text
src/AppIntegrated.jsx
```

The intended final activation is to replace `src/App.jsx` with:

```js
import AppIntegrated from './AppIntegrated';

export default AppIntegrated;
```

Only do this when ready to activate and test the integrated app.

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

Do not run SQL yet unless moving into lyrics testing.

First SQL checkpoint:

```text
supabase/migrations/20260528_add_lyrics_to_songs.sql
```

Run only before testing lyrics editing/search/mode.

Second SQL checkpoint:

```text
supabase/migrations/20260529_add_song_metadata.sql
```

Run later after metadata UI is added.

---

# Features Prepared

Already prepared:

```text
LyricsMode
LyricsEditor
SongCard
SearchBar
AppFooter
VersionBadge
OfflineBanner
useOnlineStatus
songLyricsService
AppIntegrated.jsx
```

---

# Next Recommended Work

1. Do not duplicate migrations.
2. Inspect `AppIntegrated.jsx`.
3. Continue stabilizing the lyrics release candidate.
4. Prepare safe activation of `AppIntegrated.jsx`.
5. Only then ask the user to run lyrics SQL and test.

---

# Future Roadmap

```text
v1.1.0 - Lyrics Support
v1.1.1 - Song Metadata Foundation
v1.2.0 - Audio Support
v1.4.0 - Setlists and Worship Sessions
v2.0.0+ - Offline / PWA
```
