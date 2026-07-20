function AdminPage({
  profiles = [],
  isSuperAdmin,
  currentUserId,
  canManageSuperAdmins = false,
  canManageProtectedUsers = false,
  onToggleStatus,
  onToggleActionPermission
}) {
  return (
    <section className="panel no-print" style={{ borderLeft: '4px solid #315a78', marginBottom: '18px' }}>
      <h2 style={{ margin: '0 0 8px', color: '#102f4a', fontSize: '1.05rem' }}>
        {canManageSuperAdmins ? 'Super Admin' : 'Admin'}
      </h2>

      <p style={{ fontSize: '0.81rem', color: '#666', margin: '0 0 12px' }}>
        You are using super admin access. Protected users keep full access and cannot be restricted by other super admins.
        Approve, edit, delete, admin, super admin, and protected access can be managed here for other users.
      </p>

      {profiles.length === 0 && (
        <p style={{ color: '#aaa', fontSize: '0.88rem' }}>
          No user profiles found.
        </p>
      )}

      {profiles.map(profile => {
        const protectedUser = isSuperAdmin?.(profile.email) || profile.is_protected;
        const protectedOwner = isSuperAdmin?.(profile.email);
        const isCurrentUser = currentUserId === profile.id;
        const canChangeUser = !protectedUser;
        const canRemoveProtected = canManageProtectedUsers && protectedUser && !protectedOwner && !isCurrentUser;
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
              <span style={{ marginLeft: 8, fontSize: '0.68rem', color: '#999' }}>
                {statusText}
              </span>
              {profile.is_super_admin && (
                <span style={{ marginLeft: 8, fontSize: '0.68rem', background: '#c8e4f3', color: '#102f4a', padding: '2px 7px', borderRadius: 10, fontWeight: 900 }}>
                  SUPER ADMIN
                </span>
              )}
              {protectedUser && (
                <span style={{ marginLeft: 8, fontSize: '0.68rem', background: '#e8eef4', color: '#315a78', padding: '2px 7px', borderRadius: 10, fontWeight: 900 }}>
                  PROTECTED
                </span>
              )}
            </div>

            {canChangeUser && (
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

                {canManageSuperAdmins && (
                  <>
                    {canManageProtectedUsers && (
                      <label className="admin-user-actions__check" title="Protected users keep full access and cannot be restricted by other super admins">
                        <input
                          type="checkbox"
                          checked={Boolean(profile.is_protected || protectedOwner)}
                          disabled={protectedUser}
                          onChange={() => onToggleActionPermission?.(profile.id, 'is_protected', profile.is_protected)}
                        />
                        Protected
                      </label>
                    )}

                    {canManageProtectedUsers && (
                      <label className="admin-user-actions__check" title="Allow this user to add or remove protected status for other users">
                        <input
                          type="checkbox"
                          checked={Boolean(profile.can_manage_protected_users)}
                          onChange={() => onToggleActionPermission?.(profile.id, 'can_manage_protected_users', profile.can_manage_protected_users)}
                        />
                        Manage Protected
                      </label>
                    )}

                    <button
                      type="button"
                      onClick={() => onToggleActionPermission?.(profile.id, 'can_edit_songs', profile.can_edit_songs)}
                      className={profile.can_edit_songs ? 'admin-user-actions__button admin-user-actions__button--danger' : 'admin-user-actions__button admin-user-actions__button--approve'}
                      title={profile.can_edit_songs ? 'Remove song edit permission' : 'Allow this user to edit songs and beat settings'}
                    >
                      {profile.can_edit_songs ? 'Remove Edit' : 'Allow Edit'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleActionPermission?.(profile.id, 'can_delete_songs', profile.can_delete_songs)}
                      className={profile.can_delete_songs ? 'admin-user-actions__button admin-user-actions__button--danger' : 'admin-user-actions__button admin-user-actions__button--admin'}
                      title={profile.can_delete_songs ? 'Remove delete permission' : 'Allow this user to delete songs and beat settings'}
                    >
                      {profile.can_delete_songs ? 'Remove Delete' : 'Allow Delete'}
                    </button>

                    {!protectedUser && (
                      <button
                        type="button"
                        onClick={() => onToggleActionPermission?.(profile.id, 'is_super_admin', profile.is_super_admin)}
                        className={profile.is_super_admin ? 'admin-user-actions__button admin-user-actions__button--danger' : 'admin-user-actions__button admin-user-actions__button--admin'}
                        title={profile.is_super_admin ? 'Remove super admin role' : 'Grant super admin role'}
                        disabled={isCurrentUser && profile.is_super_admin}
                      >
                        {profile.is_super_admin ? 'Remove Super Admin' : 'Make Super Admin'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {protectedUser && (
              <div className="admin-user-actions">
                {canRemoveProtected && (
                  <button
                    type="button"
                    onClick={() => onToggleActionPermission?.(profile.id, 'is_protected', profile.is_protected)}
                    className="admin-user-actions__button admin-user-actions__button--danger"
                    title="Remove protected status from this user"
                  >
                    Remove Protected
                  </button>
                )}

                <span style={{ color: '#315a78', fontSize: '0.78rem', fontWeight: 800 }}>
                  Full access locked
                </span>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default AdminPage;
