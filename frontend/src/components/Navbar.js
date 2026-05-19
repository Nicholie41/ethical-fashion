import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBell, FaShoppingCart } from 'react-icons/fa';

export default function Navbar({ user, role, onLogout, notifications = [], setNotifications, unreadCount = 0, cartItems = [], onOpenCart }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const bellRef = useRef();
  const prevUnread = useRef(unreadCount);

  // Animate bell when new unread notification arrives
  useEffect(() => {
    if (unreadCount > prevUnread.current) {
      if (bellRef.current) {
        bellRef.current.classList.add('animate-bell-shake');
        setTimeout(() => bellRef.current && bellRef.current.classList.remove('animate-bell-shake'), 700);
      }
    }
    prevUnread.current = unreadCount;
  }, [unreadCount]);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  // Helper for active link styling
  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-2 py-1 rounded transition ${
        location.pathname === to || location.pathname.startsWith(to + "/")
          ? 'bg-green-900 text-yellow-300 font-semibold'
          : 'hover:bg-green-800'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-primary text-gold px-4 py-2 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center">
          <span className="inline-block bg-gold rounded-full p-1 mr-2">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#ffd166"/>
              <path d="M24 36c-6-4-10-8-10-14 0-5 4-9 10-9s10 4 10 9c0 6-4 10-10 14z" fill="#14532d"/>
              <text x="24" y="28" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="bold" fill="#e07a5f">EF</text>
            </svg>
          </span>
        </Link>
        <Link to="/" className="font-heading text-2xl font-bold tracking-tight text-cloud hover:text-gold transition-colors">
          Ethical Fashion
        </Link>
      </div>
      <div className="flex gap-2 items-center">
        {navLink("/products", "Products")}
        {navLink("/brands", "Brands")}
        {user && role === 'supplier' && navLink("/supplier-products", "My Products")}
        {user && role === 'supplier' && navLink("/supplier-brands", "My Brands")}
        {user && role === 'admin' && navLink("/admin", "Admin")}
        {/* Users button only for admin and if logged in */}
        {user && role === 'admin' && navLink("/admin/users", "Users")}
        {user && navLink("/profile", "Profile")}
        {user && (
          <span className="ml-3 text-gold text-sm">
            {user.username && `Hi, ${user.username}`}
          </span>
        )}
        {/* Cart icon for all users */}
        <div className="relative ml-3">
          <button
            className="relative p-2 rounded-full hover:bg-gold/20 focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
            onClick={onOpenCart}
            aria-label="Shopping Cart"
          >
            <FaShoppingCart className="text-2xl text-gold" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-primary animate-pulse">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
        {user ? (
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1 rounded bg-accent hover:bg-gold text-white font-semibold transition-colors"
          >
            Logout
          </button>
        ) : (
          location.pathname !== "/login" && navLink("/login", "Login")
        )}
        {/* Notification bell for logged-in users */}
        {user && (
          <div className="relative">
            <button
              ref={bellRef}
              className="relative p-2 rounded-full hover:bg-gold/20 focus:outline-none focus:ring-2 focus:ring-gold"
              onClick={() => setShowNotif(v => !v)}
              aria-label="Notifications"
            >
              <FaBell className="text-2xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-primary animate-pulse">
                  {unreadCount}
                </span>
              )}
              {/* Audio removed due to 403 error */}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 max-w-xs bg-white text-primary rounded-2xl shadow-2xl border-2 border-gold z-50 animate-fade-in">
                <div className="p-4 border-b border-gold/30 font-bold flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 && setNotifications && (
                    <button
                      className="ml-2 px-3 py-1 rounded bg-primary text-gold text-xs font-bold border border-gold hover:bg-accent hover:text-white transition"
                      onClick={async () => {
                        try {
                          // Mark all unread notifications as read
                          await Promise.all(
                            notifications.filter(n => !n.read).map(n =>
                              fetch(`http://localhost:5000/api/notifications/${n._id}/read`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
                              })
                            )
                          );
                          setNotifications(prev => prev.map(x => ({ ...x, read: true })));
                        } catch {}
                      }}
                    >Mark all as read</button>
                  )}
                  <button className="text-xs text-accent underline" onClick={() => setShowNotif(false)}>Close</button>
                </div>
                <ul className="max-h-80 overflow-y-auto divide-y divide-sage/40">
                  {notifications.length === 0 && (
                    <li className="p-4 text-stone text-sm">No notifications.</li>
                  )}
                  {notifications.map(n => (
                    <li key={n._id || n.date} className={`p-4 text-sm ${!n.read ? 'bg-sage/30 font-semibold' : ''}`}>
                      <div className="flex justify-between items-center gap-2">
                        {n.data && n.data.productId ? (
                          <Link to={`/products/${n.data.productId}`} className="text-primary underline hover:text-accent transition">
                            {n.message}
                          </Link>
                        ) : n.data && n.data.orderId ? (
                          <Link to={`/orders/${n.data.orderId}`} className="text-primary underline hover:text-accent transition">
                            {n.message}
                          </Link>
                        ) : (
                          <span>{n.message}</span>
                        )}
                        {!n.read && setNotifications && (
                          <button
                            className="ml-2 px-2 py-1 rounded bg-gold text-primary text-xs font-bold border border-gold hover:bg-accent hover:text-white transition"
                            onClick={async () => {
                              try {
                                await fetch(`http://localhost:5000/api/notifications/${n._id}/read`, {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
                                });
                                setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
                              } catch {}
                            }}
                          >Mark as read</button>
                        )}
                      </div>
                      <div className="text-xs text-stone mt-1">{new Date(n.date).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}