function AdminPage({
  profiles = [],
  isSuperAdmin,
  onToggleStatus
}) {
  return (
    <section className="panel no-print" style={{ borderLeft: '4px solid #315a78', marginBottom: '18px' }}>
      <h2 style={{ margin: '0 0 8px', color: '#102f4a', fontSize: '1.05rem' }}>
        Admin
      </h2>

      <p style={{ fontSize: '0.81rem', color: '#666', margin: '0 0 12px' }}>
        <strong>Approve</strong> lets a user add and edit. <strong>Make Admin</strong> grants user management.
        Revoke and admin changes are sensitive actions. The protected account cannot be demoted or removed here.
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
              borderBottom: '1px solid #e8eef4',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <span style={{ fontSize: '0.88rem' }}>{profile.email}</span>
              {protectedUser ? (
                <>
                  <span style={{ marginLeft: 8, fontSize: '0.68rem', background: '#c8e4f3', color: '#102f4a', padding: '2px 7px', borderRadius: 10, fontWeight: 900 }}>
                    PROTECTED
                  </span>
                </>
              ) : (
                <span style={{ marginLeft: 8, fontSize: '0.68rem', color: '#999' }}>
                  {statusText}
                </span>
              )}
            </div>

            {!protectedUser && (
              <div className="admin-user-actions">
                <button
                  type="button"
                  onClick={() => onToggleStatus?.(profile.id, 'is_approved', profile.is_approved)}
                  className={profile.is_approved ? 'admin-user-actions__button admin-user-actions__button--danger' : 'admin-user-actions__button admin-user-actions__button--approve'}
                  title={profile.is_approved ? 'Remove this user access to add and edit songs' : 'Allow this user to add and edit songs'}
                >
                  {profile.is_approved ? 'Revoke' : 'Approve'}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleStatus?.(profile.id, 'is_admin', profile.is_admin)}
                  className={profile.is_admin ? 'admin-user-actions__button admin-user-actions__button--danger' : 'admin-user-actions__button admin-user-actions__button--admin'}
                  title={profile.is_admin ? 'Remove user management powers from this user' : 'Grant user management powers to this user'}
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
