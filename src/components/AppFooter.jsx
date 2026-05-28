import React from 'react';
import VersionBadge from './VersionBadge';

function AppFooter() {
  return (
    <footer className="app-footer no-print">
      <div>
        Music Manager — Worship & Performance Platform
      </div>

      <VersionBadge />
    </footer>
  );
}

export default AppFooter;
