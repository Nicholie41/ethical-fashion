export default function LiveFeed({ updates }) {
  return (
    <section className="card elevated feed-card">
      <div className="section-header">
        <div>
          <h2>Live strategy feed</h2>
          <p className="muted">Real-time updates from your strategy workspace.</p>
        </div>
        <span className="live-dot">Live</span>
      </div>

      {updates.length === 0 ? (
        <p className="muted">Waiting for strategy events...</p>
      ) : (
        <ul className="feed-list">
          {updates.map((item) => (
            <li key={item.key}>
              <span className="feed-bullet" />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
