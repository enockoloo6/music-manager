# Refactor Progress

This file tracks the gradual extraction of logic from App.jsx.

---

# Current State

The original app started with nearly all logic inside:

src/App.jsx

This made:

- scaling difficult
- debugging harder
- future features risky

---

# Extraction Progress

## Completed

### Components

- LyricsMode.jsx
- LyricsEditor.jsx
- VersionBadge.jsx

### Services

- songLyricsService.js

### Styles

- lyricsMode.css
- lyricsEditor.css

---

# Planned Extractions

## SongCard

Will handle:

- song display
- beat listing
- lyrics button
- audio button

## SongForm

Will handle:

- add/edit song flows
- lyrics integration
- future audio upload hooks

## AdminPanel

Will isolate:

- approvals
- admin promotion
- protected admin logic

## SearchBar

Will later support:

- lyrics search
- keyboard filters
- style filters

---

# Refactor Strategy

The refactor is intentionally gradual.

Priority is:

1. keep production stable
2. avoid breaking admin flows
3. avoid breaking beat editing
4. introduce modularity safely

---

# Future Direction

Target structure:

src/
  components/
  pages/
  hooks/
  services/
  styles/
  utils/
