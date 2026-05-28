import React from 'react';
import { APP_RELEASE_NAME, APP_VERSION } from '../appVersion';

function VersionBadge() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.12)',
        color: '#fff',
        fontSize: '0.78rem',
        fontWeight: 700,
        border: '1px solid rgba(255,255,255,0.18)'
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
