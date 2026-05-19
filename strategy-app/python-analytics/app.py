from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "analytics"})


@app.post("/forecast")
def forecast():
    data = request.get_json(silent=True) or {}
    investment = float(data.get("investment", 0))
    uplift_percent = float(data.get("upliftPercent", 25))
    payback_months = int(data.get("paybackMonths", 18))
    projected_roi = (uplift_percent / 100.0) * (12 / max(payback_months, 1))

    return jsonify(
        {
            "investment": investment,
            "upliftPercent": uplift_percent,
            "paybackMonths": payback_months,
            "projectedROI": round(projected_roi, 4),
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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
