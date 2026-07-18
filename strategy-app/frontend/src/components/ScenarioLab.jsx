export default function ScenarioLab({
  investment,
  upliftPercent,
  paybackMonths,
  forecast,
  onInvestmentChange,
  onUpliftChange,
  onPaybackChange,
  onRunScenario
}) {
  return (
    <section className="card elevated">
      <div className="section-header">
        <div>
          <h2>Scenario Lab</h2>
          <p className="muted">Model investment outcomes before committing capital.</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="investment">Investment ($)</label>
          <input
            id="investment"
            type="number"
            value={investment}
            onChange={(event) => onInvestmentChange(Number(event.target.value || 0))}
          />
        </div>
        <div className="field">
          <label htmlFor="upliftPercent">Revenue uplift (%)</label>
          <input
            id="upliftPercent"
            type="number"
            value={upliftPercent}
            onChange={(event) => onUpliftChange(Number(event.target.value || 0))}
          />
        </div>
        <div className="field">
          <label htmlFor="paybackMonths">Payback (months)</label>
          <input
            id="paybackMonths"
            type="number"
            value={paybackMonths}
            onChange={(event) => onPaybackChange(Number(event.target.value || 0))}
          />
        </div>
      </div>

      <button className="primary" onClick={onRunScenario}>
        Run forecast (Python)
      </button>

      {forecast ? (
        <>
          <div className="forecast-results">
            <div className="forecast-stat">
              <span>Projected ROI</span>
              <strong>{(forecast.projectedROI * 100).toFixed(2)}%</strong>
            </div>
            <div className="forecast-stat">
              <span>Payback period</span>
              <strong>{forecast.paybackMonths} months</strong>
            </div>
          </div>
          {forecast.chartImage ? (
            <figure className="python-chart-card solo">
              <figcaption>Python scenario payback curve</figcaption>
              <img src={`data:image/png;base64,${forecast.chartImage}`} alt="Scenario payback curve" />
            </figure>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
