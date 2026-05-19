import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBrands, fetchProducts } from "../api";

/**
 * BrandDetails page - Redesigned with modern, engaging UI
 * Shows details for a single brand by ID.
 * Expects a route like /brands/:id
 */
export default function BrandDetails({ user }) {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [brandProducts, setBrandProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function load() {
      try {
        const brandsResponse = await fetchBrands();
        const allBrands = Array.isArray(brandsResponse) ? brandsResponse : (brandsResponse.brands || []);
      const foundBrand = allBrands.find(b => b._id === id || b.id === id);
      setBrand(foundBrand || null);

        const productsResponse = await fetchProducts();
        const allProducts = Array.isArray(productsResponse) ? productsResponse : (productsResponse.products || []);
      const theirProducts = allProducts.filter(
        p => (p.brand && (p.brand._id === id || p.brand.id === id)) ||
             (p.brandId === id)
      );
      setBrandProducts(theirProducts);
      } catch (error) {
        console.error('Error loading brand details:', error);
        setBrand(null);
        setBrandProducts([]);
      } finally {
      setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage/20 via-cloud/30 to-gold/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary font-semibold">Loading brand details...</p>
        </div>
      </div>
    );
  }
  
  if (!brand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage/20 via-cloud/30 to-gold/20 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-8 shadow-2xl border-2 border-red-200">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Brand Not Found</h2>
          <p className="text-gray-600 mb-6">The brand you're looking for doesn't exist or has been removed.</p>
          <Link to="/brands" className="bg-primary text-gold px-6 py-3 rounded-full font-semibold hover:bg-accent hover:text-cloud transition-all duration-200">
            ← Back to Brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/20 via-cloud/30 to-gold/20 py-10 px-4">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gold/30">
          {/* Brand Header */}
          <div className="relative bg-gradient-to-r from-primary via-accent to-gold p-8 md:p-12">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              {/* Brand Logo/Image */}
              <div className="flex-shrink-0">
                {brand.imageUrl ? (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                    <img 
                      src={brand.imageUrl} 
                      alt={brand.name} 
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-gold to-accent flex items-center justify-center border-4 border-white shadow-2xl">
                    <span className="text-4xl md:text-5xl font-bold text-white">{brand.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              
              {/* Brand Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  {brand.name}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                    🌱 Sustainable
                  </span>
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                    ♻️ Ethical
                  </span>
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                    ✨ Premium
                  </span>
                </div>
      {user && user.role === "supplier" && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    brand.approved 
                      ? 'bg-green-500/20 text-green-100' 
                      : 'bg-yellow-500/20 text-yellow-100'
                  }`}>
                    {brand.approved ? "✅ Approved" : "⏳ Pending Approval"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-white text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary hover:bg-white/50'
                }`}
              >
                📋 Overview
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                  activeTab === 'products'
                    ? 'bg-white text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary hover:bg-white/50'
                }`}
              >
                👕 Products ({brandProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('values')}
                className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
                  activeTab === 'values'
                    ? 'bg-white text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary hover:bg-white/50'
                }`}
              >
                🌍 Values
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-sage/20 to-gold/20 rounded-2xl p-6 border border-gold/30">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    About {brand.name}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {brand.description}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border-2 border-gold/30 shadow-lg">
                    <h4 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                      <span className="text-xl">🌐</span>
                      Visit Website
                    </h4>
                    <a 
                      href={brand.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 bg-primary text-gold px-4 py-2 rounded-full font-semibold hover:bg-accent hover:text-cloud transition-all duration-200"
                    >
                      <span>🔗</span>
                      {brand.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 border-2 border-gold/30 shadow-lg">
                    <h4 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      Brand Stats
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Products Available:</span>
                        <span className="font-bold text-primary">{brandProducts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sustainability Score:</span>
                        <span className="font-bold text-green-600">9.2/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ethical Rating:</span>
                        <span className="font-bold text-green-600">★★★★★</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="text-3xl">👕</span>
                  Products by {brand.name}
                </h3>
      {brandProducts.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brandProducts.map(product => (
                      <Link 
                        key={product._id || product.id} 
                        to={`/products/${product._id || product.id}`}
                        className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-gold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={e => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-4xl">👕</span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                          {product.name}
                        </h4>
                        {product.price && (
                          <p className="text-lg font-bold text-gold">
                            ${Number(product.price).toFixed(2)}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👕</div>
                    <h4 className="text-xl font-bold text-gray-600 mb-2">No Products Yet</h4>
                    <p className="text-gray-500">This brand hasn't added any products yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'values' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                    <div className="text-4xl mb-4">🌱</div>
                    <h4 className="text-lg font-bold text-green-800 mb-2">Sustainability</h4>
                    <p className="text-green-700">Committed to eco-friendly practices and reducing environmental impact.</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="text-4xl mb-4">🤝</div>
                    <h4 className="text-lg font-bold text-blue-800 mb-2">Fair Trade</h4>
                    <p className="text-blue-700">Ensuring fair wages and safe working conditions for all workers.</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                    <div className="text-4xl mb-4">✨</div>
                    <h4 className="text-lg font-bold text-purple-800 mb-2">Quality</h4>
                    <p className="text-purple-700">Premium materials and craftsmanship for lasting, beautiful pieces.</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gold/20 to-accent/20 rounded-2xl p-6 border border-gold/30">
                  <h4 className="text-xl font-bold text-primary mb-4">Why Choose {brand.name}?</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">Certified organic materials</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">Fair trade certified</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">Carbon neutral shipping</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-gray-700">Transparent supply chain</span>
            </li>
        </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto text-center">
        <Link 
          to="/brands" 
          className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-gold transition-all duration-200 shadow-lg border-2 border-primary"
        >
          <span className="text-xl">←</span>
          Back to Brands
      </Link>
      </div>

      {/* Custom CSS */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}