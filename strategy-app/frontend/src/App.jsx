import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import RevenueChart from "./components/RevenueChart";

const analyticsBaseUrl = "http://localhost:5001";
const backendBaseUrl = "http://localhost:5000";

export default function App() {
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("Strategy Lead");
  const [email, setEmail] = useState("lead@strategy.com");
  const [password, setPassword] = useState("Pass1234!");
  const [role, setRole] = useState("analyst");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [initiatives, setInitiatives] = useState([]);
  const [initiativeName, setInitiativeName] = useState("Cloud modernization");
  const [investment, setInvestment] = useState(100000);
  const [forecast, setForecast] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState("");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const authenticate = async () => {
    setError("");
    const path = authMode === "register" ? "/register" : "/login";
    const payload =
      authMode === "register" ? { name, email, password, role } : { email, password };

    try {
      const response = await axios.post(`${backendBaseUrl}/api/auth${path}`, payload);
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Authentication failed");
    }
  };

  const runScenario = async () => {
    const response = await axios.post(`${analyticsBaseUrl}/forecast`, {
      investment,
      upliftPercent: 30,
      paybackMonths: 18
    });
    setForecast(response.data);
    if (token) {
      await axios.post(
        `${backendBaseUrl}/api/strategy/update`,
        {
          type: "scenario-run",
          investment
        },
        { headers: authHeaders }
      );
    }
  };

  const loadInitiatives = async () => {
    if (!token) return;
    const response = await axios.get(`${backendBaseUrl}/api/initiatives`, { headers: authHeaders });
    setInitiatives(response.data);
  };

  const createInitiative = async () => {
    await axios.post(
      `${backendBaseUrl}/api/initiatives`,
      {
        name: initiativeName,
        owner: user.name,
        workstream: "Enterprise Transformation",
        status: "planned",
        investment,
        expectedROI: 0.22,
        kpis: [{ name: "Process Efficiency", baseline: 60, target: 85, current: 65 }],
        milestones: [{ title: "Phase 1 Rollout", dueDate: new Date(), status: "planned" }]
      },
      { headers: authHeaders }
    );
    await loadInitiatives();
  };

  useEffect(() => {
    axios.get(`${analyticsBaseUrl}/chart-data`).then((res) => setChartData(res.data));

    const socket = io(backendBaseUrl);
    socket.on("strategy:welcome", (data) => {
      setUpdates((prev) => [data.message, ...prev].slice(0, 5));
    });
    socket.on("strategy:updated", (data) => {
      setUpdates((prev) => [`${data.update.type} at ${new Date(data.timestamp).toLocaleTimeString()}`, ...prev].slice(0, 5));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    loadInitiatives();
  }, [token]);

  if (!user) {
    return (
      <main className="layout">
        <h1>Enterprise Transformation & Strategy</h1>
        <p>Sign in to access role-based strategy workspace.</p>
        <div className="card">
          <h2>{authMode === "register" ? "Register" : "Login"}</h2>
          {authMode === "register" && (
            <>
              <label htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(event) => setName(event.target.value)} />
              <label htmlFor="role">Role</label>
              <select id="role" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="executive">Executive</option>
              </select>
            </>
          )}
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button onClick={authenticate}>{authMode === "register" ? "Create Account" : "Login"}</button>
          <button className="secondary" onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}>
            Switch to {authMode === "register" ? "Login" : "Register"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="layout">
      <h1>Enterprise Transformation & Strategy</h1>
      <p>
        Signed in as <strong>{user.name}</strong> ({user.role}). Run ROI scenarios, manage initiatives, and track updates.
      </p>

      <div className="card">
        <h2>Scenario Lab</h2>
        <label htmlFor="investment">Investment ($)</label>
        <input
          id="investment"
          type="number"
          value={investment}
          onChange={(event) => setInvestment(Number(event.target.value || 0))}
        />
        <button onClick={runScenario}>Run Forecast</button>

        {forecast && (
          <div className="result">
            <p>
              <strong>Projected ROI:</strong> {(forecast.projectedROI * 100).toFixed(2)}%
            </p>
            <p>
              <strong>Payback:</strong> {forecast.paybackMonths} months
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Initiatives</h2>
        {(user.role === "admin" || user.role === "analyst") && (
          <>
            <label htmlFor="initiativeName">Initiative Name</label>
            <input
              id="initiativeName"
              value={initiativeName}
              onChange={(event) => setInitiativeName(event.target.value)}
            />
            <button onClick={createInitiative}>Add Initiative</button>
          </>
        )}
        <button className="secondary" onClick={loadInitiatives}>
          Refresh
        </button>
        <ul>
          {initiatives.map((item) => (
            <li key={item._id}>
              {item.name} - {item.status} - ROI {(item.expectedROI * 100).toFixed(1)}%
            </li>
          ))}
        </ul>
      </div>

      <RevenueChart data={chartData} />

      <div className="card">
        <h2>Live Strategy Feed</h2>
        <ul>
          {updates.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
