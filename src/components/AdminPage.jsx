import { useState } from 'react';
import { buildPermissions } from '../rbac';

const CAPABILITY_GROUPS = [
  {
    title: 'Library',
    items: [
      ['createSongs', 'Add songs'],
      ['editSongs', 'Edit songs and lyrics'],
      ['duplicateSongs', 'Duplicate songs'],
      ['deleteSongs', 'Delete songs']
    ]
  },
  {
    title: 'Beats and Audio',
    items: [
      ['addBeatSettings', 'Add beat settings'],
      ['editBeatSettings', 'Edit beat settings'],
      ['deleteBeatSettings', 'Delete beat settings'],
      ['addAudio', 'Upload and record audio'],
      ['deleteAudio', 'Delete audio']
    ]
  },
  {
    title: 'Planning',
    items: [
      ['markPresented', 'Mark presented'],
      ['viewSongStats', 'View song stats'],
      ['planPresentations', 'Highlight, hide, schedule songs']
    ]
  },
  {
    title: 'Consecration and Review',
    items: [
      ['viewConsecration', 'View Consecration'],
      ['addConsecration', 'Add Consecration groups'],
      ['editConsecration', 'Edit Consecration groups'],
      ['viewSuggestionsList', 'View suggested songs']
    ]
  },
  {
    title: 'Administration',
    items: [
      ['manageUsers', 'Manage users'],
      ['manageProtectedUsers', 'Manage protected users'],
      ['manageSettings', 'Change settings'],
      ['viewLogTrail', 'View Log Trail'],
      ['clearLogTrail', 'Clear Log Trail']
    ]
  }
];

function profileToRole(profile, isProtectedOwner = false) {
  return {
    approved: Boolean(profile.is_approved || profile.is_admin || profile.is_super_admin || profile.is_protected || isProtectedOwner),
    admin: Boolean(profile.is_admin || profile.is_super_admin || profile.is_protected || isProtectedOwner),
    owner: Boolean(profile.is_super_admin || profile.is_protected || isProtectedOwner),
    protected: Boolean(profile.is_protected || isProtectedOwner),
    canManageProtectedUsers: Boolean(profile.can_manage_protected_users || isProtectedOwner),
    canAddSongs: Boolean(profile.can_add_songs || profile.is_super_admin || profile.is_protected || isProtectedOwner),
    canEditSongs: Boolean(profile.can_edit_songs || profile.is_super_admin || profile.is_protected || isProtectedOwner),
    canDeleteSongs: Boolean(profile.can_delete_songs || profile.is_super_admin || profile.is_protected || isProtectedOwner),
    canPlanPresentations: Boolean(profile.can_plan_presentations || profile.is_super_admin || profile.is_protected || isProtectedOwner)
  };
}

function AccessSwitch({
  label,
  description,
  checked,
  disabled = false,
  onChange
}) {
  return (
    <label className={`admin-access-switch${checked ? ' admin-access-switch--on' : ''}${disabled ? ' admin-access-switch--disabled' : ''}`}>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={onChange}
      />
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
    </label>
  );
}

