import React from 'react';

function AudioPlaceholder() {
  return (
    <div className="audio-placeholder">
      <div className="audio-placeholder__title">
        🎧 Audio Support Coming Soon
      </div>

      <div className="audio-placeholder__body">
        Future versions will support:
      </div>

      <ul>
        <li>song recordings</li>
        <li>practice tracks</li>
        <li>instrumental versions</li>
        <li>audio playback in Lyrics Mode</li>
      </ul>
    </div>
  );
}

export default AudioPlaceholder;
