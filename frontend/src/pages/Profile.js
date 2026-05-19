import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaEdit, FaSave, FaTimes, FaSignOutAlt, FaTrashAlt, FaEnvelope, FaBoxOpen, FaCheckCircle, FaClock, FaTimesCircle, FaDollarSign, FaSignInAlt, FaDesktop } from "react-icons/fa";

function Profile({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // Profile editing state
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState("");

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Login activity state
  const [logins, setLogins] = useState([]);
  const [loginsLoading, setLoginsLoading] = useState(true);
  const [loginsError, setLoginsError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setProfile(data);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setOrdersLoading(true);
    fetch("http://localhost:5000/api/orders/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setOrdersError(data.error);
        else setOrders(data);
        setOrdersLoading(false);
      })
      .catch((err) => {
        setOrdersError("Failed to fetch orders.");
        setOrdersLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (profile) {
      setEditUsername(profile.username || "");
      setEditEmail(profile.email || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!token) return;
    setLoginsLoading(true);
    fetch("http://localhost:5000/api/profile/logins", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setLoginsError(data.error);
        else setLogins(data);
        setLoginsLoading(false);
      })
      .catch(() => {
        setLoginsError("Failed to fetch login activity.");
        setLoginsLoading(false);
      });
  }, [token]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const res = await fetch("http://localhost:5000/api/profile/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (data.error) setError(data.error);
    else setMessage(data.message);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleProfileEdit = async (e) => {
    e.preventDefault();
    setEditMessage("");
    setEditError("");
    const res = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: editUsername, email: editEmail }),
    });
    const data = await res.json();
    if (data.error) setEditError(data.error);
    else {
      setEditMessage(data.message);
      setProfile((prev) => ({ ...prev, username: editUsername, email: editEmail }));
      setEditMode(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) {
        setDeleteError(data.error);
        setDeleteLoading(false);
      } else {
        if (onLogout) onLogout();
        navigate("/login");
      }
    } catch (err) {
      setDeleteError("Failed to delete account.");
      setDeleteLoading(false);
    }
  };

  if (!profile && !error)
    return (
      <div className="flex justify-center items-center h-60">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-8 text-red-600">{error}</div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-tr from-sage/30 via-cloud/80 to-gold/10 py-10 px-2">
      <div className="relative bg-white shadow-2xl rounded-3xl p-8 sm:p-12 pt-20 max-w-md sm:max-w-lg md:max-w-xl w-full border-2 border-gold flex flex-col items-center animate-fade-in z-10 overflow-hidden">
        {/* Subtle SVG motif background, top-left of card */}
        <svg className="absolute left-0 top-0 w-40 h-40 sm:w-56 sm:h-56 opacity-10 z-0 pointer-events-none select-none" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="100" cy="100" rx="90" ry="60" fill="url(#ecoGradientCard)" />
          <path d="M40 110 Q90 40 160 90" stroke="#e07a5f" strokeWidth="6" fill="none" opacity="0.5" />
          <path d="M20 160 Q80 120 180 160" stroke="#14532d" strokeWidth="7" fill="none" opacity="0.3" />
          <defs>
            <linearGradient id="ecoGradientCard" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d1fae5" />
              <stop offset="1" stopColor="#ffd166" />
            </linearGradient>
          </defs>
        </svg>
        {/* Avatar - absolute center, overlapping card */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Glowing animated border */}
            <div className="absolute inset-0 rounded-full animate-avatar-glow z-0" />
            {/* Floating eco leaf icon */}
            <svg className="absolute -top-3 -right-3 w-10 h-10 z-20 drop-shadow-lg animate-leaf-float" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="20" rx="18" ry="12" fill="#d1fae5" />
              <path d="M20 8 Q28 18 20 32 Q12 18 20 8 Z" fill="#14532d" />
              <path d="M20 12 Q24 20 20 28 Q16 20 20 12 Z" fill="#e07a5f" opacity="0.7" />
            </svg>
            <div className="relative rounded-full border-4 border-gold shadow-lg p-2 bg-sage/40 w-28 h-28 flex items-center justify-center z-10">
              <span className="text-6xl font-bold text-primary flex items-center justify-center w-full h-full">
                <FaUserCircle className="text-gold text-7xl drop-shadow mr-1" />
              </span>
            </div>
          </div>
        </div>
        {/* Username & Role */}
        <h2 className="text-3xl font-extrabold text-center text-primary mb-1 tracking-wide mt-2 flex items-center justify-center gap-2">
          <FaUserCircle className="text-gold text-2xl" />
          {profile.username}
        </h2>
        <p className="text-center text-md mb-6 font-medium flex items-center justify-center gap-2">
          <span className="font-semibold bg-gold/80 text-primary rounded-full px-3 py-1 border border-gold text-xs uppercase tracking-wide flex items-center gap-1">
            <FaEnvelope className="text-primary text-xs mr-1" />
            {profile.email || "No email"}
          </span>
          <span className="font-semibold bg-gold/80 text-primary rounded-full px-3 py-1 border border-gold text-xs uppercase tracking-wide flex items-center gap-1">
            {profile.role}
          </span>
        </p>
        <div className="w-full flex justify-center mb-2">
          <button
            className="text-xs text-primary underline font-semibold hover:text-accent transition-colors flex items-center gap-1"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? <><FaTimes className="inline-block mr-1" />Cancel Edit</> : <><FaEdit className="inline-block mr-1" />Edit Profile</>}
          </button>
        </div>
        {editMode && (
          <form onSubmit={handleProfileEdit} className="w-full mb-4 space-y-3 animate-fade-in">
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gold rounded focus:outline-none focus:ring-2 focus:ring-gold placeholder-gray-400 bg-sage/20 transition-all"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gold rounded focus:outline-none focus:ring-2 focus:ring-gold placeholder-gray-400 bg-sage/20 transition-all"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="ripple w-full py-2 bg-gold hover:bg-accent text-primary rounded-lg font-bold shadow text-base transition-all border-2 border-gold mt-2 flex items-center justify-center gap-2 overflow-hidden"
              onClick={createRipple}
            >
              <FaSave className="inline-block" /> Save Changes
            </button>
            {(editMessage || editError) && (
              <div className={`text-center mt-2 font-semibold ${editMessage ? "text-green-700" : "text-red-600"}`}>{editMessage || editError}</div>
            )}
          </form>
        )}
        <div className="w-full border-t border-gold/30 my-4"></div>
        {/* Change Password */}
        <form onSubmit={handlePasswordChange} className="space-y-4 w-full">
          <h3 className="font-semibold text-lg text-primary mb-2 text-center">Change Password</h3>
          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-4 py-3 border border-gold rounded focus:outline-none focus:ring-2 focus:ring-gold placeholder-gray-400"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-3 border border-gold rounded focus:outline-none focus:ring-2 focus:ring-gold placeholder-gray-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gold hover:bg-accent text-primary rounded-lg font-bold shadow-lg text-lg transition-all border-2 border-gold"
          >
            Update Password
          </button>
        </form>
        {(message || error) && (
          <p className={`text-center mt-4 font-semibold transition-all ${message ? "text-green-700" : "text-red-600"}`}>
            {message || error}
          </p>
        )}
        {/* Confetti on success */}
        {message && (
          <div className="absolute left-0 right-0 top-[-30px] flex justify-center animate-bounce pointer-events-none">
            <span className="text-3xl">🎉</span>
          </div>
        )}
        <div className="w-full border-t border-gold/30 my-4"></div>
        {/* Logout Button */}
        <button
          className="ripple w-full py-3 bg-primary hover:bg-accent text-gold rounded-lg font-bold shadow-lg text-lg transition-all border-2 border-gold mt-2 flex items-center justify-center gap-2 overflow-hidden"
          onClick={(e) => {
            createRipple(e);
            if (onLogout) onLogout();
            navigate('/login');
          }}
        >
          <FaSignOutAlt className="inline-block mr-1" /> Logout
        </button>
        <button
          className="ripple w-full py-2 mt-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow text-base transition-all border-2 border-red-700 flex items-center justify-center gap-2 overflow-hidden"
          onClick={(e) => { createRipple(e); setShowDeleteModal(true); }}
        >
          <FaTrashAlt className="inline-block mr-1" /> Delete Account
        </button>
        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gold p-8 max-w-sm w-full flex flex-col items-center">
              <h3 className="text-xl font-bold text-red-700 mb-2 text-center">Delete Account?</h3>
              <p className="text-center text-stone mb-4">This action is <span className="font-bold text-red-700">permanent</span> and cannot be undone.<br/>Are you sure you want to delete your account?</p>
              {deleteError && <div className="text-red-600 font-semibold mb-2">{deleteError}</div>}
              <div className="flex gap-4 mt-2">
                <button
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-red-700"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  className="px-4 py-2 rounded bg-sage/60 hover:bg-sage text-primary font-bold border-2 border-gold"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Order History Section */}
      {/* Wavy SVG divider */}
      <svg className="w-full h-8 md:h-10 lg:h-12 -mb-2" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,40 Q360,0 720,40 T1440,40 V60 H0 Z" fill="#d1fae5" />
        <path d="M0,50 Q360,20 720,50 T1440,50 V60 H0 Z" fill="#ffd166" opacity="0.7" />
      </svg>
      <div className="relative max-w-md sm:max-w-lg md:max-w-xl w-full mt-12 bg-white rounded-3xl shadow-xl border-2 border-gold p-6 sm:p-10 overflow-hidden">
        {/* Vertical accent bar */}
        <div className="absolute left-0 top-0 h-full w-3 sm:w-4 rounded-l-3xl bg-gradient-to-b from-primary via-gold to-accent opacity-80 z-0" />
        <div className="relative z-10">
          <h3 className="text-xl font-heading font-bold text-primary mb-4 text-center flex items-center justify-center gap-2 group hover:text-accent transition-colors duration-200">
            <span className="inline-flex items-center group-hover:scale-110 group-hover:text-accent transition-transform duration-200">
              <FaBoxOpen className="text-gold text-2xl" />
            </span> Order History
          </h3>
          {ordersLoading ? (
            <div className="text-center text-gray-500">Loading orders...</div>
          ) : ordersError ? (
            <div className="text-center text-red-600">{ordersError}</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-400">No orders found.</div>
          ) : (
            <ul className="flex flex-col gap-6 animate-fade-in">
              {orders.map((order) => {
                let statusIcon = <FaClock className="text-yellow-500 mr-1" />;
                let statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
                if (order.status === "completed" || order.status === "delivered") {
                  statusIcon = <FaCheckCircle className="text-green-600 mr-1" />;
                  statusColor = "bg-green-100 text-green-800 border-green-200";
                } else if (order.status === "cancelled") {
                  statusIcon = <FaTimesCircle className="text-red-600 mr-1" />;
                  statusColor = "bg-red-100 text-red-800 border-red-200";
                }
                return (
                  <li key={order._id} className="rounded-2xl border border-gold/30 bg-sage/10 shadow hover:shadow-lg transition-shadow p-5 group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-primary flex items-center gap-2">
                        <FaBoxOpen className="text-gold text-lg" /> Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`text-xs rounded-full px-2 py-0.5 border font-semibold uppercase flex items-center gap-1 ${statusColor}`}>
                        {statusIcon} {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-stone mb-1">{new Date(order.createdAt).toLocaleString()}</div>
                    <ul className="ml-2 mb-1">
                      {order.items.map((item, idx) => (
                        <li key={item.productId + (item.size || '') + (item.color || '') + idx} className="text-xs text-stone flex flex-wrap gap-2 items-center">
                          <span className="font-semibold text-primary">{item.name}</span>
                          {item.size && <span className="bg-gold/40 text-primary px-2 py-0.5 rounded-full border border-gold/40 text-xs">Size: {item.size}</span>}
                          {item.color && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 text-xs">Color: {item.color}</span>}
                          <span className="text-xs">x{item.quantity}</span>
                          <span className="text-xs text-primary font-bold">${Number(item.price).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-semibold text-primary flex items-center gap-1"><FaDollarSign className="text-gold mr-1" /> Total:</span>
                      <span className="font-bold text-gold">${Number(order.total).toFixed(2)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <style>{`
            .animate-fade-in { animation: fadeIn 0.7s ease; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
          `}</style>
        </div>
      </div>
      {/* Login Activity Section */}
      {/* Wavy SVG divider */}
      <svg className="w-full h-8 md:h-10 lg:h-12 -mb-2" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,40 Q360,0 720,40 T1440,40 V60 H0 Z" fill="#d1fae5" />
        <path d="M0,50 Q360,20 720,50 T1440,50 V60 H0 Z" fill="#ffd166" opacity="0.7" />
      </svg>
      <div className="relative max-w-md sm:max-w-lg md:max-w-xl w-full mt-12 bg-white rounded-3xl shadow-xl border-2 border-gold p-6 sm:p-10 overflow-hidden">
        {/* Vertical accent bar */}
        <div className="absolute left-0 top-0 h-full w-3 sm:w-4 rounded-l-3xl bg-gradient-to-b from-primary via-gold to-accent opacity-80 z-0" />
        <div className="relative z-10">
          <h3 className="text-xl font-heading font-bold text-primary mb-4 text-center flex items-center justify-center gap-2 group hover:text-accent transition-colors duration-200">
            <span className="inline-flex items-center group-hover:scale-110 group-hover:text-accent transition-transform duration-200">
              <FaSignInAlt className="text-gold text-2xl" />
            </span> Login Activity
          </h3>
          {loginsLoading ? (
            <div className="text-center text-gray-500">Loading login activity...</div>
          ) : loginsError ? (
            <div className="text-center text-red-600">{loginsError}</div>
          ) : logins.length === 0 ? (
            <div className="text-center text-gray-400">No login activity found.</div>
          ) : (
            <ul className="flex flex-col gap-4 animate-fade-in">
              {logins.map((login, idx) => (
                <li key={idx} className="rounded-xl border border-gold/20 bg-sage/10 shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-sm text-stone flex items-center gap-2">
                    <FaClock className="text-gold mr-1" /> {new Date(login.date).toLocaleString()}
                  </span>
                  <span className="text-xs bg-gold/40 text-primary rounded-full px-2 py-0.5 border border-gold/40 font-semibold flex items-center gap-1">
                    <FaDesktop className="text-primary mr-1" /> {login.device}
                  </span>
                  <span className="text-xs bg-cloud text-stone rounded-full px-2 py-0.5 border border-gold/20 font-semibold">{login.ip}</span>
                </li>
              ))}
            </ul>
          )}
          <style>{`
            .animate-fade-in { animation: fadeIn 0.7s ease; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
          `}</style>
        </div>
      </div>
      {/* Add fade-in animation */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
      `}</style>
      {/* Avatar glow animation */}
      <style>{`
        @keyframes avatarGlow {
          0% { box-shadow: 0 0 0 0 rgba(224,122,95,0.25), 0 0 0 0 rgba(20,83,45,0.18); }
          50% { box-shadow: 0 0 32px 8px rgba(224,122,95,0.35), 0 0 48px 16px rgba(20,83,45,0.22); }
          100% { box-shadow: 0 0 0 0 rgba(224,122,95,0.25), 0 0 0 0 rgba(20,83,45,0.18); }
        }
        .animate-avatar-glow {
          animation: avatarGlow 2.5s infinite;
          border-radius: 9999px;
          width: 100%;
          height: 100%;
          position: absolute;
          z-index: 0;
        }
      `}</style>
      {/* Leaf float animation */}
      <style>{`
        @keyframes leafFloat {
          0% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-10px) rotate(8deg); }
          100% { transform: translateY(0) rotate(-8deg); }
        }
        .animate-leaf-float {
          animation: leafFloat 2.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Profile;

// Ripple effect helper
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
  circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
  circle.classList.add("ripple-effect");
  const ripple = button.getElementsByClassName("ripple-effect")[0];
  if (ripple) ripple.remove();
  button.appendChild(circle);
}
// Ripple effect CSS
// Add this at the end of the file
<style>{`
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    background: rgba(224,122,95,0.25);
    pointer-events: none;
    z-index: 20;
  }
  @keyframes ripple {
    to {
      transform: scale(2.5);
      opacity: 0;
    }
  }
`}</style>