function CapabilityMatrix({ permissions }) {
  return (
    <div className="admin-capability-matrix">
      {CAPABILITY_GROUPS.map(group => (
        <div key={group.title} className="admin-capability-group">
          <span>{group.title}</span>
          <div>
            {group.items.map(([key, label]) => (
              <span
                key={key}
                className={`admin-capability-pill${permissions[key] ? ' admin-capability-pill--on' : ''}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getEnabledCapabilityCount(permissions) {
  return CAPABILITY_GROUPS.reduce((count, group) => (
    count + group.items.filter(([key]) => permissions[key]).length
  ), 0);
}

function getAccessSummary(profile, effectiveRole, protectedUser) {
  if (protectedUser || effectiveRole.owner) return 'Full protected access';

  return [
    profile.is_approved ? 'Approved' : 'Pending',
    profile.is_admin ? 'Admin' : null,
    profile.can_add_songs ? 'Add' : null,
    profile.can_edit_songs ? 'Edit' : null,
    profile.can_delete_songs ? 'Delete' : null,
    profile.can_plan_presentations ? 'Planning' : null
  ].filter(Boolean).join(' • ');
}

function AdminPage({
  profiles = [],
  isSuperAdmin,
  currentUserId,
  canManageSuperAdmins = false,
  canManageProtectedUsers = false,
  onToggleStatus,
  onToggleActionPermission
}) {
  const [openProfileId, setOpenProfileId] = useState(null);

  return (
    <section className="panel no-print admin-page">
      <div className="admin-page__header">
        <div>
          <span className="admin-page__eyebrow">Role based access control</span>
          <h2>{canManageSuperAdmins ? 'Super Admin' : 'Admin'}</h2>
          <p>
            Grant the stored access levels on the left. The effective app capabilities on the right show exactly which actions the user will see.
          </p>
        </div>
      </div>

      {profiles.length === 0 && (
        <p className="admin-page__empty">
          No user profiles found.
        </p>
      )}

      <div className="admin-user-list">
        {profiles.map(profile => {
          const protectedOwner = isSuperAdmin?.(profile.email);
          const protectedUser = protectedOwner || profile.is_protected;
          const isCurrentUser = currentUserId === profile.id;
          const canChangeUser = !protectedUser;
          const protectedControlsDimmed = !canManageProtectedUsers;
          const canRemoveProtected = canManageProtectedUsers && protectedUser && !protectedOwner && !isCurrentUser;
          const effectiveRole = profileToRole(profile, protectedOwner);
          const effectivePermissions = buildPermissions(effectiveRole, { id: profile.id });
          const isOpen = openProfileId === profile.id;
          const enabledCapabilityCount = getEnabledCapabilityCount(effectivePermissions);
          const totalCapabilityCount = CAPABILITY_GROUPS.reduce((count, group) => count + group.items.length, 0);
          const accessSummary = getAccessSummary(profile, effectiveRole, protectedUser);
          const statusText = effectiveRole.owner
            ? 'Super admin'
            : effectiveRole.admin
              ? 'Admin'
              : effectiveRole.approved
                ? 'Approved'
                : 'Pending';

          return (
            <article key={profile.id} className={`admin-user-card${protectedUser ? ' admin-user-card--protected' : ''}${isOpen ? ' admin-user-card--open' : ''}`}>
              <div className="admin-user-card__identity">
                <div>
                  <strong>{profile.email}</strong>
                  <span>{statusText}</span>
                  <small>{accessSummary || 'No stored permissions enabled'}</small>
                </div>

                <div className="admin-user-card__header-actions">
                  <div className="admin-user-card__badges">
                    <span>{enabledCapabilityCount}/{totalCapabilityCount} capabilities</span>
                    {profile.is_super_admin && <span>Super Admin</span>}
                    {protectedUser && <span>Protected</span>}
                    {isCurrentUser && <span>Current User</span>}
                  </div>

                  <button
                    type="button"
                    className="admin-user-card__toggle"
                    onClick={() => setOpenProfileId(current => current === profile.id ? null : profile.id)}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? 'Collapse' : 'Manage'}
                  </button>
                </div>
              </div>

              {isOpen && <div className="admin-user-card__body">
                <div className="admin-user-card__controls">
                  <span className="admin-user-card__section-title">Stored Access</span>

                  {canChangeUser ? (
                    <>
                      <AccessSwitch
                        label="Approved"
                        description="Allows normal approved-user access."
                        checked={profile.is_approved}
                        onChange={() => onToggleStatus?.(profile.id, 'is_approved', profile.is_approved)}
                      />

                      <AccessSwitch
                        label="Admin"
                        description="Marks the account as an admin; action switches control specific permissions."
                        checked={profile.is_admin}
                        onChange={() => onToggleStatus?.(profile.id, 'is_admin', profile.is_admin)}
                      />

                      {canManageSuperAdmins && (
                        <>
                          <AccessSwitch
                            label="Add"
                            description="Shows Add Song, Add Beat, Add Audio, duplicate, and Add Consecration controls."
                            checked={Boolean(profile.can_add_songs)}
                            onChange={() => onToggleActionPermission?.(profile.id, 'can_add_songs', profile.can_add_songs)}
                          />

                          <AccessSwitch
                            label="Edit"
                            description="Shows Edit Song, Edit Lyrics, Edit Beat, and Edit Consecration controls."
                            checked={Boolean(profile.can_edit_songs)}
                            onChange={() => onToggleActionPermission?.(profile.id, 'can_edit_songs', profile.can_edit_songs)}
                          />

                          <AccessSwitch
                            label="Delete"
                            description="Shows delete actions for songs, beats, suggestions, and other deletable content."
                            checked={Boolean(profile.can_delete_songs)}
                            onChange={() => onToggleActionPermission?.(profile.id, 'can_delete_songs', profile.can_delete_songs)}
                          />

                          <AccessSwitch
                            label="Planning"
                            description="Shows highlight, hide, presentation date, and Mark Presented controls."
                            checked={Boolean(profile.can_plan_presentations)}
                            onChange={() => onToggleActionPermission?.(profile.id, 'can_plan_presentations', profile.can_plan_presentations)}
                          />

                          <AccessSwitch
                            label="Super Admin"
                            description="Grants settings, admin, log trail, and full content permissions."
                            checked={profile.is_super_admin}
                            disabled={isCurrentUser && profile.is_super_admin}
                            onChange={() => onToggleActionPermission?.(profile.id, 'is_super_admin', profile.is_super_admin)}
                          />
                        </>
                      )}

                      <AccessSwitch
                        label="Protected"
                        description={protectedControlsDimmed ? 'Requires Manage Protected authority before this can be changed.' : 'Locks full access so normal restrictions cannot remove it.'}
                        checked={profile.is_protected || protectedOwner}
                        disabled={protectedUser || protectedControlsDimmed}
                        onChange={() => onToggleActionPermission?.(profile.id, 'is_protected', profile.is_protected)}
                      />

                      <AccessSwitch
                        label="Manage Protected"
                        description={protectedControlsDimmed ? 'Dimmed until your account has Manage Protected enabled.' : 'Allows granting or removing protected access for other users.'}
                        checked={Boolean(profile.can_manage_protected_users)}
                        disabled={protectedControlsDimmed}
                        onChange={() => onToggleActionPermission?.(profile.id, 'can_manage_protected_users', profile.can_manage_protected_users)}
                      />
                    </>
                  ) : (
                    <div className="admin-user-card__locked">
                      <strong>Full access locked</strong>
                      <span>Protected accounts cannot be restricted from this panel.</span>
                      {canRemoveProtected && (
                        <button
                          type="button"
                          className="admin-user-actions__button admin-user-actions__button--danger"
                          onClick={() => onToggleActionPermission?.(profile.id, 'is_protected', profile.is_protected)}
                        >
                          Remove Protected
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="admin-user-card__capabilities">
                  <span className="admin-user-card__section-title">Effective App Capabilities</span>
                  <CapabilityMatrix permissions={effectivePermissions} />
                </div>
              </div>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AdminPage;
