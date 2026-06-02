# Music Manager Roadmap

## Repository

```text
enockoloo6/music-manager
```

Active development branch:

```text
eoloo
```

The repository is the source of truth.

---

# Current Repository Reality

The application is already running on the integrated architecture.

Verified from code:

- App.jsx exports AppIntegrated
- Lyrics editor exists
- Lyrics search exists
- Presentation mode exists
- Print mode exists
- Category Quick Filters exist
- Library statistics dashboard exists
- Recently Added panel exists
- Offline banner exists
- Version badge exists
- Default keyboard support exists
- Admin approval exists
- Admin promotion exists
- Protected super admin exists

---

# Current Release Status

## v1.0 Foundation

Completed.

Includes:

- authentication
- admin approval workflow
- admin promotion workflow
- protected super admin
- keyboard management
- song and beat management
- dedicated music_manager schema
- RPC administration functions

---

## v1.1 Lyrics and Presentation

Completed.

Includes:

- lyrics storage
- lyrics editing
- lyrics search
- presentation mode
- font size controls
- printable lyrics output

Print isolation fix:

```text
6435b8042c5e4dfe7fedbd121738c50faef06847
```

---

## v1.2 Category Quick Filters

Implemented in code.

Current status:

```text
Awaiting manual verification before milestone closure.
```

Verified implementation:

- CategoryFilters component exists
- categoryFilters.css exists
- selectedCategory state exists
- categories derived from styles.keyboard_location
- category filter combines with search
- All category option exists

Verification still required:

- browser testing
- mobile testing
- regression testing

---

# Current Priority

Before new feature development:

1. Verify Category Quick Filters.
2. Verify lyrics print isolation.
3. Close v1.2.0 only after successful verification.

---

# Next Planned Feature

## Audio Recording and Playback

Status:

```text
Planned
```

Potential implementation:

- song_audio table
- Supabase Storage bucket
- upload interface
- playback interface
- song recording attachments

Suggested bucket:

```text
music-manager-audio
```

Suggested table:

```text
music_manager.song_audio
```

This feature has not yet been implemented.

---

# Future Enhancements

## Search Improvements

Possible future work:

- keyboard-only filters
- advanced filtering
- saved searches

## Setlist / Worship Mode

Possible future work:

- service setlists
- ordered song flow
- next song navigation
- lyrics linked to setlists

## Import / Export

Possible future work:

- JSON export
- JSON import
- backup tools

## Mobile Improvements

Possible future work:

- larger touch targets
- improved responsive layouts
- performance mode controls

## Offline / PWA

Possible future work:

- installable application
- cached lyrics
- offline viewing

---

# Technical Debt

Current major technical debt:

Most application logic still resides inside:

```text
src/AppIntegrated.jsx
```

Target direction:

```text
src/
  components/
  pages/
  hooks/
  services/
  styles/
```

Recommended future refactor:

1. move business logic into services
2. move reusable logic into hooks
3. reduce AppIntegrated size
4. create page-level structure
5. introduce routing when justified

---

# Documentation Rule

Documentation is part of the product.

Whenever a milestone is completed:

- update START_HERE_MUSIC_MANAGER.md
- update docs/project-state.md
- update docs/resume-guide.md
- update docs/checkpoints.md
- update docs/app-integration-switch.md
- update docs/changelog.md
- update ROADMAP.md

---

# Immediate Next Steps

1. Run Category Quick Filters verification.
2. Run lyrics print isolation regression verification.
3. Run broader regression testing.
4. Close v1.2.0 if verification passes.
