const STATUS_LABELS = {
  "on-track": "On track",
  "at-risk": "At risk",
  behind: "Behind",
  completed: "Completed"
};

function formatMetricValue(value, metricType) {
  if (metricType === "percent") {
    return `${value}%`;
  }
  if (metricType === "currency") {
    return `$${Number(value).toLocaleString()}`;
  }
  return String(value);
}

function progressTone(progress) {
  if (progress >= 100) return "complete";
  if (progress >= 70) return "good";
  if (progress >= 40) return "watch";
  return "risk";
}

export default function OkrPanel({
  okrs,
  okrSummary,
  canManage,
  objectiveTitle,
  objectivePeriod,
  keyResultTitle,
  keyResultTarget,
  onObjectiveTitleChange,
  onObjectivePeriodChange,
  onKeyResultTitleChange,
  onKeyResultTargetChange,
  onCreateOkr,
  onCheckIn,
  onRefresh
}) {
  return (
    <section className="card elevated">
      <div className="section-header">
        <div>
          <h2>OKR tracking</h2>
          <p className="muted">Objectives and key results with automated progress scoring.</p>
        </div>
        <button className="ghost" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {okrSummary ? (
        <div className="metric-row compact">
          <span className="metric-pill">{okrSummary.totalObjectives} objectives</span>
          <span className="metric-pill accent">{okrSummary.averageProgress}% avg progress</span>
          <span className="metric-pill warn">{okrSummary.atRiskKeyResults} at-risk KRs</span>
        </div>
      ) : null}

      {canManage ? (
        <div className="okr-form card inset">
          <h3>New objective</h3>
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="objectiveTitle">Objective</label>
              <input
                id="objectiveTitle"
                value={objectiveTitle}
                onChange={(event) => onObjectiveTitleChange(event.target.value)}
                placeholder="Increase enterprise cloud adoption"
              />
            </div>
            <div className="field">
              <label htmlFor="objectivePeriod">Period</label>
              <input
                id="objectivePeriod"
                value={objectivePeriod}
                onChange={(event) => onObjectivePeriodChange(event.target.value)}
                placeholder="2026-Q3"
              />
            </div>
            <div className="field span-2">
              <label htmlFor="keyResultTitle">First key result</label>
              <input
                id="keyResultTitle"
                value={keyResultTitle}
                onChange={(event) => onKeyResultTitleChange(event.target.value)}
                placeholder="Migrate 80% of workloads to cloud"
              />
            </div>
            <div className="field">
              <label htmlFor="keyResultTarget">Target (%)</label>
              <input
                id="keyResultTarget"
                type="number"
                value={keyResultTarget}
                onChange={(event) => onKeyResultTargetChange(Number(event.target.value || 0))}
              />
            </div>
          </div>
          <button className="primary" onClick={onCreateOkr}>
            Create OKR
          </button>
        </div>
      ) : null}

      {okrs.length === 0 ? (
        <div className="empty-state">
          <p>No OKRs yet for this organization.</p>
          <p className="muted">Define your first objective to start tracking outcomes.</p>
        </div>
      ) : (
        <div className="okr-list">
          {okrs.map((okr) => (
            <article key={okr.id} className="okr-item">
              <div className="okr-item-header">
                <div>
                  <div className="okr-meta-row">
                    <span className="period-badge">{okr.period}</span>
                    <span className="muted">{okr.owner}</span>
                  </div>
                  <h3>{okr.title}</h3>
                </div>
                <div
                  className={`progress-ring tone-${progressTone(okr.overallProgress)}`}
                  style={{ "--progress": okr.overallProgress }}
                >
                  <span>{okr.overallProgress}%</span>
                </div>
              </div>

              <div className="progress-track">
                <div
                  className={`progress-fill tone-${progressTone(okr.overallProgress)}`}
                  style={{ width: `${okr.overallProgress}%` }}
                />
              </div>

              <ul className="kr-list">
                {okr.keyResults.map((keyResult) => (
                  <li key={keyResult.id} className={`kr-item status-${keyResult.status}`}>
                    <div className="kr-row">
                      <span className="kr-title">{keyResult.title}</span>
                      <span className={`status-badge ${keyResult.status}`}>
                        {STATUS_LABELS[keyResult.status]}
                      </span>
                    </div>
                    <div className="kr-row">
                      <span className="muted">
                        {formatMetricValue(keyResult.currentValue, keyResult.metricType)} /{" "}
                        {formatMetricValue(keyResult.targetValue, keyResult.metricType)}
                      </span>
                      <span className="kr-progress">{keyResult.progress}%</span>
                    </div>
                    <div className="progress-track small">
                      <div
                        className={`progress-fill tone-${progressTone(keyResult.progress)}`}
                        style={{ width: `${keyResult.progress}%` }}
                      />
                    </div>
                    {canManage ? (
                      <div className="checkin-row">
                        <input
                          type="number"
                          defaultValue={keyResult.currentValue}
                          aria-label={`Check-in value for ${keyResult.title}`}
                          onBlur={(event) =>
                            onCheckIn(okr.id, keyResult.id, Number(event.target.value || 0))
                          }
                        />
                        <span className="muted">Update current value</span>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
