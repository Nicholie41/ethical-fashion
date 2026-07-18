const ANALYTICS_URL = process.env.ANALYTICS_URL || "http://localhost:5001";

async function postAnalytics(path, payload) {
  const response = await fetch(`${ANALYTICS_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Analytics service error (${response.status}): ${text}`);
  }

  return response.json();
}

async function getAnalytics(path) {
  const response = await fetch(`${ANALYTICS_URL}${path}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Analytics service error (${response.status}): ${text}`);
  }
  return response.json();
}

module.exports = { postAnalytics, getAnalytics, ANALYTICS_URL };
