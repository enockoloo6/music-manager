import { APP_RELEASE_NAME, APP_VERSION } from '../appVersion';

function VersionBadge({ variant = 'header' }) {
  const isSettings = variant === 'settings';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSettings ? '4px 8px' : '2px 6px',
        borderRadius: '999px',
        background: isSettings ? '#eef4f8' : 'rgba(255,255,255,0.08)',
        color: isSettings ? '#315a78' : '#fff',
        fontSize: isSettings ? '0.75rem' : '0.62rem',
        fontWeight: 600,
        border: isSettings ? '1px solid #d5e2ea' : '1px solid rgba(255,255,255,0.12)',
        opacity: isSettings ? 1 : 0.78
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
