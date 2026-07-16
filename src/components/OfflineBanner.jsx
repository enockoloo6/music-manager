function OfflineBanner({ visible }) {
  if (!visible) return null;

  return (
    <div className="offline-banner">
      ⚠️ You are offline. Showing locally available data.
    </div>
  );
}

export default OfflineBanner;
