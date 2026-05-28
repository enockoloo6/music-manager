# Offline Plan

Future target release: v2.0.0 or later.

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

This means the app can show the last saved copy of songs and lyrics, but editing will still require internet at first.

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

## Future PWA Support

Later the app can become installable using:

- web manifest
- service worker
- offline fallback
- cached app shell

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
