import React, { useState, useEffect, useRef } from "react";
import { login, signup, googleLogin } from "../api";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaSignInAlt, FaGoogle, FaFacebookF, FaSpinner, FaMoon, FaSun } from "react-icons/fa";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const ROLES = [
  { value: "", label: "Select Role" },
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
  { value: "admin", label: "Admin" }
];

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("");
  const [adminId, setAdminId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ef_dark_mode') === 'true';
    }
    return false;
  });
  const usernameRef = useRef(null);

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ef_dark_mode', darkMode);
    }
  }, [darkMode]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const googleCredentialHandlerRef = useRef(null);
  const googleInitializedRef = useRef(false);

  // Load Google's Sign-In script once, then initialize it exactly once
  useEffect(() => {
    const initGoogle = () => {
      if (googleInitializedRef.current || !window.google || !GOOGLE_CLIENT_ID) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          // Always call the latest handler, avoiding stale closures over role/navigate
          if (googleCredentialHandlerRef.current) {
            googleCredentialHandlerRef.current(response);
          }
        }
      });
      googleInitializedRef.current = true;
    };

    const existingScript = document.getElementById("google-identity-script");
    if (existingScript) {
      initGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.id = "google-identity-script";
    script.async = true;
    script.onload = initGoogle;
    document.body.appendChild(script);
  }, []);

  const completeAuthSuccess = (result, fallbackRole) => {
    let finalRole =
      result.user && result.user.role
        ? result.user.role.toLowerCase()
        : result.role
        ? result.role.toLowerCase()
        : fallbackRole;

    if (result.user) result.user.role = finalRole;

    onLogin(result.user, result.token, finalRole);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      if (finalRole === "admin") {
        navigate("/admin");
      } else if (finalRole === "supplier") {
        navigate("/supplier-products");
      } else {
        navigate("/");
      }
    }, 1500);
  };

  const handleGoogleCredential = async (response) => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await googleLogin(response.credential, role || "customer");
      if (result.error) {
        setError(result.error);
      } else if (result.token) {
        completeAuthSuccess(result, role || "customer");
      } else {
        setError("No token received from Google sign-in. Please try again.");
      }
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Keep the ref pointing at the latest version of the handler (fresh role/navigate each render)
  useEffect(() => {
    googleCredentialHandlerRef.current = handleGoogleCredential;
  });

  const handleGoogleButtonClick = () => {
    if (!window.google || !GOOGLE_CLIENT_ID) {
      setError("Google sign-in is still loading. Please try again in a moment.");
      return;
    }
    window.google.accounts.id.prompt();
  };

  const resetFields = () => {
    setUsername("");
    setPassword("");
    setConfirm("");
    setRole("");
    setAdminId("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !username ||
      !password ||
      !role ||
      (mode === "signup" && !confirm) ||
      (mode === "login" && role === "admin" && !adminId)
    ) {
      setError("Please fill all fields.");
      setLoading(false);
      return;
    }
    if (mode === "login" && role === "admin" && adminId !== "77338") {
      setError("Invalid Admin ID.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      if (password !== confirm) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const result = await signup(username, password, role);
      console.log("Signup result:", result);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (
        result.token &&
        result.token !== "undefined" &&
        result.token !== null &&
        typeof result.token === "string"
      ) {
        let finalRole =
          result.user && result.user.role
            ? result.user.role.toLowerCase()
            : result.role
            ? result.role.toLowerCase()
            : role;

        if (result.user) result.user.role = finalRole;

        onLogin(result.user, result.token, finalRole);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        if (finalRole === "admin") {
          navigate("/admin");
        } else if (finalRole === "supplier") {
          navigate("/supplier-products");
        } else {
          navigate("/");
        }
        }, 1500);
        setLoading(false);
      } else if (result.message) {
        setError(result.message);
        setMode("login");
        resetFields();
        setLoading(false);
      } else {
        setError("No token received from server. Please try again.");
        setLoading(false);
      }
    } else {
      const result = await login(username, password, role, adminId);
      console.log("Login result:", result);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (
        result.token &&
        result.token !== "undefined" &&
        result.token !== null &&
        typeof result.token === "string"
      ) {
        let finalRole =
          result.user && result.user.role
            ? result.user.role.toLowerCase()
            : result.role
            ? result.role.toLowerCase()
            : role;

        if (result.user) result.user.role = finalRole;

        onLogin(result.user, result.token, finalRole);
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        if (finalRole === "admin") {
          navigate("/admin");
        } else if (finalRole === "supplier") {
          navigate("/supplier-products");
        } else {
          navigate("/");
        }
        }, 1500);
        setLoading(false);
      } else {
        setError("No token received from server. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center py-10 px-2 overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-stone-900 via-stone-800 to-primary' : 'bg-gradient-to-br from-sage/40 via-cloud/80 to-gold/20'}`}>
      <div className={`relative max-w-md w-full rounded-3xl shadow-2xl border-2 ${darkMode ? 'border-primary' : 'border-gold'} p-8 sm:p-12 flex flex-col items-center animate-fade-in backdrop-blur-md ${darkMode ? 'bg-stone-900/80' : 'bg-white/70'} transition-colors duration-500`} style={darkMode ? {background:'rgba(23,23,23,0.8)'} : {background:'rgba(255,255,255,0.7)'}}>
        {/* Dark mode toggle button */}
        <button
          className="absolute top-4 right-4 p-2 rounded-full border-2 border-gold bg-white/80 dark:bg-stone-800 dark:border-primary shadow hover:bg-gold/30 dark:hover:bg-primary/30 transition-colors z-20"
          onClick={() => setDarkMode(v => !v)}
          aria-label="Toggle dark mode"
          type="button"
        >
          {darkMode ? <FaSun className="text-gold text-xl" /> : <FaMoon className="text-primary text-xl" />}
        </button>
        {/* Animated border gradient on hover/focus */}
        <style>{`
          .group:hover, .group:focus-within {
            border-image: linear-gradient(90deg, #ffd166, #e07a5f, #14532d) 1;
          }
        `}</style>
        {/* Blurred colored glow behind card */}
        <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-gold/40 via-primary/20 to-accent/30 blur-2xl opacity-70"></div>
        {/* Logo and brand name */}
        <div className="flex flex-col items-center mb-6 relative">
          {/* Inline SVG logo for consistency with Home page */}
          <span className="inline-block bg-gold rounded-full p-2 mb-2">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#14532d"/>
              <path d="M24 36c-6-4-10-8-10-14 0-5 4-9 10-9s10 4 10 9c0 6-4 10-10 14z" fill="#d1fae5"/>
              <text x="24" y="28" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="bold" fill="#e07a5f">EF</text>
            </svg>
          </span>
          <span className="font-heading text-2xl font-bold tracking-tight text-primary">Ethical Fashion</span>
        </div>
        {/* Leaf float animation */}
        <style>{`
          @keyframes leafFloatLogin {
            0% { transform: translateY(0) rotate(-8deg); }
            50% { transform: translateY(-8px) rotate(8deg); }
            100% { transform: translateY(0) rotate(-8deg); }
          }
          .animate-leaf-float {
            animation: leafFloatLogin 2.5s ease-in-out infinite;
          }
        `}</style>
        <form onSubmit={handleSubmit} className="w-full">
          <h1 className="text-2xl font-heading font-bold text-primary mb-4 text-center">
          {mode === "login" ? "Login" : "Create an Account"}
        </h1>
          {error && <p className="text-red-600 mb-2 text-center font-semibold bg-red-100 border border-red-200 rounded-lg py-2 px-3 animate-fade-in">{error}</p>}
          <div className="relative mb-6">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-lg pointer-events-none"><FaUser /></span>
        <input
              ref={usernameRef}
              className={`peer w-full pl-10 pr-3 py-3 border ${darkMode ? 'border-primary/60 bg-stone-800 text-gold' : 'border-gold/60 bg-sage/10 text-primary'} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-primary' : 'focus:ring-gold'} placeholder-transparent text-base transition-all shadow-sm ${error ? 'animate-shake border-red-400' : ''}`}
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          required
          name="username"
          id="username"
        />
            <label htmlFor="username" className="absolute left-10 top-1/2 -translate-y-1/2 text-stone text-base pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-primary peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-stone peer-placeholder-shown:-translate-y-1/2 -top-3 text-xs bg-white/80 px-1 rounded">
              Username
            </label>
          </div>
          <div className="relative mb-6">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-lg pointer-events-none"><FaLock /></span>
        <input
              className={`peer w-full pl-10 pr-10 py-3 border ${darkMode ? 'border-primary/60 bg-stone-800 text-gold' : 'border-gold/60 bg-sage/10 text-primary'} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-primary' : 'focus:ring-gold'} placeholder-transparent text-base transition-all shadow-sm ${error ? 'animate-shake border-red-400' : ''}`}
          placeholder="Password"
              type={showPassword ? "text" : "password"}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          name="password"
          id="password"
        />
            <label htmlFor="password" className="absolute left-10 top-1/2 -translate-y-1/2 text-stone text-base pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-primary peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-stone peer-placeholder-shown:-translate-y-1/2 -top-3 text-xs bg-white/80 px-1 rounded">
              Password
            </label>
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-accent text-lg focus:outline-none" tabIndex={-1} onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        {mode === "signup" && (
          <>
              <div className="relative mb-6">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-lg pointer-events-none"><FaLock /></span>
            <input
                  className={`peer w-full pl-10 pr-10 py-3 border ${darkMode ? 'border-primary/60 bg-stone-800 text-gold' : 'border-gold/60 bg-sage/10 text-primary'} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-primary' : 'focus:ring-gold'} placeholder-transparent text-base transition-all shadow-sm ${error ? 'animate-shake border-red-400' : ''}`}
              placeholder="Confirm Password"
                  type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              name="confirm"
              id="confirm"
            />
                <label htmlFor="confirm" className="absolute left-10 top-1/2 -translate-y-1/2 text-stone text-base pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-primary peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-stone peer-placeholder-shown:-translate-y-1/2 -top-3 text-xs bg-white/80 px-1 rounded">
                  Confirm Password
                </label>
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-accent text-lg focus:outline-none" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            <select
                className={`w-full border p-2 mb-2 rounded-lg ${darkMode ? 'bg-stone-800 border-primary/60 text-gold' : 'bg-sage/10 border-gold/60 text-primary'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-primary' : 'focus:ring-gold'} placeholder-stone text-base transition-all shadow-sm`}
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              name="role"
              id="role"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value} disabled={r.value === ""}>
                  {r.label}
                </option>
              ))}
            </select>
          </>
        )}
        {mode === "login" && (
          <select
              className={`w-full border p-2 mb-2 rounded-lg ${darkMode ? 'bg-stone-800 border-primary/60 text-gold' : 'bg-sage/10 border-gold/60 text-primary'} focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-primary' : 'focus:ring-gold'} placeholder-stone text-base transition-all shadow-sm`}
            value={role}
            onChange={e => setRole(e.target.value)}
            required
            name="role"
            id="role"
          >
            {ROLES.map(r => (
              <option key={r.value} value={r.value} disabled={r.value === ""}>
                {r.label}
              </option>
            ))}
          </select>
        )}
        {mode === "login" && role === "admin" && (
            <div className="relative mb-6">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-lg pointer-events-none"><FaUserPlus /></span>
          <input
                className={`peer w-full pl-10 pr-3 py-3 border ${darkMode ? 'border-primary/60 bg-stone-800 text-gold' : 'border-gold/60 bg-sage/10 text-primary'} rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-primary' : 'focus:ring-gold'} placeholder-transparent text-base transition-all shadow-sm ${error ? 'animate-shake border-red-400' : ''}`}
            placeholder="Admin ID"
            value={adminId}
            onChange={e => setAdminId(e.target.value)}
            autoComplete="off"
            required
            name="adminId"
            id="adminId"
          />
              <label htmlFor="adminId" className="absolute left-10 top-1/2 -translate-y-1/2 text-stone text-base pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-primary peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-stone peer-placeholder-shown:-translate-y-1/2 -top-3 text-xs bg-white/80 px-1 rounded">
                Admin ID
              </label>
            </div>
        )}
        <button
            className="ripple bg-primary hover:bg-accent text-gold font-bold py-3 px-4 rounded-lg w-full text-lg shadow-lg transition-all border-2 border-gold flex items-center justify-center gap-2 overflow-hidden mt-2 animate-btn-fade disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit"
            disabled={loading}
        >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : (mode === "login" ? <FaSignInAlt className="mr-2" /> : <FaUserPlus className="mr-2" />)}
            {loading ? (mode === "login" ? "Logging in..." : "Creating...") : (mode === "login" ? "Login" : "Create Account")}
          </button>
          {/* Divider for social login */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gold/40" />
            <span className="mx-4 text-stone font-semibold text-sm">or</span>
            <div className="flex-grow h-px bg-gold/40" />
          </div>
          {/* Social login buttons (placeholder) */}
          <div className="flex gap-4 justify-center mb-2">
            <div className="relative group">
              <button
                type="button"
                onClick={handleGoogleButtonClick}
                disabled={googleLoading}
                className="ripple flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gold bg-white/80 hover:bg-sage/40 text-primary font-bold shadow transition-all animate-btn-fade disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? <FaSpinner className="animate-spin text-red-500" /> : <FaGoogle className="text-red-500" />} Google
              </button>
            </div>
            <div className="relative group">
              <button type="button" className="ripple flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gold bg-white/80 hover:bg-sage/40 text-primary font-bold shadow transition-all animate-btn-fade" disabled>
                <FaFacebookF className="text-blue-600" /> Facebook
        </button>
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 rounded bg-stone-800 text-gold text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap shadow-lg">Coming soon!</span>
            </div>
          </div>
      </form>
      <div className="mt-4 text-center">
        {mode === "login" ? (
          <button
            className="text-green-700 underline"
            onClick={() => {
              setMode("signup");
              resetFields();
            }}
          >
            Create an account
          </button>
        ) : (
          <button
            className="text-green-700 underline"
            onClick={() => {
              setMode("login");
              resetFields();
            }}
          >
            Back to login
          </button>
        )}
      </div>
      </div>
      {/* Fade-in animation */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
      `}</style>
      {/* Ripple effect helper */}
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
      {/* Button fade-in animation */}
      <style>{`
        .animate-btn-fade { animation: btnFadeIn 0.8s cubic-bezier(.4,0,.2,1); }
        @keyframes btnFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
      `}</style>
      {/* Shake and floating label animation */}
      <style>{`
        @keyframes animate-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: animate-shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      {/* Confetti burst animation */}
      {showConfetti && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-7xl animate-confetti-burst select-none">
            🎉✨🎊
          </div>
        </div>
      )}
      <style>{`
        @keyframes confetti-burst {
          0% { opacity: 0; transform: scale(0.7) rotate(-10deg); }
          20% { opacity: 1; transform: scale(1.1) rotate(8deg); }
          60% { opacity: 1; transform: scale(1) rotate(-6deg); }
          100% { opacity: 0; transform: scale(0.7) rotate(0deg); }
        }
        .animate-confetti-burst {
          animation: confetti-burst 1.2s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
}