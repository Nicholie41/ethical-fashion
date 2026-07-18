const BASE_NAV = [
  { id: "overview", label: "Overview", icon: "◫" },
  { id: "okrs", label: "OKRs", icon: "◎" },
  { id: "initiatives", label: "Initiatives", icon: "▣" },
  { id: "scenario", label: "Scenario Lab", icon: "◈" },
  { id: "analytics", label: "Python Analytics", icon: "🐍" }
];

const ADMIN_NAV = [
  { id: "team", label: "Team", icon: "👥" },
  { id: "audit", label: "Audit Log", icon: "🛡" }
];

function roleLabel(role) {
  if (role === "admin") return "Administrator";
  if (role === "analyst") return "Analyst";
  return "Executive";
}

export default function AppShell({
  user,
  organization,
  activeSection,
  onSectionChange,
  onLogout,
  errors,
  onDismissError,
  children
}) {
  const navItems = user.role === "admin" ? [...BASE_NAV, ...ADMIN_NAV] : BASE_NAV;
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark sm">SE</div>
          <div>
            <p className="brand-title">StrategyExec</p>
            <p className="brand-subtitle">{organization?.name || "Organization"}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => onSectionChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <p className="topbar-eyebrow">Strategy Execution Platform</p>
            <h1>{navItems.find((item) => item.id === activeSection)?.label || "Dashboard"}</h1>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <div className="avatar">{initials}</div>
              <div>
                <p className="user-name">{user.name}</p>
                <p className="user-meta">{roleLabel(user.role)}</p>
              </div>
            </div>
            <button className="ghost" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </header>

        {errors.length > 0 ? (
          <div className="alert-stack page-alert">
            {errors.map((entry) => (
              <div key={entry.id} className="alert error alert-dismissible">
                <span>{entry.message}</span>
                <button
                  type="button"
                  className="alert-dismiss"
                  aria-label="Dismiss error"
                  onClick={() => onDismissError(entry.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
