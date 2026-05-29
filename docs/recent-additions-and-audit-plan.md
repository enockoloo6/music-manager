# Recent Additions and Admin Audit Plan

## Purpose

Add a simple way to see what was added recently, and later allow admins to see who added each item.

This was requested during the v1.1.0 Lyrics Release Candidate work.

---

## Feature 1: Latest Added Songs / Beats

### Goal

Show the most recent additions in the app, preferably the latest 5.

### Recommended RC1-safe approach

Use the existing `music_manager.styles.created_at` field to show recent beat/song additions without creating a new migration.

This can be displayed as a small panel near the search bar, for example:

```text
Recently Added
1. Song Name — Beat Name — Keyboard — Added date
2. Song Name — Beat Name — Keyboard — Added date
...
```

### Why this is safe

The current documented schema already has:

```sql
music_manager.styles.created_at timestamptz default now()
```

So the app can derive recent additions by flattening songs and styles, sorting styles by `created_at` descending, and taking the first 5.

### Suggested UI behavior

- Show latest 5 additions.
- Keep it compact.
- Hide it from print view using `no-print`.
- For normal users, show song name, beat name, keyboard, and date.
- For admins, eventually also show who added it after audit fields exist.

---

## Feature 2: Admin Can See Who Added It

### Current status

Not fully supported by the current schema.

Current `songs` table does not store:

```sql
created_by
created_at
```

Current `styles` table has:

```sql
created_at
```

but does not store:

```sql
created_by
```

Therefore, the app can show when a beat/style was added, but cannot reliably show who added it yet.

---

## Recommended Future Migration

When ready, add audit fields to `music_manager.styles` first because beat/style additions are the main user action today.

Suggested migration:

```sql
alter table music_manager.styles
add column if not exists created_by uuid references auth.users(id),
add column if not exists updated_by uuid references auth.users(id),
add column if not exists updated_at timestamptz;

comment on column music_manager.styles.created_by is
'User who added this beat/style entry.';

comment on column music_manager.styles.updated_by is
'Last user who edited this beat/style entry.';

comment on column music_manager.styles.updated_at is
'Last time this beat/style entry was edited.';

notify pgrst, 'reload schema';
```

Optional later addition for song-level tracking:

```sql
alter table music_manager.songs
add column if not exists created_at timestamptz default now(),
add column if not exists created_by uuid references auth.users(id),
add column if not exists updated_by uuid references auth.users(id),
add column if not exists updated_at timestamptz;

notify pgrst, 'reload schema';
```

---

## App Changes Needed Later

When audit fields are added:

1. On add beat, insert:

```js
created_by: user.id
```

2. On edit beat, update:

```js
updated_by: user.id,
updated_at: new Date().toISOString()
```

3. Fetch profile emails for admins only, or create an admin-safe RPC/view to show creator email.

4. In the Recent Additions panel, show creator information only for admins.

---

## Important

Do not create this migration during the lyrics RC1 checkpoint unless the release scope is expanded.

For RC1, prefer the no-migration recent additions panel using `styles.created_at`.
