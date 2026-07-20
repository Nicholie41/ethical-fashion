import React, { useEffect, useState } from "react";
import axios from "axios";

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

const API_ROOT = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL.replace('/api', '') 
  : "http://localhost:5000";
const DASHBOARD_BG_URL =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1500&q=80";

const Admin = ({ user, token }) => {
  const [pendingBrands, setPendingBrands] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState({
    brands: 0,
    products: 0,
    pendingBrands: 0,
    pendingProducts: 0,
  });
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [cleaning, setCleaning] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState("");

  // Fetch stats for the dashboard
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get(`${API_ROOT}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch {
        setStats((s) => ({
          ...s,
          pendingBrands: pendingBrands.length,
          pendingProducts: pendingProducts.length,
        }));
      }
    }
    if (user && user.role === "admin" && token) fetchStats();
    // eslint-disable-next-line
  }, [JSON.stringify(pendingBrands), JSON.stringify(pendingProducts), user, token]);

  useEffect(() => {
    setErrorMsg("");
    setActionMsg("");
    if (!user || user.role !== "admin" || !token) {
      setLoading(false);
      setErrorMsg("Not authenticated as admin.");
      return;
    }
    setLoading(true);
    Promise.all([fetchPendingBrands(), fetchPendingProducts()])
      .catch(() => {
        setErrorMsg("Failed to fetch pending brands or products.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [user, token]);

  const fetchPendingBrands = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/api/admin/brands/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingBrands(res.data);
    } catch {
      setErrorMsg("Failed to fetch pending brands.");
      setPendingBrands([]);
      throw Error();
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/api/admin/products/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingProducts(res.data);
    } catch {
      setErrorMsg("Failed to fetch pending products.");
      setPendingProducts([]);
      throw Error();
    }
  };

  const handleApproveBrand = async (brandId) => {
    try {
      await axios.put(
        `${API_ROOT}/api/admin/brands/${brandId}/approve`,
        { approve: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg("Brand approved!");
      setPendingBrands((brands) => brands.filter((b) => b._id !== brandId));
    } catch {
      setErrorMsg("Failed to approve brand.");
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      await axios.put(
        `${API_ROOT}/api/admin/products/${productId}/approve`,
        { approve: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg("Product approved!");
      setPendingProducts((products) =>
        products.filter((p) => p._id !== productId)
      );
    } catch {
      setErrorMsg("Failed to approve product.");
    }
  };

  const handleSeedProducts = async () => {
    setSeeding(true);
    setSeedMessage("");
    
    try {
      const response = await axios.post(
        `${API_ROOT}/api/products/seed`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSeedMessage(`✅ ${response.data.message}`);
      // Refresh stats
      const statsRes = await axios.get(`${API_ROOT}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsRes.data);
    } catch (error) {
      setSeedMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleCleanup = async () => {
    setCleaning(true);
    setCleanupMessage("");
    try {
      const response = await axios.delete(
        `${API_ROOT}/api/products/cleanup`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCleanupMessage(`✅ ${response.data.message} - Removed ${response.data.deletedBrands} brands and ${response.data.deletedProducts} products`);
      // Refresh stats
      const statsRes = await axios.get(`${API_ROOT}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsRes.data);
    } catch (error) {
      setCleanupMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setCleaning(false);
    }
  };

  // =========== UI =============

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-lg text-green-800">
        <svg className="animate-spin h-7 w-7 mr-2 text-green-700" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        Loading admin dashboard...
      </div>
    );

  if (errorMsg)
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage/40 via-cloud/80 to-gold/20 py-12 px-6 flex items-center justify-center">
        <div className="bg-white/98 border border-red/30 rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto relative overflow-hidden backdrop-blur-sm">
          {/* Premium accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500"></div>
          
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-4xl font-heading font-bold text-red-700 mb-4">Error</h2>
            <p className="text-xl text-red-600 mb-6 font-medium">{errorMsg}</p>
            <p className="text-stone/60 text-lg leading-relaxed">
          Please make sure you are logged in as an admin and the backend API is running and accessible.
        </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/40 via-cloud/80 to-gold/20 py-12 px-6 relative">
      {/* Subtle premium background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 mb-20 relative overflow-hidden backdrop-blur-sm">
          {/* Premium accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-accent"></div>
                  <h1 className="text-5xl sm:text-6xl font-black text-primary">
              Admin Dashboard
                  </h1>
                  <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-accent"></div>
                </div>
                <div className="bg-gold text-primary font-bold px-6 py-3 rounded-2xl shadow-lg border-2 border-gold/30">
              EcoApp
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">{user?.name || user?.username}</div>
                  <div className="text-stone/60 text-sm font-medium">Administrator</div>
                </div>
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-primary to-accent text-gold font-bold text-2xl rounded-full border-4 border-gold shadow-xl">
                  {getInitials(user?.name || user?.username)}
                </div>
          </div>
            </div>
          </div>
        </header>
        {/* Stats Cards */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Dashboard Overview
            </h2>
            <p className="text-stone/60 text-lg max-w-2xl mx-auto leading-relaxed">
              Monitor your platform's activity and manage pending approvals
            </p>
            <div className="w-40 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Total Brands" value={stats.brands} color="from-sage/40 to-sage/60" icon="🏷️" />
            <StatCard label="Total Products" value={stats.products} color="from-cloud/40 to-cloud/60" icon="📦" />
            <StatCard label="Pending Brands" value={pendingBrands.length} color="from-gold/40 to-gold/60" icon="⏳" />
            <StatCard label="Pending Products" value={pendingProducts.length} color="from-accent/40 to-accent/60" icon="🕒" />
          </div>
          
          {actionMsg && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-center font-medium shadow-lg">
              {actionMsg}
            </div>
          )}
        </section>

        {/* Seed Products Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 relative overflow-hidden backdrop-blur-sm">
            {/* Premium accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-heading font-bold text-primary mb-4">
                🌱 Seed Premium Products
              </h2>
              <p className="text-stone/60 text-lg mb-6 max-w-2xl mx-auto">
                Add high-quality sustainable products with real images to showcase the platform's capabilities. 
                This will add 12 premium products from top sustainable brands.
              </p>
              <button
                onClick={handleSeedProducts}
                disabled={seeding}
                className="px-8 py-4 bg-gold text-primary font-bold rounded-xl hover:bg-gold/90 transition-colors shadow-lg disabled:opacity-50 text-lg"
              >
                {seeding ? 'Adding Products...' : 'Add Premium Products'}
              </button>
              {seedMessage && (
                <div className={`mt-6 p-4 rounded-xl text-center font-medium ${
                  seedMessage.includes('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {seedMessage}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cleanup Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="bg-white/98 border border-red-300 rounded-3xl shadow-2xl p-10 relative overflow-hidden backdrop-blur-sm">
            {/* Warning accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-red-500 to-red-400"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-heading font-bold text-red-700 mb-4">
                🗑️ Remove Seeded Data
              </h2>
              <p className="text-stone/60 text-lg mb-6 max-w-2xl mx-auto">
                Remove all seeded products and brands that were added for demonstration purposes. 
                This action cannot be undone and will permanently delete the seeded data.
              </p>
              <button
                onClick={handleCleanup}
                disabled={cleaning}
                className="px-8 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 text-lg"
              >
                {cleaning ? 'Removing Data...' : 'Remove Seeded Data'}
              </button>
              {cleanupMessage && (
                <div className={`mt-6 p-4 rounded-xl text-center font-medium ${
                  cleanupMessage.includes('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {cleanupMessage}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Approval Panels */}
        <main className="max-w-6xl mx-auto space-y-20">
          {/* Pending Brands */}
          <div className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 relative overflow-hidden backdrop-blur-sm">
            {/* Premium accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-heading font-bold text-primary mb-4 flex items-center justify-center gap-4">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-accent"></div>
                  Pending Brands
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-accent"></div>
            </h2>
                {pendingBrands.length > 0 && (
                  <span className="inline-block bg-gold text-primary font-bold text-sm px-4 py-2 rounded-full shadow-lg border-2 border-gold/30">
                    {pendingBrands.length} Awaiting Approval
                  </span>
                )}
                <div className="w-40 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6"></div>
              </div>
              
            {pendingBrands.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <div className="text-stone/60 text-xl font-medium">No pending brands to review</div>
                </div>
            ) : (
                <div className="grid gap-6">
                {pendingBrands.map((brand) => (
                    <div key={brand._id} className="bg-white/80 border-2 border-gold/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-primary to-accent text-gold font-bold text-2xl rounded-full border-4 border-gold shadow-lg">
                      {getInitials(brand.name)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-primary mb-2">{brand.name}</h3>
                          <p className="text-stone/60 text-base leading-relaxed">{brand.description}</p>
                    </div>
                    <button
                      onClick={() => handleApproveBrand(brand._id)}
                          className="bg-gradient-to-r from-primary to-accent text-gold font-bold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 border-2 border-gold/30 hover:shadow-2xl hover:scale-[1.05] group"
                    >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gold rounded-full"></div>
                            Approve Brand
                          </div>
                    </button>
                      </div>
                    </div>
                ))}
                </div>
            )}
            </div>
          </div>
          
          {/* Pending Products */}
          <div className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 relative overflow-hidden backdrop-blur-sm">
            {/* Premium accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-heading font-bold text-primary mb-4 flex items-center justify-center gap-4">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-accent"></div>
                  Pending Products
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-accent"></div>
            </h2>
                {pendingProducts.length > 0 && (
                  <span className="inline-block bg-gold text-primary font-bold text-sm px-4 py-2 rounded-full shadow-lg border-2 border-gold/30">
                    {pendingProducts.length} Awaiting Approval
                  </span>
                )}
                <div className="w-40 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6"></div>
              </div>
              
            {pendingProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <div className="text-stone/60 text-xl font-medium">No pending products to review</div>
                </div>
            ) : (
                <div className="grid gap-6">
                {pendingProducts.map((product) => (
                    <div key={product._id} className="bg-white/80 border-2 border-gold/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center overflow-hidden border-4 border-gold shadow-lg">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                            <span className="text-gold text-3xl">📦</span>
                      )}
                    </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-primary mb-2">{product.name}</h3>
                          <p className="text-stone/60 text-base leading-relaxed line-clamp-2">{product.description}</p>
                    </div>
                    <button
                      onClick={() => handleApproveProduct(product._id)}
                          className="bg-gradient-to-r from-primary to-accent text-gold font-bold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 border-2 border-gold/30 hover:shadow-2xl hover:scale-[1.05] group"
                    >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gold rounded-full"></div>
                            Approve Product
                          </div>
                    </button>
                      </div>
                    </div>
                ))}
                </div>
            )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Dashboard Stat Card
function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-white/98 border border-gold/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden backdrop-blur-sm hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 group`}>
      {/* Premium accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-sage to-gold"></div>
      
      <div className="relative z-10 text-center">
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <div className="text-5xl font-black text-primary mb-3 drop-shadow-sm">{value}</div>
        <div className="text-lg font-bold text-stone/70 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export default Admin;