const manualSections = [
  {
    icon: '🔎',
    title: 'Find songs',
    summary: 'Library is the main place to look.',
    items: [
      'Search by title, lyrics, beat, key, or notes.',
      'Sort by latest or song name.',
      'Filter by category or contributor.'
    ]
  },
  {
    icon: '➕',
    title: 'Add songs',
    summary: 'Start small. Add more details later.',
    items: [
      'Tap Add Song and enter the name.',
      'Paste lyrics now, or add them later.',
      'Add piano settings only when needed.'
    ]
  },
  {
    icon: '🟠',
    title: 'Finish details',
    summary: 'Amber links show what is missing.',
    items: [
      'Add Lyrics means lyrics are missing.',
      'Add Audio means audio is missing.',
      'More has edit, duplicate, and delete.'
    ]
  },
  {
    icon: '🎹',
    title: 'Use beats and audio',
    summary: 'Keep practice details with the song.',
    items: [
      'Beats shows piano settings.',
      'Preferred marks the best beat.',
      'Audio lets you upload, record, or play tracks.'
    ]
  },
  {
    icon: '⚙️',
    title: 'Settings and access',
    summary: 'Use these for setup and control.',
    items: [
      'Settings saves your default keyboard.',
      'Reports shows totals and recent additions.',
      'Admin manages users and approval.'
    ]
  }
];

function ManualPage({ isAdmin = false }) {
  return (
    <section className="manual-page no-print" aria-label="User manual">
      <div className="panel manual-page__intro">
        <span className="manual-page__eyebrow">Quick help</span>
        <h2>How to use Music Manager</h2>
        <p>
          Keep each song together with its lyrics, beats, audio, and notes. Add what you have now, then complete the rest later.
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

        {!isAdmin && (
          <article className="manual-page__section manual-page__section--note">
            <h3>Need more access?</h3>
            <p>
              If some actions are locked, ask an admin to approve or update your account.
            </p>
          </article>
        )}
      </div>
    </section>
  );
}

export default ManualPage;
