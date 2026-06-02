# v1.3.0 – Audio Upload & Playback

Status: Implemented and manually verified

## Added

### Audio Attachments

Songs can now have one or more audio attachments.

Implemented components:

* `src/components/AudioAttachments.jsx`
* `src/services/songAudioService.js`
* `src/styles/audioAttachments.css`

### Audio Storage

Supabase Storage bucket:

* `music-manager-audio`

Bucket configuration:

* Private bucket
* Signed URLs used for playback
* Authenticated upload
* Authenticated read
* Authenticated delete

### Audio Metadata

New table:

```sql
music_manager.song_audio
```

Stores:

* song_id
* storage_path
* file_name
* mime_type
* size_bytes
* created_by
* created_at

### Song Integration

Audio attachments are displayed directly inside each SongCard.

Users can:

* Upload audio files
* Play audio files
* Delete audio files

### Permissions

Audio management follows existing approval rules.

Approved users can:

* Upload audio
* Delete audio

All authenticated users with access can play audio through signed URLs.

## Manual Verification Completed

Verified:

* Audio upload
* Audio retrieval
* Audio playback
* Audio deletion
* Signed URL generation
* Supabase Storage integration
* song_audio database integration

## Pending

Future enhancement:

### v1.4.0

Microphone Recording

Planned features:

* Start Recording
* Stop Recording
* Browser microphone permission
* MediaRecorder integration
* Automatic upload of recordings
* Playback of recorded audio

