const STATUS_COLORS = {
  planned: "neutral",
  "in-progress": "info",
  completed: "success",
  "on-hold": "warn"
};

export default function InitiativesPanel({
  initiatives,
  canManage,
  initiativeName,
  onInitiativeNameChange,
  onCreateInitiative,
  onRefresh
}) {
  return (
    <section className="card elevated">
      <div className="section-header">
        <div>
          <h2>Strategic Initiatives</h2>
          <p className="muted">Execution workstreams tied to organizational outcomes.</p>
        </div>
        <button className="ghost" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {canManage && (
        <div className="inline-form">
          <input
            id="initiativeName"
            value={initiativeName}
            onChange={(event) => onInitiativeNameChange(event.target.value)}
            placeholder="New initiative name"
          />
          <button className="primary" onClick={onCreateInitiative}>
            Add initiative
          </button>
        </div>
      )}

      {initiatives.length === 0 ? (
        <div className="empty-state">
          <p>No initiatives yet.</p>
          <p className="muted">Create your first initiative to start tracking execution.</p>
        </div>
      ) : (
        <div className="initiative-grid">
          {initiatives.map((item) => (
            <article key={item._id} className="initiative-card">
              <div className="initiative-top">
                <h3>{item.name}</h3>
                <span className={`status-badge ${STATUS_COLORS[item.status] || "neutral"}`}>
                  {item.status}
                </span>
              </div>
              <p className="muted">{item.workstream}</p>
              <div className="initiative-metrics">
                <div>
                  <span className="metric-label">Expected ROI</span>
                  <strong>{(item.expectedROI * 100).toFixed(1)}%</strong>
                </div>
                <div>
                  <span className="metric-label">Investment</span>
                  <strong>${Number(item.investment).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="metric-label">Owner</span>
                  <strong>{item.owner}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
