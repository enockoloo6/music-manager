# Song vs Performance Session Model

Future architecture note.

## Observation

A song in the library is not always performed the same way.

Example:

Amazing Grace

One service:
- Key: G
- Tempo: 72
- Keyboard: PSR SX900

Another service:
- Key: A
- Tempo: 80
- Keyboard: Genos

## Proposed Separation

### Song

Permanent library item.

Stores:
- title
- lyrics
- audio references
- default information

### Performance Session Entry

Service-specific information.

Stores:
- song reference
- service key
- service tempo
- assigned keyboard
- musician notes
- worship leader notes

## Benefits

- one song can appear in many services
- different keys per service
- different tempos per service
- preserves history

## Future Relationship

Setlists will eventually contain performance session entries rather than raw songs.

This gives maximum flexibility without duplicating songs.
