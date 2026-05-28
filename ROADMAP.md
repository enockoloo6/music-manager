# Music Manager Roadmap

This document is the main reference for the Music Manager project. It records what is already done, what is in progress, what is pending, and how future versions should be planned.

---

## Repository

GitHub repository:

```text
enockoloo6/music-manager
```

---

## Branch Workflow

### Production Branch

```bash
main
```

- Auto-deploys to Netlify production.
- Should only receive stable, tested changes.

### Active Development Branch

```bash
eoloo
```

- All development should happen here first.
- This is the safe working branch.

### Recommended Future Branch

```bash
staging
```

Purpose:

- test before production
- confirm database changes
- verify UI and admin flows
- avoid pushing untested work directly to `main`

Recommended flow:

```text
feature branch -> eoloo -> staging -> main -> release tag
```

---

## Current Stack

- React + Vite frontend
- Supabase backend
- Supabase Auth using shared `auth.users`
- Netlify deployment

---

## Database Architecture

### Dedicated App Schema

Status: Done

Music Manager uses its own Supabase schema:

```sql
music_manager
```

This isolates it from other apps using the same Supabase project, especially `nyumba-yangu`.

### Frontend Schema Configuration

File:

```text
src/supabaseClient.js
```

The frontend uses:

```js
db: { schema: 'music_manager' }
```

### Shared Auth

Supabase Auth remains shared globally:

```sql
auth.users
```

Music Manager app roles and permissions are stored in:

```sql
music_manager.profiles
```

---

## Current Tables

Inside `music_manager` schema:

- `keyboards`
- `songs`
- `styles`
- `profiles`

Relationships were recreated manually after migration.

---

## Required RPC Functions

The following functions exist inside the `music_manager` schema.

### `get_all_profiles()`

Used by the admin panel to load user profiles.

### `admin_update_profile()`

Used for:

- approving users
- granting admin access
- protecting the super admin account

---

## Protected Super Admin

Protected account:

```text
enockoloo6@gmail.com
```

Rules:

- cannot be demoted through admin controls
- should remain protected at RPC/database level

---

## Supabase Configuration Notes

In Supabase:

```text
Project Settings -> Data API -> Exposed Schemas
```

Must include:

```text
music_manager
```

If missing, the app may show:

```text
Invalid schema: music_manager
```

After schema or function changes, run:

```sql
notify pgrst, 'reload schema';
```

---

# Project Status

## Done

### Authentication

- login
- signup
- logout
- shared Supabase Auth

### User/Admin System

- admin approval system
- admin promotion
- protected super admin
- role handling through `music_manager.profiles`

### Song and Beat Management

- song loading
- add/edit beats
- existing song functionality working

### Keyboard and Style Management

- keyboard loading
- styles loading
- default keyboard support

### Schema Migration

- moved app data from shared `public` schema to dedicated `music_manager` schema
- updated frontend Supabase client to use `music_manager`
- recreated required relationships
- created required RPC functions

### README

README updated on branch `eoloo` with:

- schema migration information
- RPC setup
- branch workflow
- troubleshooting
- architecture notes
- setup checklist

Reference commit:

```text
979f80c2556f6b71c944cebe3d7e2559c1d5d545
```

---

# In Progress

## Roadmap and Version Planning

Status: In progress

Purpose:

- make project direction clear
- allow easy resumption later
- track done, pending, and active work
- support proper release/version planning

---

# Pending / Planned Features

## 1. Lyrics Support

Status: Planned

Goal:

Allow users to paste and save song lyrics together with existing song details.

### Planned Capabilities

- paste lyrics into a song
- edit saved lyrics
- view lyrics clearly during singing
- search songs by lyrics later

### Suggested Database Change

Add to `music_manager.songs`:

```sql
lyrics text
```

Optional future fields:

```sql
notes text
composer text
tempo integer
song_key text
```

### Planned UI

Add a lyrics area in the song form.

Add a dedicated lyrics viewing mode with:

- large readable text
- mobile-friendly layout
- dark worship/performance view
- simple navigation back to song list

---

## 2. Lyrics Mode / Singing View

Status: Planned

Goal:

Make lyrics easy to read while singing.

### Planned Features

