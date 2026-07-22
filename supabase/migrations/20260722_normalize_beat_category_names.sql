-- Normalize common beat/category spellings across Library and Consecration.
-- This only touches beat/category fields, not song names, lyrics, or audio data.

update music_manager.styles
set keyboard_location = cleanup.canonical_name
from (
  values
    ('Country Waltz', 'counteywaltz'),
    ('Country Waltz', 'countrywaltz'),
    ('Country Waltz', 'countrywaltztempo53'),
    ('Country Waltz', 'countrywaltz53'),
    ('16 Beat', '16beat'),
    ('16 Beat', '16beats'),
    ('Christmas Waltz', 'christmaswaltz'),
    ('Midnight Swing', 'midnightswing'),
    ('Happy Reggae', 'happyreggae'),
    ('SWING & JAZZ', 'swingjazz'),
    ('POP & ROCK', 'poprock')
) as cleanup(canonical_name, normalized_alias)
where keyboard_location is not null
  and regexp_replace(lower(keyboard_location), '[^a-z0-9]+', '', 'g') = cleanup.normalized_alias;

update music_manager.styles
set beat_name = cleanup.canonical_name
from (
  values
    ('Country Waltz', 'counteywaltz'),
    ('Country Waltz', 'countrywaltz'),
    ('Country Waltz', 'countrywaltztempo53'),
    ('Country Waltz', 'countrywaltz53'),
    ('16 Beat', '16beat'),
    ('16 Beat', '16beats'),
    ('Christmas Waltz', 'christmaswaltz'),
    ('Midnight Swing', 'midnightswing'),
    ('Happy Reggae', 'happyreggae'),
    ('SWING & JAZZ', 'swingjazz'),
    ('POP & ROCK', 'poprock')
) as cleanup(canonical_name, normalized_alias)
where beat_name is not null
  and regexp_replace(lower(beat_name), '[^a-z0-9]+', '', 'g') = cleanup.normalized_alias;

update music_manager.consecration_beat_groups
set beat_category = cleanup.canonical_name
from (
  values
    ('Country Waltz', 'counteywaltz'),
    ('Country Waltz', 'countrywaltz'),
    ('Country Waltz', 'countrywaltztempo53'),
    ('Country Waltz', 'countrywaltz53'),
    ('16 Beat', '16beat'),
    ('16 Beat', '16beats'),
    ('Christmas Waltz', 'christmaswaltz'),
    ('Midnight Swing', 'midnightswing'),
    ('Happy Reggae', 'happyreggae'),
    ('SWING & JAZZ', 'swingjazz'),
    ('POP & ROCK', 'poprock')
) as cleanup(canonical_name, normalized_alias)
where beat_category is not null
  and regexp_replace(lower(beat_category), '[^a-z0-9]+', '', 'g') = cleanup.normalized_alias;

update music_manager.consecration_beat_groups
set beat_name = cleanup.canonical_name
from (
  values
    ('Country Waltz', 'counteywaltz'),
    ('Country Waltz', 'countrywaltz'),
    ('Country Waltz', 'countrywaltztempo53'),
    ('Country Waltz', 'countrywaltz53'),
    ('16 Beat', '16beat'),
    ('16 Beat', '16beats'),
    ('Christmas Waltz', 'christmaswaltz'),
    ('Midnight Swing', 'midnightswing'),
    ('Happy Reggae', 'happyreggae'),
    ('SWING & JAZZ', 'swingjazz'),
    ('POP & ROCK', 'poprock')
) as cleanup(canonical_name, normalized_alias)
where beat_name is not null
  and regexp_replace(lower(beat_name), '[^a-z0-9]+', '', 'g') = cleanup.normalized_alias;

notify pgrst, 'reload schema';
