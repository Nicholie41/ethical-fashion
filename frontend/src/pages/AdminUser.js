import React, { useEffect, useState } from "react";

const API_ROOT = "http://localhost:5000";

// Utility for avatar initials
function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(""); // userId or userId+role being processed

  // Fetch users
  useEffect(() => {
    setLoading(true);
    fetch(`${API_ROOT}/api/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Expected an array but got:", data);
          setUsers([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Ban/Unban user
  const toggleBan = async (user) => {
    setProcessing("ban" + user._id);
    try {
      await fetch(`${API_ROOT}/api/users/${user._id}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ banned: !user.banned }),
      });

      setUsers((users) =>
        users.map((u) =>
          u._id === user._id ? { ...u, banned: !user.banned } : u
        )
      );
    } catch (error) {
      console.error("Ban/unban failed", error);
    } finally {
      setProcessing("");
    }
  };

  // Change Role
  const changeRole = async (user, newRole) => {
    setProcessing("role" + user._id);
    try {
      await fetch(`${API_ROOT}/api/users/${user._id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      setUsers((users) =>
        users.map((u) =>
          u._id === user._id ? { ...u, role: newRole } : u
        )
      );
    } catch (error) {
      console.error("Role change failed", error);
    } finally {
      setProcessing("");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-sage/40 via-cloud/80 to-gold/20 py-12 px-6 flex items-center justify-center">
      <div className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto relative overflow-hidden backdrop-blur-sm">
        {/* Premium accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
        
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h2 className="text-4xl font-heading font-bold text-primary mb-4">Loading Users</h2>
          <p className="text-stone/60 text-lg">Please wait while we fetch the user data...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/40 via-cloud/80 to-gold/20 py-12 px-6">
      {/* Subtle premium background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 mb-20 relative overflow-hidden backdrop-blur-sm">
          {/* Premium accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
          
          <div className="relative z-10 text-center">
            <h1 className="text-5xl sm:text-6xl font-black text-primary mb-4">
              Users Management
            </h1>
            <p className="text-stone/60 text-lg max-w-2xl mx-auto leading-relaxed">
              Manage user accounts, roles, and permissions across the platform
            </p>
            <div className="w-40 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6"></div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 relative overflow-hidden backdrop-blur-sm">
          {/* Premium accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
          
          <div className="relative z-10">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary to-accent">
                    <th className="py-6 px-6 text-left text-gold font-bold text-lg">Name</th>
                    <th className="py-6 px-6 text-left text-gold font-bold text-lg">Email</th>
                    <th className="py-6 px-6 text-left text-gold font-bold text-lg">Role</th>
                    <th className="py-6 px-6 text-left text-gold font-bold text-lg">Status</th>
                    <th className="py-6 px-6 text-center text-gold font-bold text-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <div className="text-stone/60 text-xl font-medium">No users found</div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="border-b border-gold/20 hover:bg-sage/20 transition-colors duration-300">
                        <td className="py-6 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-primary to-accent text-gold font-bold text-lg rounded-full border-2 border-gold shadow-lg">
                              {getInitials(user.name || user.username)}
                            </div>
                            <div>
                              <div className="font-bold text-primary text-lg">{user.name || user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-stone/70 font-medium">{user.email}</div>
                        </td>
                        <td className="py-6 px-6">
                          <select
                            value={user.role}
                            onChange={(e) => changeRole(user, e.target.value)}
                            disabled={processing === "role" + user._id}
                            className="border-2 border-gold/20 rounded-xl px-4 py-3 bg-white/80 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all font-medium text-primary shadow-lg hover:shadow-xl"
                          >
                            <option value="customer">Customer</option>
                            <option value="supplier">Supplier</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-6 px-6">
                          {user.banned ? (
                            <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 font-bold px-4 py-2 rounded-full border-2 border-red-200">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Banned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 font-bold px-4 py-2 rounded-full border-2 border-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-6 px-6 text-center">
                          <button
                            onClick={() => toggleBan(user)}
                            className={`px-6 py-3 rounded-2xl font-bold shadow-xl transition-all duration-300 border-2 ${
                              user.banned
                                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-300 hover:shadow-2xl hover:scale-[1.05]"
                                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-300 hover:shadow-2xl hover:scale-[1.05]"
                            } text-white`}
                            disabled={processing === "ban" + user._id}
                          >
                            {user.banned ? "Unban User" : "Ban User"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}