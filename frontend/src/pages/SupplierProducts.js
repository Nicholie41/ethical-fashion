import React, { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaHourglassHalf, FaSave, FaTimes, FaBoxOpen, FaPlus, FaImage, FaPen, FaTrashAlt, FaEye, FaMousePointer, FaShoppingCart, FaHistory } from "react-icons/fa";

/**
 * SupplierProducts page
 * Shows supplier's uploaded products (pending & approved), lets them add, edit, or delete products.
 * Expects props: user (object with .username, .role), token (JWT string)
 */
export default function SupplierProducts({ user, token }) {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editImage, setEditImage] = useState(null);
  const fileInputRef = useRef();
  const editFileInputRef = useRef();
  const [analytics, setAnalytics] = useState({});
  const [stats, setStats] = useState(null);
  const [showHistoryId, setShowHistoryId] = useState(null);
  const [history, setHistory] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Load supplier's products from backend using /api/products/mine
  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    }
  };

  // Load supplier's brands
  const loadBrands = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/brands/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      } else {
        setBrands([]);
      }
    } catch {
      setBrands([]);
    }
  };

  useEffect(() => {
    if (user && typeof user.role === "string" && user.role.toLowerCase() === "supplier") {
      loadProducts();
      loadBrands();
    }
    // eslint-disable-next-line
  }, [user]);

  // Fetch analytics for all products after products load
  useEffect(() => {
    async function fetchAllAnalytics() {
      if (!products.length) return;
      const newAnalytics = {};
      for (const p of products) {
        try {
          const res = await fetch(`http://localhost:5000/api/products/${p._id}/analytics`);
          if (res.ok) {
            newAnalytics[p._id] = await res.json();
          }
        } catch {}
      }
      setAnalytics(newAnalytics);
    }
    fetchAllAnalytics();
  }, [products]);

  // Fetch supplier stats on mount
  useEffect(() => {
    async function fetchStats() {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/products/mine/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setStats(await res.json());
      } catch {}
    }
    fetchStats();
  }, [token]);

  // Handle product upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!name || !image || !selectedBrand) {
      setMessage("Please enter a product name, select a brand, and select an image.");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", selectedBrand);
    formData.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        setMessage("Product submitted! Awaiting approval.");
        setName("");
        setSelectedBrand("");
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadProducts();
      } else {
        const errRes = await res.json();
        setMessage(errRes.error || "Upload failed.");
      }
    } catch (err) {
      setMessage("Network error.");
    }
  };

  // Start edit
  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditName(product.name);
    setEditBrand(product.brand?._id || "");
    setEditImage(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditBrand("");
    setEditImage(null);
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!editName || !editBrand) {
      setMessage("Product name and brand required.");
      return;
    }
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("brand", editBrand);
    if (editImage) formData.append("image", editImage);

    try {
      const res = await fetch(`http://localhost:5000/api/products/${editingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        setMessage("Product updated.");
        setEditingId(null);
        loadProducts();
      } else {
        const errRes = await res.json();
        setMessage(errRes.error || "Edit failed.");
      }
    } catch (err) {
      setMessage("Network error.");
    }
  };

  // Delete
  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setMessage("");
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setMessage("Product deleted.");
        loadProducts();
      } else {
        setMessage("Delete failed.");
      }
    } catch (err) {
      setMessage("Network error.");
    }
  };

  if (!user || typeof user.role !== "string" || user.role.toLowerCase() !== "supplier") {
    return (
      <div className="max-w-xl mx-auto mt-8 text-red-600">
        Unauthorized: Only suppliers can access this page.
      </div>
    );
  }

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

  // Fetch approval history when showHistoryId changes
  useEffect(() => {
    async function fetchHistory() {
      if (!showHistoryId) return;
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const res = await fetch(`http://localhost:5000/api/products/${showHistoryId}/approval-history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setHistory(await res.json());
        } else {
          setHistoryError("Failed to fetch approval history.");
        }
      } catch {
        setHistoryError("Failed to fetch approval history.");
      }
      setHistoryLoading(false);
    }
    fetchHistory();
  }, [showHistoryId, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/40 via-cloud/80 to-gold/20 py-10 px-2 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-sage rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-accent rounded-full blur-3xl"></div>
      </div>
      {/* Logo and brand name at the top */}
      <div className="flex flex-col items-center mb-6">
        <span className="inline-block bg-gold rounded-full p-2 mb-2">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#14532d"/>
            <path d="M24 36c-6-4-10-8-10-14 0-5 4-9 10-9s10 4 10 9c0 6-4 10-10 14z" fill="#d1fae5"/>
            <text x="24" y="28" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="bold" fill="#e07a5f">EF</text>
          </svg>
        </span>
        <span className="font-heading text-2xl font-bold tracking-tight text-primary">Ethical Fashion</span>
      </div>
      <div className="relative w-full flex flex-col items-center px-2 sm:px-0">
        <div className="w-full max-w-2xl mx-auto">
          {stats && (
            <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in">
              <div className="bg-white/90 border-2 border-gold rounded-3xl shadow-xl p-6 flex flex-col gap-4">
                <h2 className="text-xl font-heading font-bold text-primary mb-2 flex items-center gap-2">
                  <FaBoxOpen className="text-gold text-2xl" /> Supplier Dashboard
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
                  <div className="flex flex-col items-center bg-sage/40 rounded-xl p-3 border border-sage/30">
                    <span className="text-2xl font-bold text-primary">{stats.totalProducts}</span>
                    <span className="text-xs text-stone">Total Products</span>
                  </div>
                  <div className="flex flex-col items-center bg-sage/40 rounded-xl p-3 border border-sage/30">
                    <span className="text-2xl font-bold text-gold">{stats.approvedProducts}</span>
                    <span className="text-xs text-stone">Approved</span>
                  </div>
                  <div className="flex flex-col items-center bg-sage/40 rounded-xl p-3 border border-sage/30">
                    <span className="text-2xl font-bold text-accent">{stats.pendingProducts}</span>
                    <span className="text-xs text-stone">Pending</span>
                  </div>
                  <div className="flex flex-col items-center bg-sage/40 rounded-xl p-3 border border-sage/30 col-span-2 sm:col-span-1">
                    <span className="text-2xl font-bold text-primary">{stats.totalSales}</span>
                    <span className="text-xs text-stone">Total Sales</span>
                  </div>
                  <div className="flex flex-col items-center bg-sage/40 rounded-xl p-3 border border-sage/30 col-span-2 sm:col-span-1">
                    <span className="text-2xl font-bold text-gold">${stats.totalRevenue.toFixed(2)}</span>
                    <span className="text-xs text-stone">Total Revenue</span>
                  </div>
                </div>
                {stats.recentOrders && stats.recentOrders.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold text-primary mb-1">Recent Orders</div>
                    <ul className="divide-y divide-sage/40">
                      {stats.recentOrders.map(order => (
                        <li key={order.orderId} className="py-2 text-xs flex flex-col gap-1">
                          <span className="font-bold text-stone">Order #{order.orderId.slice(-6).toUpperCase()} <span className="text-primary">({new Date(order.date).toLocaleDateString()})</span></span>
                          <span className="text-stone">Status: <span className="font-semibold text-primary">{order.status}</span></span>
                          <span className="text-stone">Total: <span className="font-semibold text-gold">${order.total.toFixed(2)}</span></span>
                          <span className="text-stone">Items: {order.items.map(i => `${i.name} x${i.quantity}`).join(", ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          <h2 className="text-2xl font-heading font-extrabold mb-4 text-primary tracking-tight drop-shadow flex items-center justify-center gap-2 relative">
            <FaBoxOpen className="text-gold text-2xl mr-1" />
            Your Products
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-24 h-1 bg-gold rounded-full" />
          </h2>
      {products.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mb-8 animate-fade-in">
              <FaBoxOpen className="text-gold text-5xl mb-2" />
              <div className="text-gray-500 font-medium mb-2">You haven’t submitted any products yet.</div>
              <div className="text-primary font-semibold">Use the form below to add your first product!</div>
        </div>
      )}
          <ul className="flex flex-col gap-6 sm:gap-8 mb-10 w-full">
        {products.map((p, index) =>
          editingId === p._id ? (
                <li key={p._id} className="bg-sage/40 border-4 border-accent rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col gap-2 animate-fade-in animate-edit-mode relative transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                  <span className="absolute top-2 right-4 text-accent font-bold text-xs animate-pulse">Editing...</span>
                  <form onSubmit={handleSaveEdit} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <FaBoxOpen className="text-gold text-xl" />
                <input
                        className="border border-gold p-2 rounded-lg focus:ring-2 focus:ring-gold font-bold text-primary flex-1"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                    </div>
                <select
                      className="border border-gold p-2 rounded-lg focus:ring-2 focus:ring-gold"
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand =>
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  )}
                </select>
                    <div className="flex items-center gap-2">
                      <FaImage className="text-primary text-lg" />
                <input
                        className="border border-gold p-2 rounded-lg flex-1"
                  type="file"
                  accept="image/*"
                  ref={editFileInputRef}
                  onChange={(e) => setEditImage(e.target.files[0])}
                />
                    </div>
                    <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                        className="flex items-center gap-1 bg-primary hover:bg-accent text-gold px-4 py-2 rounded-lg font-bold shadow border-2 border-gold transition-all ripple"
                  >
                        <FaSave /> Save
                  </button>
                  <button
                    type="button"
                        className="flex items-center gap-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-bold shadow border-2 border-gray-400 transition-all"
                    onClick={handleCancelEdit}
                  >
                        <FaTimes /> Cancel
                  </button>
                </div>
              </form>
            </li>
          ) : (
                <li key={p._id} className="bg-white border-2 border-gold rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 group transition-all duration-300 animate-card-in relative overflow-hidden w-full hover:scale-[1.02] hover:shadow-2xl hover:border-gold/80" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Subtle SVG motif background */}
                  <svg className="absolute right-0 bottom-0 w-24 h-16 opacity-10 pointer-events-none select-none z-0" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="50" cy="20" rx="40" ry="12" fill="#ffd166" />
                    <path d="M20 30 Q50 10 80 30" stroke="#e07a5f" strokeWidth="3" fill="none" opacity="0.5" />
                  </svg>
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 z-10 w-full">
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-xl border-2 border-gold shadow z-10 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <span className="font-bold text-primary text-base sm:text-lg truncate max-w-[8rem] sm:max-w-[10rem]" title={p.name}>{p.name}</span>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 animate-badge-appear transition-all duration-300 w-fit ${p.approved ? 'bg-gold/80 text-primary border-gold' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>{p.approved ? <FaCheckCircle className="text-green-600" /> : <FaHourglassHalf className="text-yellow-600" />} {p.approved ? 'Approved' : <span className="group relative">Pending <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded bg-stone-800 text-gold text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap shadow-lg">Pending admin approval</span></span>}</span>
                      </div>
                      <div className="text-stone text-xs sm:text-sm truncate font-medium mb-1">{p.brand?.name}</div>
                      {p.price && <div className="text-accent font-bold text-sm sm:text-base mt-1">${Number(p.price).toFixed(2)}</div>}
                    </div>
                  </div>
                  {/* Analytics badges */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-xs font-semibold">
                    <span className="flex items-center gap-1 bg-sage/60 text-primary px-2 py-1 rounded-full border border-sage/40 animate-badge-appear" style={{ animationDelay: '0.2s' }}><FaEye className="text-gold" />{analytics[p._id]?.views ?? 0} Views</span>
                    <span className="flex items-center gap-1 bg-sage/60 text-primary px-2 py-1 rounded-full border border-sage/40 animate-badge-appear" style={{ animationDelay: '0.3s' }}><FaMousePointer className="text-gold" />{analytics[p._id]?.clicks ?? 0} Clicks</span>
                    <span className="flex items-center gap-1 bg-sage/60 text-primary px-2 py-1 rounded-full border border-sage/40 animate-badge-appear" style={{ animationDelay: '0.4s' }}><FaShoppingCart className="text-gold" />{analytics[p._id]?.salesCount ?? 0} Sales</span>
                  </div>
                  <div className="flex flex-row gap-2 sm:gap-3 items-center min-w-[100px] sm:min-w-[120px] mt-4 sm:mt-0 z-10 justify-end">
                    <button
                      className="flex items-center justify-center bg-black hover:bg-gold text-gold hover:text-black border-2 border-gold px-3 sm:px-4 py-2 rounded-full shadow-lg text-lg sm:text-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gold transform hover:scale-110 ripple animate-btn-appear"
                      onClick={e => { createRipple(e); handleEdit(p); }}
                      title="Edit"
                      style={{ minWidth: 40, minHeight: 40, animationDelay: '0.5s' }}
                    >
                      <FaPen />
                    </button>
              <button
                      className="flex items-center justify-center bg-black hover:bg-gold text-gold hover:text-black border-2 border-gold px-3 sm:px-4 py-2 rounded-full shadow-lg text-lg sm:text-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gold transform hover:scale-110 ripple animate-btn-appear"
                      onClick={e => { createRipple(e); handleDelete(p._id); }}
                      title="Delete"
                      style={{ minWidth: 40, minHeight: 40, animationDelay: '0.6s' }}
              >
                      <FaTrashAlt />
              </button>
              <button
                      className="flex items-center justify-center bg-white hover:bg-sage text-primary border-2 border-gold px-3 sm:px-4 py-2 rounded-full shadow text-base sm:text-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gold animate-btn-appear"
                      onClick={() => setShowHistoryId(p._id)}
                      title="View Approval History"
                      style={{ minWidth: 40, minHeight: 40, animationDelay: '0.7s' }}
                    >
                      <FaHistory />
              </button>
                  </div>
            </li>
          )
        )}
      </ul>
          {/* Wavy SVG divider */}
          <svg className="w-full h-8 md:h-10 lg:h-12 -mb-2" viewBox="0 0 600 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 Q150,0 300,30 T600,30 V40 H0 Z" fill="#d1fae5" />
            <path d="M0,35 Q150,10 300,35 T600,35 V40 H0 Z" fill="#ffd166" opacity="0.7" />
          </svg>
          <div className="w-full max-w-2xl mx-auto mt-10 animate-fade-in">
            <div className="bg-white/90 border-2 border-gold rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden">
              {/* Subtle form background pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-sage/5 rounded-full blur-2xl"></div>
              
              <h2 className="text-xl font-heading font-bold text-primary mb-2 flex items-center gap-2 relative z-10">
                <FaPlus className="text-gold mr-1" /> Add New Product
              </h2>
              <div className="text-stone text-sm mb-4 relative z-10">Add your product to the catalog. Please use high quality images for best results.</div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <FaBoxOpen className="text-gold text-lg flex-shrink-0 mt-2 sm:mt-0" />
        <input
                    className="border border-gold p-3 rounded-lg w-full focus:ring-2 focus:ring-gold font-bold text-primary transition-all hover:border-gold/80"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <FaBoxOpen className="text-gold text-lg flex-shrink-0 mt-2 sm:mt-0" />
        <select
                    className="border border-gold p-3 rounded-lg w-full focus:ring-2 focus:ring-gold transition-all hover:border-gold/80"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          required
        >
          <option value="">Select Brand</option>
          {brands.map(brand =>
            <option key={brand._id} value={brand._id}>
              {brand.name}
            </option>
          )}
        </select>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <FaImage className="text-primary text-lg flex-shrink-0 mt-2 sm:mt-0" />
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        <input
                    className="border border-gold p-3 rounded-lg w-full transition-all hover:border-gold/80"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setImage(e.target.files[0])}
        />
                  {image && (
                    <img src={URL.createObjectURL(image)} alt="Preview" className="w-12 h-12 object-cover rounded-lg border-2 border-gold flex-shrink-0" />
                  )}
                  </div>
                </div>
        <button
                  className="ripple bg-primary hover:bg-accent text-gold font-bold py-3 px-4 rounded-lg w-full text-lg shadow-lg transition-all border-2 border-gold flex items-center justify-center gap-2 overflow-hidden mt-2 animate-btn-fade disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-xl"
          type="submit"
        >
                  <FaPlus className="mr-2" /> Upload Product
        </button>
      </form>
          {message && <div className="mt-2 text-blue-700 font-semibold animate-fade-in relative z-10">{message}</div>}
        </div>
      </div>
      {/* Wavy SVG divider */}
      <svg className="w-full h-8 md:h-10 lg:h-12 -mb-2" viewBox="0 0 600 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,30 Q150,0 300,30 T600,30 V40 H0 Z" fill="#d1fae5" />
        <path d="M0,35 Q150,10 300,35 T600,35 V40 H0 Z" fill="#ffd166" opacity="0.7" />
      </svg>
      {showHistoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gold p-8 max-w-lg w-full flex flex-col items-center">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2"><FaHistory className="text-gold" /> Approval History</h3>
            {historyLoading ? (
              <div className="text-stone mb-4">Loading...</div>
            ) : historyError ? (
              <div className="text-red-600 mb-4">{historyError}</div>
            ) : (
              <>
                {history.approvalHistory && history.approvalHistory.length > 0 ? (
                  <div className="relative w-full mb-4">
                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-sage/60 rounded-full" style={{ zIndex: 0 }} />
                    <ul className="space-y-6 pl-0">
                      {history.approvalHistory.map((h, idx) => {
                        const isLatest = idx === history.approvalHistory.length - 1;
                        return (
                          <li key={idx} className={`relative flex items-start gap-4 group transition-all duration-200 ${isLatest ? 'ring-2 ring-gold bg-gold/10 shadow-lg' : 'opacity-80'}`}> 
                            {/* Timeline icon */}
                            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg z-10
                              ${h.status === 'approved' ? 'bg-green-100 border-green-400 text-green-700' : h.status === 'rejected' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-yellow-100 border-yellow-400 text-yellow-700'}
                              ${isLatest ? 'ring-2 ring-gold scale-110' : ''}`}
                              >
                              {h.status === 'approved' ? <FaCheckCircle className="text-green-600 text-xl" /> : h.status === 'rejected' ? <FaTimes className="text-red-600 text-xl" /> : <FaHourglassHalf className="text-yellow-600 text-xl" />}
                            </span>
                            <div className={`flex-1 bg-sage/20 rounded-xl p-3 border border-sage/40 shadow-sm group-hover:bg-sage/40 transition-all ${isLatest ? 'border-gold bg-gold/10' : ''}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold text-base ${h.status === 'approved' ? 'text-green-700' : h.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'}`}>{h.status.charAt(0).toUpperCase() + h.status.slice(1)}</span>
                                <span className="text-xs text-stone">{new Date(h.date).toLocaleString()}</span>
                                {isLatest && <span className="ml-2 px-2 py-0.5 rounded-full bg-gold text-primary text-xs font-bold border border-gold">Current Status</span>}
                              </div>
                              {h.admin && <span className="text-xs text-stone">By: {h.admin.username || h.admin.email || h.admin}</span>}
                              {h.feedback && <span className="block text-xs text-accent mt-1">Feedback: {h.feedback}</span>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="text-stone mb-4">No approval history yet.</div>
                )}
                {history.adminFeedback && (
                  <div className="w-full bg-gold/20 border-l-4 border-gold p-3 rounded-xl text-primary font-semibold mb-2">
                    Latest Admin Feedback: {history.adminFeedback}
                  </div>
                )}
              </>
            )}
            <button className="mt-4 px-4 py-2 rounded bg-sage/60 hover:bg-sage text-primary font-bold border-2 border-gold" onClick={() => setShowHistoryId(null)}>Close</button>
          </div>
        </div>
      )}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-badge-appear { animation: badgeAppear 0.5s cubic-bezier(.4,0,.2,1); }
        @keyframes badgeAppear { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
        .animate-edit-mode { animation: editMode 0.5s cubic-bezier(.4,0,.2,1); }
        @keyframes editMode { from { box-shadow: 0 0 0 0 #e07a5f33; } to { box-shadow: 0 0 32px 8px #e07a5f33; } }
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
        .animate-btn-fade { animation: btnFadeIn 0.8s cubic-bezier(.4,0,.2,1); }
        @keyframes btnFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .animate-card-in { animation: cardIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes cardIn { from { opacity: 0; transform: translateY(32px) scale(0.98); } to { opacity: 1; transform: none; } }
        .animate-btn-appear { animation: btnAppear 0.6s cubic-bezier(.4,0,.2,1); }
        @keyframes btnAppear { from { opacity: 0; transform: scale(0.8) rotate(-5deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
      `}</style>
        </div> {/* <-- This closes the div from line 272 */}
      </div> {/* <-- This closes the div from line 271 */}
    </div>
  );
}