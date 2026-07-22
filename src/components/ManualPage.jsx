function buildManualSections(permissions = {}) {
  const canAddSongs = Boolean(permissions.createSongs);
  const canEditSongs = Boolean(permissions.editSongs);
  const canDeleteSongs = Boolean(permissions.deleteSongs);
  const canPlanPresentations = Boolean(permissions.planPresentations);
  const canManageUsers = Boolean(permissions.manageUsers);
  const canManageProtectedUsers = Boolean(permissions.manageProtectedUsers);

  const sections = [
    {
      icon: '🔎',
      title: 'Find songs',
      summary: 'Library is the main place to look.',
      items: [
        'Search by title, lyrics, beat, key, or notes.',
        'Sort by latest or song name.',
        'Filter by category or contributor.',
        'By default, opening a song section collapses open sections on other songs; Settings can turn that off.'
      ]
    },
    {
      icon: '☁',
      title: 'Online and offline',
      summary: 'Open once online, then use what was saved.',
      items: [
        'Songs, lyrics, beats, keyboards, and categories are cached for offline viewing.',
        'Audio can play offline after it is saved locally.',
        'On mobile data or unknown networks, the app shows estimated audio data before saving.'
      ]
    },
    {
      icon: '✦',
      title: 'Suggestions',
      summary: 'Send songs for review before they are added.',
      items: [
        'Open Suggestions and search the song name first.',
        'Submit only when the song is not already in the existing list.',
        'Choose whether the suggestion is for Consecration, Presentation, Library, or Other.',
        'A suggester name is optional; add any helpful song details.',
        'Logged-out visitors can submit suggestions but cannot see the suggestion list.',
        'Logged-in permitted users can view details, manually add the song through the proper Library or Consecration steps, and delete suggestions.'
      ]
    }
  ];

  if (canAddSongs) {
    sections.splice(1, 0, {
      icon: '➕',
      title: 'Add songs',
      summary: 'Start small. Add more details later.',
      items: [
        'Tap Add Song and enter the song name.',
        'Save with only a song name, then add lyrics, audio, and piano settings later.',
        'Add piano settings only when you have a beat name ready; the Key field uses standard musical key choices.'
      ]
    });
  }

  if (canEditSongs) {
    sections.push({
      icon: '●',
      title: 'Finish details',
      summary: 'Use edit actions to complete each song.',
      items: [
        'Add Lyrics means lyrics are missing.',
        'Edit Song changes the saved song name.',
        'Add Another Beat saves a new beat under the same song.',
        'Beat actions let you edit existing piano settings.'
      ]
    });
  }

  if (canAddSongs) {
    sections.push({
      icon: '🎹',
      title: 'Use beats and audio',
      summary: 'Keep practice details with the song.',
      items: [
        'Beats shows piano settings.',
        'Use Add Another Beat when a song needs settings for another keyboard, tempo, category, or use.',
        'Preferred marks the best beat.',
        'Audio lets approved users upload, record, play, and save tracks for offline playback.'
      ]
    });

    sections.push({
      icon: '▦',
      title: 'Consecration groups',
      summary: 'Group document-style song lists for practice.',
      items: [
        'Use Style group when songs share a keyboard style, or Play without styles when no style is needed.',
        'Set Songs Per Subgroup to split long lists into smaller blocks.',
        'Drag a song by its handle to reorder it or move it into another subgroup.',
        'Highlight a main group or a subgroup, then collapse groups or subgroups you do not need.',
        'When a highlighted group has a highlighted subgroup, that group opens automatically and the highlighted subgroup stays visible.',
        'When editing a long group, Save Changes stays at the bottom of the screen so it is always available.'
      ]
    });
  }

  if (canPlanPresentations) {
    sections.push({
      icon: '★',
      title: 'Presentation planning',
      summary: 'Prepare worship songs without losing history.',
      items: [
        'Highlight or hide songs and set presentation dates.',
        'Highlighted songs appear first and show their presentation date.',
        'Use Mark Presented to keep presentation history, and Song Stats to review it.'
      ]
    });
  } else if (canAddSongs) {
    sections.push({
      icon: '★',
      title: 'Presentation history',
      summary: 'Record when songs are used.',
      items: [
        'Open Song Stats to see presentation count and dates.',
        'Ask a super admin if a song needs to be highlighted, hidden, scheduled, or marked presented.'
      ]
    });
  }

  if (canDeleteSongs) {
    sections.push({
      icon: '🗑',
      title: 'Delete access',
      summary: 'Delete actions are restricted.',
      items: [
        'Delete Song removes a song and its attached beat details.',
        'Remove Beat deletes only that beat setting.',
        'Delete and edit actions are recorded in the log trail.'
      ]
    });
  }

  if (canManageUsers) {
    sections.push({
      icon: '⚙️',
      title: 'Settings and access',
      summary: 'Use these for setup and control.',
      items: [
        'New users use Request Access; their pending profile is created automatically for Admin review.',
        'Users who forget a password can use Forgot password on the login form and set a new password from the email link.',
        'Settings saves your default keyboard and inactivity logout time.',
        'Admin shows stored access switches beside effective RBAC capabilities, so you can see exactly which actions each user will see.',
        'Admin user cards are collapsed by default; open Manage on one user to edit permissions, and the other users stay compact.',
        'Use Add for creating new songs, beats, audio, duplicates, and Consecration groups; use Planning for highlight, hide, presentation date, and Mark Presented controls.',
        canManageProtectedUsers
          ? 'Protected access can be granted or removed for other users.'
          : 'Protected access controls stay dimmed until your account has Manage Protected enabled.',
        'Log Trail shows edit and delete actions with the user who did them.'
      ]
    });
  }

  return sections;
}

function ManualPage({ permissions = {} }) {
  const manualSections = buildManualSections(permissions);
  const hasLimitedAccess = !permissions.createSongs
    && !permissions.editSongs
    && !permissions.manageUsers
    && !permissions.viewConsecration;

  return (
    <section className="manual-page no-print" aria-label="User manual">
      <div className="panel manual-page__intro">
        <span className="manual-page__eyebrow">Quick help</span>
        <h2>How to use Music Manager</h2>
        <p>
          This guide only shows actions available to your account. If a capability is not listed, your account does not currently have that access.
        </p>
      </div>

      <div className="manual-page__grid">
        {manualSections.map(section => (
          <article key={section.title} className="manual-page__section">
            <div className="manual-page__section-header">
              <span className="manual-page__icon" aria-hidden="true">{section.icon}</span>
              <div>
                <h3>{section.title}</h3>
                <p>{section.summary}</p>
              </div>
            </div>
            <ul>
              {section.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}

        {hasLimitedAccess && (
          <article className="manual-page__section manual-page__section--note">
            <h3>Need more access?</h3>
            <p>
              If song actions are locked, ask a super admin or protected user to update your account.
            </p>
          </article>
        )}
      </div>
    </section>
  );
}

export default ManualPage;
