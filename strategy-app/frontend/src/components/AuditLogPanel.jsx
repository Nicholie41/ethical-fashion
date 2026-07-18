function formatAction(action) {
  return action.replaceAll(".", " · ");
}

function formatTime(value) {
  return new Date(value).toLocaleString();
}

export default function AuditLogPanel({ logs, onRefresh }) {
  return (
    <section className="card elevated">
      <div className="section-header">
        <div>
          <h2>Audit log</h2>
          <p className="muted">Immutable record of strategic changes in your organization.</p>
        </div>
        <button className="ghost" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>No audit events yet.</p>
        </div>
      ) : (
        <ul className="audit-list">
          {logs.map((log) => (
            <li key={log.id} className="audit-item">
              <div className="audit-row">
                <strong>{formatAction(log.action)}</strong>
                <span className="muted">{formatTime(log.createdAt)}</span>
              </div>
              <p className="muted">
                {log.user?.name || "System"} · {log.entityType}
                {log.entityId ? ` · ${log.entityId.slice(-6)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
