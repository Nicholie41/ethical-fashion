const CHART_LABELS = {
  okrProgress: "OKR progress by objective",
  krStatusMix: "Key result status mix",
  initiativeRoi: "Initiative ROI comparison",
  revenueTrend: "Revenue trajectory",
  scenarioCurve: "Scenario payback curve"
};

export default function PythonVisuals({
  visuals,
  loading,
  error,
  singleChart = null,
  title = "Python analytics visuals",
  onRefresh
}) {
  if (loading) {
    return (
      <section className="card elevated">
        <h2>{title}</h2>
        <div className="loading-inline">
          <div className="loader sm" />
          <span>Generating charts with Python (matplotlib)...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card elevated">
        <div className="section-header">
          <div>
            <h2>{title}</h2>
            <p className="muted">Charts are rendered by the Python analytics service on port 5001.</p>
          </div>
          {onRefresh ? (
            <button className="ghost" onClick={onRefresh}>
              Retry
            </button>
          ) : null}
        </div>
        <div className="alert error">{error}</div>
        <p className="muted">
          Start the analytics service:{" "}
          <code>cd python-analytics &amp;&amp; python app.py</code>
        </p>
      </section>
    );
  }

  const charts = singleChart ? { scenarioCurve: singleChart } : visuals?.charts || {};
  const entries = Object.entries(charts).filter(([, value]) => Boolean(value));

  if (entries.length === 0) {
    return (
      <section className="card elevated">
        <div className="section-header">
          <div>
            <h2>{title}</h2>
            <p className="muted">No chart data returned yet.</p>
          </div>
          {onRefresh ? (
            <button className="ghost" onClick={onRefresh}>
              Refresh charts
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="card elevated python-visuals">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p className="muted">
            Rendered by Python analytics service{visuals?.engine ? ` (${visuals.engine})` : ""}.
          </p>
        </div>
        {onRefresh ? (
          <button className="ghost" onClick={onRefresh}>
            Refresh charts
          </button>
        ) : null}
      </div>
      <div className="python-grid">
        {entries.map(([key, imageBase64]) => (
          <figure key={key} className="python-chart-card">
            <figcaption>{CHART_LABELS[key] || key}</figcaption>
            <img src={`data:image/png;base64,${imageBase64}`} alt={CHART_LABELS[key] || key} />
          </figure>
        ))}
      </div>
    </section>
  );
}
