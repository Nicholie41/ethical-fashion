import unittest

from app import app


class ForecastEndpointTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_forecast_returns_projected_roi(self):
        response = self.client.post(
            "/forecast",
            json={"investment": 100000, "upliftPercent": 30, "paybackMonths": 18},
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["investment"], 100000)
        self.assertEqual(data["upliftPercent"], 30)
        self.assertEqual(data["paybackMonths"], 18)
        self.assertAlmostEqual(data["projectedROI"], 0.2, places=4)
        self.assertIn("chartImage", data)
        self.assertEqual(data["engine"], "python-matplotlib")

    def test_executive_dashboard_visuals(self):
        response = self.client.post(
            "/visuals/executive-dashboard",
            json={
                "organizationName": "Acme",
                "okrs": [
                    {
                        "title": "Grow revenue",
                        "overallProgress": 55,
                        "keyResults": [{"status": "on-track"}, {"status": "at-risk"}],
                    }
                ],
                "initiatives": [{"name": "Cloud", "expectedROI": 0.22}],
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["engine"], "python-matplotlib")
        self.assertIn("okrProgress", data["charts"])
        self.assertIn("revenueTrend", data["charts"])


if __name__ == "__main__":
    unittest.main()
