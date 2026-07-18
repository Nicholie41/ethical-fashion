import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import AppShell from "./components/AppShell";
import AuthPage from "./components/AuthPage";
import InitiativesPanel from "./components/InitiativesPanel";
import LiveFeed from "./components/LiveFeed";
import LoadingScreen from "./components/LoadingScreen";
import OkrPanel from "./components/OkrPanel";
import PythonVisuals from "./components/PythonVisuals";
import RevenueChart from "./components/RevenueChart";
import ScenarioLab from "./components/ScenarioLab";
import StatCard from "./components/StatCard";
import AuditLogPanel from "./components/AuditLogPanel";
import TeamPanel from "./components/TeamPanel";
import {
  api,
  backendBaseUrl,
  clearAccessToken,
  configureAuthHandlers,
  getAccessToken,
  setAccessToken
} from "./api/client";

const analyticsBaseUrl = import.meta.env.VITE_ANALYTICS_URL || "http://localhost:5001";
const currentPeriod = "2026-Q3";
const isDev = import.meta.env.DEV;

function nextErrorId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [authMode, setAuthMode] = useState("login");
  const [activeSection, setActiveSection] = useState("overview");
  const [name, setName] = useState(isDev ? "Strategy Lead" : "");
  const [email, setEmail] = useState(isDev ? "lead@strategy.com" : "");
  const [password, setPassword] = useState(isDev ? "Pass1234!" : "");
  const [organizationName, setOrganizationName] = useState(isDev ? "Acme Strategy Group" : "");
  const [inviteToken, setInviteToken] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [initiatives, setInitiatives] = useState([]);
  const [okrs, setOkrs] = useState([]);
  const [okrSummary, setOkrSummary] = useState(null);
  const [initiativeName, setInitiativeName] = useState("Cloud modernization");
  const [investment, setInvestment] = useState(100000);
  const [upliftPercent, setUpliftPercent] = useState(30);
  const [paybackMonths, setPaybackMonths] = useState(18);
  const [forecast, setForecast] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [pythonVisuals, setPythonVisuals] = useState(null);
  const [visualsLoading, setVisualsLoading] = useState(false);
  const [visualsError, setVisualsError] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [orgProfile, setOrgProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [lastInviteToken, setLastInviteToken] = useState("");
  const [updates, setUpdates] = useState([]);
  const [errors, setErrors] = useState([]);
  const [restoringSession, setRestoringSession] = useState(true);
  const [objectiveTitle, setObjectiveTitle] = useState("Accelerate digital transformation outcomes");
  const [objectivePeriod, setObjectivePeriod] = useState(currentPeriod);
  const [keyResultTitle, setKeyResultTitle] = useState("Increase initiative ROI above 20%");
  const [keyResultTarget, setKeyResultTarget] = useState(20);

  const canManageOkrs = user?.role === "admin" || user?.role === "analyst";
  const isAdmin = user?.role === "admin";

  const pushError = useCallback((message) => {
    if (!message) return;
    setErrors((prev) => [...prev, { id: nextErrorId(), message }]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const dismissError = useCallback((id) => {
    setErrors((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const formatRequestError = (requestError, fallback) => {
    const details = requestError.response?.data?.details;
    const message = requestError.response?.data?.message || fallback;
    return details ? `${message}: ${details}` : message;
  };

  const syncAccessToken = (nextToken) => {
    setAccessToken(nextToken);
    setToken(nextToken);
  };

  const logout = async () => {
    clearErrors();
    try {
      await api.post("/api/auth/logout");
    } catch (_requestError) {
      // Clear local session even if the server call fails.
    } finally {
      clearAccessToken();
      setToken("");
      setUser(null);
      setOrganization(null);
      setInitiatives([]);
      setOkrs([]);
      setOkrSummary(null);
      setRevenueData([]);
    }
  };

  const authenticate = async () => {
    clearErrors();
    const path = authMode === "register" ? "/register" : "/login";
    const payload =
      authMode === "register"
        ? {
            name,
            email,
            password,
            ...(inviteToken ? { inviteToken } : { organizationName })
          }
        : { email, password };

    try {
      const response = await api.post(`/api/auth${path}`, payload);
      syncAccessToken(response.data.token);
      setUser(response.data.user);
      setOrganization(response.data.organization || null);
      setActiveSection("overview");
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Authentication failed"));
    }
  };

  const runScenario = async () => {
    clearErrors();
    try {
      const response = await axios.post(`${analyticsBaseUrl}/forecast`, {
        investment,
        upliftPercent,
        paybackMonths
      });
      setForecast(response.data);
      if (token) {
        await api.post("/api/strategy/update", {
          type: "scenario-run",
          investment
        });
      }
    } catch (requestError) {
      pushError(
        formatRequestError(
          requestError,
          "Failed to run forecast — is Python analytics running on port 5001?"
        )
      );
    }
  };

  const loadRevenueData = async () => {
    try {
      const response = await axios.get(`${analyticsBaseUrl}/chart-data`);
      setRevenueData(response.data);
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Failed to load revenue chart data"));
    }
  };

  const loadPythonVisuals = async () => {
    if (!getAccessToken()) return;
    setVisualsLoading(true);
    setVisualsError("");
    try {
      const response = await api.get("/api/dashboard/visuals");
      setPythonVisuals(response.data);
    } catch (requestError) {
      const details = requestError.response?.data?.details;
      const message = requestError.response?.data?.message || "Failed to load Python visuals";
      setVisualsError(details ? `${message}: ${details}` : message);
      setPythonVisuals(null);
    } finally {
      setVisualsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    if (!token || !isAdmin) return;
    try {
      const response = await api.get("/api/audit?limit=40");
      setAuditLogs(response.data);
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Failed to load audit log"));
    }
  };

  const loadTeamData = async () => {
    if (!token || !isAdmin) return;
    try {
      const [profileRes, membersRes, invitesRes] = await Promise.all([
        api.get("/api/org/profile"),
        api.get("/api/org/members"),
        api.get("/api/org/invites")
      ]);
      setOrgProfile(profileRes.data);
      setMembers(membersRes.data);
      setInvites(invitesRes.data);
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Failed to load team data"));
    }
  };

  const createInvite = async ({ email, role }) => {
    clearErrors();
    try {
      const response = await api.post("/api/org/invites", { email, role });
      setLastInviteToken(response.data.inviteToken);
      await loadTeamData();
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Failed to create invite"));
    }
  };

  const loadInitiatives = async () => {
    if (!getAccessToken()) return;
    try {
      const response = await api.get("/api/initiatives");
      setInitiatives(response.data);
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Failed to load initiatives"));
    }
  };

  const loadOkrs = async () => {
    if (!getAccessToken()) return;
    try {
      const [okrResponse, summaryResponse] = await Promise.all([
        api.get("/api/okrs"),
        api.get("/api/okrs/summary")
      ]);
      setOkrs(okrResponse.data);
      setOkrSummary(summaryResponse.data);
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Failed to load OKRs"));
    }
  };

  const createInitiative = async () => {
    clearErrors();
    try {
      await api.post("/api/initiatives", {
        name: initiativeName,
        owner: user.name,
        workstream: "Enterprise Transformation",
        status: "planned",
        investment,
        expectedROI: 0.22,
        kpis: [{ name: "Process Efficiency", baseline: 60, target: 85, current: 65 }],
        milestones: [{ title: "Phase 1 Rollout", dueDate: new Date(), status: "planned" }]
      });
      await loadInitiatives();
      await loadPythonVisuals();
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Failed to create initiative"));
    }
  };

  const createOkr = async () => {
    clearErrors();
    try {
      await api.post("/api/okrs", {
        title: objectiveTitle,
        period: objectivePeriod,
        owner: user.name,
        description: "Organization-level objective linked to strategic initiatives.",
        keyResults: [
          {
            title: keyResultTitle,
            metricType: "percent",
            startValue: 0,
            targetValue: keyResultTarget,
            currentValue: 0,
            owner: user.name
          }
        ]
      });
      await loadOkrs();
      await loadPythonVisuals();
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Failed to create OKR"));
    }
  };

  const checkInKeyResult = async (okrId, keyResultId, currentValue) => {
    clearErrors();
    try {
      await api.patch(`/api/okrs/${okrId}/key-results/${keyResultId}`, { currentValue });
      await loadOkrs();
      await loadPythonVisuals();
    } catch (requestError) {
      pushError(formatRequestError(requestError, "Failed to update key result"));
    }
  };

  useEffect(() => {
    configureAuthHandlers({
      onLostSession: () => {
        setToken("");
        setUser(null);
        setOrganization(null);
        setInitiatives([]);
        setOkrs([]);
        setOkrSummary(null);
      }
    });
  }, []);

  useEffect(() => {
    api
      .post("/api/auth/refresh")
      .then((response) => {
        syncAccessToken(response.data.token);
        setOrganization(response.data.organization || null);
        return api.get("/api/auth/me");
      })
      .then((response) => {
        setUser({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          orgId: response.data.orgId
        });
        if (response.data.organization) {
          setOrganization(response.data.organization);
        }
      })
      .catch(() => {
        clearAccessToken();
        setToken("");
      })
      .finally(() => {
        setRestoringSession(false);
      });
  }, []);

  useEffect(() => {
    if (!token || !user) return undefined;

    const socket = io(backendBaseUrl, {
      withCredentials: true,
      auth: { token }
    });

    socket.on("strategy:welcome", (data) => {
      setUpdates((prev) =>
        [{ key: `welcome-${Date.now()}`, text: data.message }, ...prev].slice(0, 5)
      );
    });
    socket.on("strategy:updated", (data) => {
      setUpdates((prev) =>
        [
          {
            key: `update-${data.timestamp}-${prev.length}`,
            text: `${data.update.type} at ${new Date(data.timestamp).toLocaleTimeString()}`
          },
          ...prev
        ].slice(0, 5)
      );
    });
    socket.on("connect_error", (err) => {
      pushError(err.message || "Failed to connect to live updates");
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user, pushError]);

  useEffect(() => {
    if (!user) return;
    loadInitiatives();
    loadOkrs();
    loadPythonVisuals();
    loadRevenueData();
    if (user.role === "admin") {
      loadAuditLogs();
      loadTeamData();
    }
  }, [user?.id, user?.role]);

  if (restoringSession) {
    return <LoadingScreen message="Restoring your strategy workspace..." />;
  }

  if (!user) {
    return (
      <AuthPage
        authMode={authMode}
        name={name}
        email={email}
        password={password}
        organizationName={organizationName}
        inviteToken={inviteToken}
        errors={errors}
        onDismissError={dismissError}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onOrganizationNameChange={setOrganizationName}
        onInviteTokenChange={setInviteToken}
        onAuthenticate={authenticate}
        onToggleMode={() => setAuthMode(authMode === "register" ? "login" : "register")}
      />
    );
  }

  const overviewStats = (
    <div className="stats-grid">
      <StatCard
        label="Active objectives"
        value={okrSummary?.totalObjectives ?? 0}
        hint="Organization-wide OKRs"
      />
      <StatCard
        label="Average progress"
        value={`${okrSummary?.averageProgress ?? 0}%`}
        hint="Across all key results"
        tone="accent"
      />
      <StatCard
        label="At-risk key results"
        value={okrSummary?.atRiskKeyResults ?? 0}
        hint="Needs executive attention"
        tone="warn"
      />
      <StatCard
        label="Initiatives"
        value={initiatives.length}
        hint="Execution workstreams in flight"
      />
    </div>
  );

  const okrSection = (
    <OkrPanel
      okrs={okrs}
      okrSummary={okrSummary}
      canManage={canManageOkrs}
      objectiveTitle={objectiveTitle}
      objectivePeriod={objectivePeriod}
      keyResultTitle={keyResultTitle}
      keyResultTarget={keyResultTarget}
      onObjectiveTitleChange={setObjectiveTitle}
      onObjectivePeriodChange={setObjectivePeriod}
      onKeyResultTitleChange={setKeyResultTitle}
      onKeyResultTargetChange={setKeyResultTarget}
      onCreateOkr={createOkr}
      onCheckIn={checkInKeyResult}
      onRefresh={loadOkrs}
    />
  );

  const initiativesSection = (
    <InitiativesPanel
      initiatives={initiatives}
      canManage={canManageOkrs}
      initiativeName={initiativeName}
      onInitiativeNameChange={setInitiativeName}
      onCreateInitiative={createInitiative}
      onRefresh={loadInitiatives}
    />
  );

  const scenarioSection = (
    <ScenarioLab
      investment={investment}
      upliftPercent={upliftPercent}
      paybackMonths={paybackMonths}
      forecast={forecast}
      onInvestmentChange={setInvestment}
      onUpliftChange={setUpliftPercent}
      onPaybackChange={setPaybackMonths}
      onRunScenario={runScenario}
    />
  );

  const pythonSection = (
    <PythonVisuals
      visuals={pythonVisuals}
      loading={visualsLoading}
      error={visualsError}
      title="Executive Python analytics"
      onRefresh={loadPythonVisuals}
    />
  );

  const teamSection = (
    <TeamPanel
      orgProfile={orgProfile}
      members={members}
      invites={invites}
      onRefresh={loadTeamData}
      onCreateInvite={createInvite}
      lastInviteToken={lastInviteToken}
    />
  );

  const auditSection = <AuditLogPanel logs={auditLogs} onRefresh={loadAuditLogs} />;

  let sectionContent;
  if (activeSection === "overview") {
    sectionContent = (
      <>
        {overviewStats}
        {revenueData.length > 0 ? <RevenueChart data={revenueData} /> : null}
        {pythonSection}
        <div className="dashboard-grid">
          <div>{okrSection}</div>
          <LiveFeed updates={updates} />
        </div>
        <div className="dashboard-grid">
          {scenarioSection}
          {initiativesSection}
        </div>
      </>
    );
  } else if (activeSection === "okrs") {
    sectionContent = (
      <>
        {overviewStats}
        {okrSection}
      </>
    );
  } else if (activeSection === "initiatives") {
    sectionContent = initiativesSection;
  } else if (activeSection === "scenario") {
    sectionContent = scenarioSection;
  } else if (activeSection === "team") {
    sectionContent = teamSection;
  } else if (activeSection === "audit") {
    sectionContent = auditSection;
  } else {
    sectionContent = pythonSection;
  }

  return (
    <AppShell
      user={user}
      organization={organization}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={logout}
      errors={errors}
      onDismissError={dismissError}
    >
      {sectionContent}
    </AppShell>
  );
}
