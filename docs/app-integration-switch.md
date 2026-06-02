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
- CategoryFilters

## Current Safe State

The original production-safe app is still in:

```text
src/App.jsx
```

The integrated version is beside it, ready for final activation.

## Category Quick Filters Status

CategoryFilters.jsx exists and AppIntegrated.jsx imports CategoryFilters together with categoryFilters.css. Documentation should be kept synchronized with implementation progress.

## Final Switch

When ready, replace the contents of `src/App.jsx` with:

```js
import AppIntegrated from './AppIntegrated';

export default AppIntegrated;
```

## Important

Keep all testing on branch:

```bash
eoloo
```
