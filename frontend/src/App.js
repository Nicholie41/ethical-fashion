import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import CartSidebar from "./components/CartSidebar";
import Admin from "./pages/admin";
import SupplierProducts from "./pages/SupplierProducts";
import SupplierBrands from "./pages/SupplierBrands";
import ProductsPage from "./pages/Products";
import BrandsPage from "./pages/Brands";
import LoginPage from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import BrandDetails from "./pages/BrandDetails";
import Home from "./pages/Home";
import AutoLogout from "./components/AutoLogout";
import Profile from "./pages/Profile";
import AdminUser from "./pages/AdminUser";
import PaymentPage from "./pages/PaymentPage";
import UserTesting from "./pages/UserTesting";
import Analytics from "./pages/Analytics";
import SecurityImplementation from "./pages/SecurityImplementation";

// Page Transition Component
function PageTransition({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [children]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-8'
      }`}
    >
      {children}
    </div>
  );
}

function safeParse(val) {
  if (!val || val === "undefined") return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return safeParse(storedUser);
  });
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken && storedToken !== "undefined" ? storedToken : null;
  });
  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem("role");
    return storedRole || (safeParse(localStorage.getItem("user"))?.role ?? null);
  });

  // Cart state lifted here
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1),
    0
  );
  
  function handleAddToCart(product) {
    setCartItems(prev => {
      // Create a unique key for the item based on id, size, and color
      const itemKey = `${product.id}-${product.size || 'no-size'}-${product.color || 'no-color'}`;
      
      // Check if an item with the same id, size, and color already exists
      const exists = prev.find(item => 
        item.id === product.id && 
        item.size === product.size && 
        item.color === product.color
      );
      
      if (exists) {
        // Update quantity of existing item
        return prev.map(item =>
          item.id === product.id && 
          item.size === product.size && 
          item.color === product.color
            ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) }
            : item
        );
      }
      // Add new item with quantity
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  }
  
  function handleUpdateQuantity(uniqueKey, newQuantity) {
    if (newQuantity <= 0) {
      handleRemoveFromCart(uniqueKey);
      return;
    }
    setCartItems(prev => 
      prev.map(item => {
        const itemKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`;
        return itemKey === uniqueKey 
          ? { ...item, quantity: newQuantity }
          : item;
      })
    );
  }
  
  function handleRemoveFromCart(uniqueKey) {
    setCartItems(prev => prev.filter(item => {
      const itemKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`;
      return itemKey !== uniqueKey;
    }));
  }
  
  function handleClearCart() {
    setCartItems([]);
  }
  
  function handleCheckout() {
    setCartOpen(false);
    // Navigate to payment page or show payment modal
    window.location.href = '/payment';
  }
  
  function handleOpenCart() {
    setCartOpen(true);
  }

  useEffect(() => {
    console.log("App user:", user);
    console.log("App role:", role);
    console.log("App token:", token);
  }, [user, role, token]);

  const handleLogin = (userObj, tokenStr, roleStr) => {
    const actualRole = roleStr
      ? roleStr.toLowerCase()
      : userObj.role
      ? userObj.role.toLowerCase()
      : null;
    const fullUserObj = { ...userObj, role: actualRole };
    setUser(fullUserObj);
    setToken(tokenStr);
    setRole(actualRole);
    localStorage.setItem("user", JSON.stringify(fullUserObj));
    localStorage.setItem("token", tokenStr);
    localStorage.setItem("role", actualRole);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  useEffect(() => {
    const syncFromStorage = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");
      setUser(safeParse(storedUser));
      setToken(storedToken && storedToken !== "undefined" ? storedToken : null);
      setRole(storedRole || (safeParse(storedUser)?.role ?? null));
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setRole(null);
    }
  }, [token]);

  // Sync cartItems to localStorage for payment page
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.read).length;
  // Fetch notifications for logged-in user
  useEffect(() => {
    async function fetchNotifications() {
      if (!token) return setNotifications([]);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Handle both array and object with notifications property
          setNotifications(Array.isArray(data) ? data : (data.notifications || []));
        } else {
          setNotifications([]);
        }
      } catch {
        setNotifications([]);
      }
    }
    fetchNotifications();
  }, [token]);

  const RequireRole = ({ role: requiredRole, children }) => {
    if (!role || role !== requiredRole || !token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      {user && token && <AutoLogout onLogout={handleLogout} />}
      <Navbar 
        user={user} 
        role={role} 
        onLogout={handleLogout} 
        notifications={notifications} 
        setNotifications={setNotifications} 
        unreadCount={unreadCount}
        cartItems={cartItems}
        onOpenCart={handleOpenCart}
      />
      <PageTransition>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/brands" element={<BrandsPage user={user} />} />
        <Route path="/products" element={<ProductsPage user={user} />} />
        <Route path="/brands/:id" element={<BrandDetails user={user} />} />
        <Route
          path="/products/:id"
          element={
            <ProductDetails
              user={user}
              cartItems={cartItems}
              totalPrice={totalPrice}
              onAddToCart={handleAddToCart}
              onCheckout={handleCheckout}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <Admin user={user} token={token} />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole role="admin">
              <AdminUser user={user} token={token} />
            </RequireRole>
          }
        />
        <Route
          path="/supplier-products"
          element={
            <RequireRole role="supplier">
              <SupplierProducts user={user} token={token} />
            </RequireRole>
          }
        />
        <Route
          path="/supplier-brands"
          element={
            <RequireRole role="supplier">
              <SupplierBrands user={user} token={token} />
            </RequireRole>
          }
        />
        <Route
          path="/profile"
          element={
            user && token ? (
              <Profile token={token} user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/user-testing" element={<UserTesting />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/security" element={<SecurityImplementation />} />
      </Routes>
      </PageTransition>
      
      {/* Cart Sidebar */}
      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onAdd={handleAddToCart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onClear={handleClearCart}
        totalPrice={totalPrice}
        onCheckout={handleCheckout}
      />
    </Router>
  );
}

export default App;