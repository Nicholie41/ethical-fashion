import { useState } from "react";

export default function TeamPanel({
  orgProfile,
  members,
  invites,
  onRefresh,
  onCreateInvite,
  lastInviteToken
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("executive");

  const submitInvite = async () => {
    await onCreateInvite({ email, role });
    setEmail("");
  };

  return (
    <section className="card elevated">
      <div className="section-header">
        <div>
          <h2>Team & organization</h2>
          <p className="muted">Manage members and invite colleagues to your tenant.</p>
        </div>
        <button className="ghost" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {orgProfile ? (
        <div className="org-stats">
          <div>
            <span className="metric-label">Organization</span>
            <strong>{orgProfile.name}</strong>
          </div>
          <div>
            <span className="metric-label">Slug</span>
            <strong>{orgProfile.slug}</strong>
          </div>
          <div>
            <span className="metric-label">Members</span>
            <strong>{orgProfile.memberCount}</strong>
          </div>
          <div>
            <span className="metric-label">Pending invites</span>
            <strong>{orgProfile.pendingInvites}</strong>
          </div>
        </div>
      ) : null}

      <div className="inline-form">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="colleague@company.com"
        />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="executive">Executive</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
        </select>
        <button className="primary" onClick={submitInvite}>
          Send invite
        </button>
      </div>

      {lastInviteToken ? (
        <div className="alert info">
          Invite token (share securely): <code>{lastInviteToken}</code>
        </div>
      ) : null}

      <h3>Members</h3>
      <ul className="member-list">
        {members.map((member) => (
          <li key={member._id}>
            <strong>{member.name}</strong> · {member.email} · {member.role}
          </li>
        ))}
      </ul>

      <h3>Pending invites</h3>
      {invites.length === 0 ? (
        <p className="muted">No pending invites.</p>
      ) : (
        <ul className="member-list">
          {invites.map((invite) => (
            <li key={invite.id}>
              {invite.email} · {invite.role} · expires {new Date(invite.expiresAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
