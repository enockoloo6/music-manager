# Offline Plan

Future target release for full offline editing: v2.0.0 or later.

Music Manager should eventually work even when internet is poor or unavailable.

## Main Goal

The app should still allow users to:

- view songs
- view lyrics
- view beats
- view keyboard information
- search saved songs
- use Lyrics Mode during singing

## Best First Offline Feature

Start with read-only offline mode.

This means the app can show the last saved copy of songs, lyrics, keyboards, and app title, but editing will still require internet at first.

Status:

Implemented as a foundation. The app currently keeps read-only cached library data available locally after online use.

## Why Read-Only First

Offline editing is more difficult because it needs:

- sync queues
- conflict handling
- retry logic
- upload recovery
- clear sync status

So it should come later.

## Recommended Storage

Use IndexedDB for saved local data.

Possible cached data:

- songs
- lyrics
- styles
- keyboards
- default keyboard

## Basic PWA Support

The app can expose install metadata using:

- web manifest
- service worker
- offline fallback
- cached app shell

This does not mean audio or edits are available offline.

Current app name and install metadata use `Music Manager`.

## Future Audio Offline Support

Audio files can become large, so do not cache all audio automatically.

Better approach:

- user marks selected songs as available offline
- only selected audio files are cached
- show cache size/status

## Future Files

Possible future structure:

src/services/offlineCacheService.js
src/services/syncQueueService.js
src/hooks/useOnlineStatus.js
src/components/OfflineBanner.jsx
src/components/SyncStatus.jsx

## Roadmap Relationship

v1.1.0: lyrics support should be cache-friendly.
v1.2.0: audio support should be designed for optional future offline caching.
v2.0.0+: offline and PWA support can become a major release.

## Important Rule

Do not start with offline editing.
Start with safe read-only offline viewing first.

Current status:

- Read-only cache for songs, lyrics, keyboards, and app title is implemented using browser storage.
- Offline audio caching is not implemented.
- Offline save and later synchronization is not implemented.
- Android install metadata is a separate step from full offline capability.
