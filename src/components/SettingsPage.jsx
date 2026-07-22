import VersionBadge from './VersionBadge';

function SettingsPage({
  appTitle = 'Music Manager',
  defaultKeyboardId = '',
  keyboards = [],
  isAdmin = false,
  savingAppTitle = false,
  onAppTitleChange,
  onDefaultKeyboardChange,
  logoutTimeoutMinutes = 30,
  onLogoutTimeoutChange,
  autoCollapseConsecrationSubgroups = true,
  onAutoCollapseConsecrationSubgroupsChange
}) {
  return (
    <section className="panel no-print" style={{ borderTop: '4px solid #1a237e' }}>
      <h2 style={{ margin: '0 0 16px', color: '#1a237e', fontSize: '1.05rem' }}>
        Settings
      </h2>

      <div style={{ display: 'grid', gap: '14px' }}>
        {isAdmin && (
          <form
            onSubmit={event => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              onAppTitleChange?.(String(formData.get('appTitle') || ''));
            }}
            style={{ display: 'grid', gap: '8px' }}
          >
            <div>
              <label>App Name</label>
              <input
                name="appTitle"
                defaultValue={appTitle}
                placeholder="Music Manager"
              />
            </div>

            <button
              type="submit"
              disabled={savingAppTitle}
              style={{ width: 'fit-content', background: '#315a78', color: '#fff', padding: '8px 13px' }}
            >
              {savingAppTitle ? 'Saving...' : 'Save App Name'}
            </button>
          </form>
        )}

        <div>
          <label>Default Keyboard</label>
          <select
            value={defaultKeyboardId}
            onChange={e => onDefaultKeyboardChange?.(e.target.value)}
          >
            <option value="">No default keyboard</option>
            {keyboards.map(keyboard => (
              <option key={keyboard.id} value={keyboard.id}>
                {keyboard.model_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Log Out After Inactivity</label>
          <select
            value={logoutTimeoutMinutes}
            onChange={e => onLogoutTimeoutChange?.(e.target.value)}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={240}>4 hours</option>
          </select>
        </div>

        <div>
          <label>Consecration Display</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', letterSpacing: 0 }}>
            <input
              type="checkbox"
              checked={Boolean(autoCollapseConsecrationSubgroups)}
              onChange={event => onAutoCollapseConsecrationSubgroupsChange?.(event.target.checked)}
              style={{ width: 'auto' }}
            />
            Auto-collapse non-highlighted subgroups inside a highlighted group
          </label>
        </div>

        <div>
          <label>App Version</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <VersionBadge variant="settings" />
          </div>
        </div>

        <div className="settings-capabilities">
          <span className="settings-capabilities__eyebrow">Online and Offline</span>
          <p>
            When online, the app syncs songs, lyrics, beats, keyboards, categories, presentation history, and audio links.
            After access, songs and lyrics remain available offline, and audio can play offline once it has been saved on this device.
          </p>
          <p>
            On Wi-Fi, offline audio can be saved without a data warning. On mobile data or unknown networks, the app shows the estimated audio size before saving.
          </p>
          <p>
            Adding or editing songs, lyrics, beats, audio, users, and presentation details still requires internet.
          </p>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;
