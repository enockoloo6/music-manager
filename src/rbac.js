const EMPTY_PERMISSIONS = Object.freeze({
  viewLibrary: true,
  viewConsecration: false,
  manageConsecration: false,
  addConsecration: false,
  editConsecration: false,
  viewReports: false,
  viewSuggestionsList: false,
  createSongs: false,
  editSongs: false,
  deleteSongs: false,
  duplicateSongs: false,
  manageAudio: false,
  addAudio: false,
  deleteAudio: false,
  addBeatSettings: false,
  editBeatSettings: false,
  deleteBeatSettings: false,
  markPresented: false,
  viewSongStats: false,
  planPresentations: false,
  manageUsers: false,
  manageProtectedUsers: false,
  manageSettings: false,
  viewLogTrail: false,
  clearLogTrail: false,
  claimAdmin: false
});

export function buildPermissions(role = {}, user = null) {
  const authenticated = Boolean(user);
  const approved = Boolean(role.approved || role.admin || role.owner || role.protected);
  const owner = Boolean(role.owner || role.protected);
  const canAddSongs = Boolean(role.canAddSongs || owner);
  const canEditSongs = Boolean(role.canEditSongs || owner);
  const canDeleteSongs = Boolean(role.canDeleteSongs || owner);
  const canPlanPresentations = Boolean(role.canPlanPresentations || owner);

  return {
    ...EMPTY_PERMISSIONS,
    viewLibrary: true,
    viewConsecration: approved,
    manageConsecration: canAddSongs || canEditSongs,
    addConsecration: canAddSongs,
    editConsecration: canEditSongs,
    viewReports: approved,
    viewSuggestionsList: authenticated,
    createSongs: canAddSongs,
    editSongs: canEditSongs,
    deleteSongs: canDeleteSongs,
    duplicateSongs: canAddSongs,
    manageAudio: canAddSongs || canDeleteSongs,
    addAudio: canAddSongs,
    deleteAudio: canDeleteSongs,
    addBeatSettings: canAddSongs,
    editBeatSettings: canEditSongs,
    deleteBeatSettings: canDeleteSongs,
    markPresented: canPlanPresentations,
    viewSongStats: approved,
    planPresentations: canPlanPresentations,
    manageUsers: owner,
    manageProtectedUsers: Boolean(role.canManageProtectedUsers),
    manageSettings: owner,
    viewLogTrail: owner,
    clearLogTrail: owner,
    claimAdmin: authenticated && !approved
  };
}

export default buildPermissions;
