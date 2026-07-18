from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

from charts.executive import build_executive_dashboard_charts, build_revenue_chart
from charts.scenario import build_scenario_chart

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "analytics", "engine": "python-matplotlib"})


@app.post("/forecast")
def forecast():
    data = request.get_json(silent=True) or {}
    investment = float(data.get("investment", 0))
    uplift_percent = float(data.get("upliftPercent", 25))
    payback_months = int(data.get("paybackMonths", 18))
    projected_roi = (uplift_percent / 100.0) * (12 / max(payback_months, 1))
    chart_image = build_scenario_chart(investment, uplift_percent, payback_months, projected_roi)

    return jsonify(
        {
            "investment": investment,
            "upliftPercent": uplift_percent,
            "paybackMonths": payback_months,
            "projectedROI": round(projected_roi, 4),
            "chartImage": chart_image,
            "engine": "python-matplotlib",
        }
    )


@app.get("/chart-data")
def chart_data():
    data = pd.DataFrame(
        {
            "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "revenue": [100, 120, 145, 160, 190, 225],
        }
    )
    return jsonify(data.to_dict("records"))


@app.post("/visuals/revenue")
def visuals_revenue():
    return jsonify({"engine": "python-matplotlib", "charts": {"revenueTrend": build_revenue_chart()}})


@app.post("/visuals/executive-dashboard")
def visuals_executive_dashboard():
    data = request.get_json(silent=True) or {}
    organization_name = data.get("organizationName", "Organization")
    okrs = data.get("okrs", [])
    initiatives = data.get("initiatives", [])
    return jsonify(build_executive_dashboard_charts(organization_name, okrs, initiatives))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
