function SettingsPage({
  defaultKeyboardId = '',
  keyboards = [],
  onDefaultKeyboardChange
}) {
  return (
    <section className="panel no-print" style={{ borderTop: '4px solid #1a237e' }}>
      <h2 style={{ margin: '0 0 16px', color: '#1a237e', fontSize: '1.05rem' }}>
        Settings
      </h2>

      <div style={{ display: 'grid', gap: '14px' }}>
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
      </div>
    </section>
  );
}

export default SettingsPage;