- full-screen or near full-screen lyrics view
- large font
- high contrast
- optional font size controls
- optional auto-scroll later
- minimal buttons during performance

Possible label:

```text
Lyrics Mode
```

or:

```text
Singing Mode
```

---

## 3. Audio Recording and Playback

Status: Planned

Goal:

Allow audio to be saved with songs and played when needed.

Use cases:

- choir practice recordings
- keyboard demonstrations
- reference singing
- live recordings
- instrumental guides

### Storage Decision

Audio files should not be stored directly in PostgreSQL.

Use:

```text
Supabase Storage
```

Recommended bucket:

```text
music-manager-audio
```

The database should store only:

- file path
- file name
- public/signed URL reference
- metadata

### Recommended Table

Create a separate table:

```sql
music_manager.song_audio
```

Suggested columns:

```sql
id uuid primary key default gen_random_uuid(),
song_id uuid references music_manager.songs(id) on delete cascade,
file_path text not null,
file_name text,
duration_seconds integer,
uploaded_by uuid references auth.users(id),
created_at timestamptz default now()
```

### Planned UI

- upload/select audio file
- play audio inside song details
- show audio file name
- allow replacing/removing audio later
- support multiple recordings per song later

---

## 4. App Versioning

Status: Planned

Goal:

Allow clear tracking of app versions and make it possible to choose/install/use known stable versions.

### Recommended Versioning

Use semantic versioning:

```text
v1.0.0
v1.1.0
v1.2.0
```

Meaning:

- patch: `v1.0.1` for bug fixes
- minor: `v1.1.0` for new features
- major: `v2.0.0` for big/breaking changes

### Recommended Git Flow

```text
eoloo -> staging -> main -> git tag -> GitHub release
```

Example:

```bash
git tag v1.1.0
git push origin v1.1.0
```

### Planned Version Display

Add app version somewhere visible, for example:

- footer
- admin page
- about/settings page

Suggested source:

```text
package.json version
```

---

# Suggested Release Plan

## v1.0.0

Current stable foundation.

Includes:

- login/signup
- song loading
- keyboard loading
- add/edit beats
- admin approval
- admin promotion
- default keyboard
- protected super admin
- isolated `music_manager` schema

## v1.1.0

Planned lyrics release.

Includes:

- lyrics field
- paste/edit lyrics
- lyrics view mode
- mobile readable singing view

## v1.2.0

Planned audio release.

Includes:

- Supabase Storage audio bucket
- audio upload
- audio playback
- `song_audio` table

## v1.3.0

Possible usability release.

May include:

- improved mobile responsiveness
- loading states
- error states
- better admin UI
- search/filter improvements

## v2.0.0

Possible major refactor release.

May include:

- split `App.jsx`
- modular architecture
- routing
- services layer
- hooks
- stronger styling system
- possible PWA/offline support

---

# Technical Debt

## Main Issue

Most logic currently lives in:

```text
src/App.jsx
```

This should be gradually refactored.

## Target Structure

```text
src/
  components/
  pages/
  hooks/
  services/
  styles/
  utils/
```

## Recommended Refactor Order

1. Extract Supabase service functions
2. Extract reusable components
3. Extract admin page logic
4. Extract song form/list/detail components
5. Add routing if needed
6. Improve styling structure

---

# Future Ideas

## Search and Filter

- search by song title
- search by lyrics
- filter by keyboard
- filter by style

## Worship Session / Setlist Mode

- create setlists
- order songs for service
- next/previous song navigation
- lyrics mode per setlist

## Import / Export

- export songs as JSON
- import songs from backup
- backup lyrics/audio metadata

## Backup Tools

- database backup notes
- Supabase export process
- storage backup process

## Mobile Improvements

- better phone layout
- large touch buttons
- performance mode

## Offline / PWA

Possible future major feature:

- installable app
- cached lyrics
- offline viewing

---

# Immediate Next Steps

1. Keep all work on `eoloo`.
2. Add lyrics support first.
3. Add lyrics viewing/singing mode.
4. Add app version display.
5. Add audio upload/playback after lyrics are stable.
6. Start tagging stable releases from `main`.

---

# Development Rule

Do not push experimental changes directly to `main`.

All work should begin on:

```bash
git checkout eoloo
```
