# Lyrics Release Test Plan

Target release:

v1.1.0 - Lyrics Support

## Purpose

This checklist verifies that the integrated lyrics version is safe before replacing the original App.jsx.

## Files Under Test

- src/AppIntegrated.jsx
- src/components/LyricsMode.jsx
- src/components/LyricsEditor.jsx
- src/components/SongCard.jsx
- src/components/SearchBar.jsx
- src/components/AppFooter.jsx
- src/components/OfflineBanner.jsx
- src/services/songLyricsService.js
- src/hooks/useOnlineStatus.js

## Database Requirement

Run this migration before testing lyrics:

- supabase/migrations/20260528_add_lyrics_to_songs.sql

Confirm the songs table has:

- lyrics text

Then refresh schema cache:

```sql
notify pgrst, 'reload schema';
```

## Activation Step

When ready to activate the integrated app, replace src/App.jsx with:

```js
import AppIntegrated from './AppIntegrated';

export default AppIntegrated;
```

## Test Checklist

### Authentication

- Login works.
- Logout works.
- Signup/request access works.
- Pending user message still appears.

### Admin

- Admin panel loads.
- User approval works.
- Admin promotion works.
- Protected super admin cannot be demoted.

### Existing Music Features

- Songs load.
- Keyboards load.
- Add beat works.
- Edit beat works.
- Delete beat works.
- Default keyboard saves.
- Existing notes still display.

### Lyrics Features

- Edit Lyrics button appears for approved users.
- Lyrics can be pasted and saved.
- Saved lyrics appear as preview on song card.
- Lyrics button opens Lyrics Mode.
- Lyrics Mode is readable on mobile.
- Close button exits Lyrics Mode.
- Empty lyrics show a friendly message.

### Search

- Search by song title works.
- Search by lyrics content works.
- Search count displays correctly.

### Offline Awareness

- When browser is online, no offline banner is shown.
- When browser is offline, offline banner appears.

### Print / Mobile

- Print button still works.
- no-print areas are hidden in print.
- Mobile layout remains usable.

## Rollback

If the integrated app has issues, restore the original App.jsx from Git history and continue using AppIntegrated.jsx as the working integration branch.

## Release Decision

Only merge to main after all checklist items pass on eoloo.
