# App.jsx Integration Switch

The integrated lyrics-ready app has been created in:

```text
src/AppIntegrated.jsx
```

This file includes the new modular architecture and wires together:

- LyricsMode
- LyricsEditor
- SongCard
- SearchBar
- AppFooter
- VersionBadge
- OfflineBanner
- useOnlineStatus
- songLyricsService

## Current Safe State

The original production-safe app is still in:

```text
src/App.jsx
```

The integrated version is beside it, ready for final activation.

## Final Switch

When ready, replace the contents of `src/App.jsx` with:

```js
import AppIntegrated from './AppIntegrated';

export default AppIntegrated;
```

## Why This Is Safe

`AppIntegrated.jsx` keeps the important existing behaviours:

- login/signup
- admin approval
- admin promotion
- protected super admin
- song loading
- keyboard loading
- default keyboard
- add beat
- edit beat
- delete song/beat

It also adds:

- lyrics editing
- lyrics viewing mode
- lyrics-aware search
- version display
- offline banner
- extracted reusable components

## Before Merging to main

After switching `App.jsx`, test:

1. Login
2. Signup
3. Admin approval
4. Add beat
5. Edit beat
6. Delete beat
7. Default keyboard
8. Search by song title
9. Search by lyrics
10. Edit lyrics
11. Open Lyrics Mode
12. Print view
13. Mobile layout
14. Offline banner by disabling network

## Important

Keep all testing on branch:

```bash
eoloo
```

Do not merge to `main` until the integrated version is tested.
