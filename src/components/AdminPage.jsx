function AdminPage({
  profiles = [],
  isSuperAdmin,
  onToggleStatus
}) {
  return (
    <section className="panel no-print" style={{ borderLeft: '4px solid #c62828', marginBottom: '18px' }}>
      <h2 style={{ margin: '0 0 8px', color: '#b71c1c', fontSize: '1.05rem' }}>
        Admin
      </h2>

      <p style={{ fontSize: '0.81rem', color: '#666', margin: '0 0 12px' }}>
        <strong>Approve</strong> lets a user add and edit. <strong>Make Admin</strong> grants user management.
      </p>

      {profiles.length === 0 && (
        <p style={{ color: '#aaa', fontSize: '0.88rem' }}>
          No user profiles found.
        </p>
      )}

      {profiles.map(profile => {
        const protectedUser = isSuperAdmin?.(profile.email);
        const statusText = profile.is_admin
          ? 'Admin'
          : profile.is_approved
            ? 'Approved'
            : 'Pending';

        return (
          <div
            key={profile.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '9px 0',
              borderBottom: '1px solid #fbe9e7',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <span style={{ fontSize: '0.88rem' }}>{profile.email}</span>
              {protectedUser ? (
                <span style={{ marginLeft: 8, fontSize: '0.68rem', background: '#b71c1c', color: 'white', padding: '2px 7px', borderRadius: 10 }}>
                  PROTECTED
                </span>
              ) : (
                <span style={{ marginLeft: 8, fontSize: '0.68rem', color: '#999' }}>
                  {statusText}
                </span>
              )}
            </div>

            {!protectedUser && (
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  type="button"
                  onClick={() => onToggleStatus?.(profile.id, 'is_approved', profile.is_approved)}
                  style={{ fontSize: '0.72rem', background: profile.is_approved ? '#ef6c00' : '#2e7d32', color: 'white', padding: '4px 10px' }}
                >
                  {profile.is_approved ? 'Revoke' : 'Approve'}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleStatus?.(profile.id, 'is_admin', profile.is_admin)}
                  style={{ fontSize: '0.72rem', background: profile.is_admin ? '#455a64' : '#4527a0', color: 'white', padding: '4px 10px' }}
                >
                  {profile.is_admin ? 'Remove Admin' : 'Make Admin'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default AdminPage;
