function formatLogDate(value) {
  if (!value) return 'Unknown time';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function actionLabel(actionType) {
  return String(actionType || '')
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Action';
}

function LogTrailPage({ logs = [], loading = false, saving = false, canClear = false, onClearLogs }) {
  return (
    <section className="panel no-print" style={{ borderLeft: '4px solid #315a78', marginBottom: '18px' }}>
      <div className="log-trail__header">
        <h2 style={{ margin: '0 0 8px', color: '#102f4a', fontSize: '1.05rem' }}>
          Log Trail
        </h2>

        {canClear && (
          <button type="button" onClick={onClearLogs} disabled={saving || loading}>
            {saving ? 'Clearing...' : 'Clear Log Trail'}
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.81rem', color: '#666', margin: '0 0 12px' }}>
        Delete, edit, suggestion, and log cleanup actions are recorded with the user who performed them.
      </p>

      {loading && (
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Loading log trail...
        </p>
      )}

      {!loading && logs.length === 0 && (
        <p style={{ color: '#aaa', fontSize: '0.88rem' }}>
          No edit or delete actions have been logged yet.
        </p>
      )}

      {!loading && logs.length > 0 && (
        <div className="log-trail">
          {logs.map(log => (
            <article key={log.id} className="log-trail__item">
              <div>
                <span className={`log-trail__badge log-trail__badge--${String(log.action_type || '').includes('delete') ? 'delete' : 'edit'}`}>
                  {actionLabel(log.action_type)}
                </span>
                <strong>{log.target_label || `${log.target_table || 'record'} #${log.target_id || ''}`}</strong>
                <span>{log.actor_email || 'Unknown user'}</span>
              </div>

              <time dateTime={log.created_at}>{formatLogDate(log.created_at)}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default LogTrailPage;
