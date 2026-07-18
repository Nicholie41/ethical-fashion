export default function AuthPage({
  authMode,
  name,
  email,
  password,
  organizationName,
  inviteToken,
  errors,
  onDismissError,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onOrganizationNameChange,
  onInviteTokenChange,
  onAuthenticate,
  onToggleMode
}) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark">SE</div>
        <h1>Strategy Execution Platform</h1>
        <p>
          Align objectives, initiatives, and ROI scenarios in one secure workspace for your
          organization.
        </p>
        <ul className="brand-features">
          <li>OKR tracking with live progress</li>
          <li>Role-based initiative management</li>
          <li>Real-time strategy updates</li>
        </ul>
      </div>

      <div className="auth-card card elevated">
        <div className="auth-card-header">
          <h2>{authMode === "register" ? "Create organization" : "Welcome back"}</h2>
          <p className="muted">
            {authMode === "register"
              ? "Set up your tenant and become the founding admin."
              : "Sign in to continue to your strategy dashboard."}
          </p>
        </div>

        {authMode === "register" && (
          <>
            <label htmlFor="name">Your name</label>
            <input id="name" value={name} onChange={(event) => onNameChange(event.target.value)} />
            <label htmlFor="organizationName">Organization name</label>
            <input
              id="organizationName"
              value={organizationName}
              onChange={(event) => onOrganizationNameChange(event.target.value)}
              placeholder="Leave blank if joining via invite token"
            />
            <label htmlFor="inviteToken">Invite token (optional)</label>
            <input
              id="inviteToken"
              value={inviteToken}
              onChange={(event) => onInviteTokenChange(event.target.value)}
              placeholder="Paste invite token to join existing org"
            />
          </>
        )}

        <label htmlFor="email">Work email</label>
        <input id="email" type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />

        {errors.length > 0 ? (
          <div className="alert-stack">
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

        <div className="button-row">
          <button className="primary" onClick={onAuthenticate}>
            {authMode === "register" ? "Create organization" : "Sign in"}
          </button>
          <button className="ghost" onClick={onToggleMode}>
            {authMode === "register" ? "Already have an account?" : "Need a new organization?"}
          </button>
        </div>
      </div>
    </div>
  );
}
