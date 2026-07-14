import React from 'react';
import { APP_RELEASE_NAME, APP_VERSION } from '../appVersion';

function VersionBadge() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 6px',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        fontSize: '0.62rem',
        fontWeight: 600,
        border: '1px solid rgba(255,255,255,0.12)',
        opacity: 0.78
      }}
    >
      <span>{APP_VERSION}</span>
      <span style={{ opacity: 0.75 }}>
        {APP_RELEASE_NAME}
      </span>
    </div>
  );
}

export default VersionBadge;
