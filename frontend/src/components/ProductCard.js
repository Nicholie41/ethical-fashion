import React, { useState } from "react";
import { Link } from "react-router-dom";

// Helper to trim protocol from URLs
function getDomain(url) {
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return url.replace(/^https?:\/\//i, "");
  }
}

export default function ProductCard({ product, user, onAddToCart }) {
  // Fix the imageUrl extraction to handle different data types
  const imageUrl = (() => {
    if (product.imageUrl) return product.imageUrl;
    if (product.imageUrls) {
      if (typeof product.imageUrls === 'string') {
        return product.imageUrls.split(',')[0];
      }
      if (Array.isArray(product.imageUrls)) {
        return product.imageUrls[0];
      }
    }
    if (product.image) return product.image;
    return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80';
  })();
  
  // Determine if this is a premium product (for demo, let's say products with sustainability score >= 8)
  const isPremiumProduct = product.sustainabilityScore >= 8;
  const showPremiumOverlay = !user && isPremiumProduct;

  return (
    <div className="bg-white rounded-3xl shadow-2xl hover:shadow-2xl transition-transform transform hover:-translate-y-2 p-8 m-4 flex flex-col items-center text-center border-2 border-gold min-h-[480px] w-80 max-w-xs aspect-square relative group">
      {/* Approval badge for supplier */}
      {user && user.role === "supplier" && (
        <div className="absolute top-3 right-3 bg-white rounded-full shadow px-3 py-1 text-xs font-semibold"
             style={{
               color: product.approved ? "#059669" : "#d97706",
               border: product.approved ? "1px solid #059669" : "1px solid #d97706"
             }}>
          {product.approved ? "✅ Approved" : "⏳ Pending"}
        </div>
      )}
      {/* Enhanced Eco Pulse Animation */}
      <style>{`
        @keyframes eco-pulse {
          0% { 
            box-shadow: 0 0 0 0 rgba(255, 209, 102, 0.7);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 12px rgba(255, 209, 102, 0.3);
            transform: scale(1.05);
          }
          100% { 
            box-shadow: 0 0 0 0 rgba(255, 209, 102, 0);
            transform: scale(1);
          }
        }
        .animate-eco-pulse {
          animation: eco-pulse 2s ease-in-out infinite;
        }
        @keyframes premium-glow {
          0% { 
            box-shadow: 0 0 20px rgba(255, 209, 102, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(255, 209, 102, 0.6);
            transform: scale(1.02);
          }
          100% { 
            box-shadow: 0 0 20px rgba(255, 209, 102, 0.3);
            transform: scale(1);
          }
        }
        .animate-premium-glow {
          animation: premium-glow 2.5s ease-in-out infinite;
        }
        @keyframes sustainability-pulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(20, 83, 45, 0.7);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 15px rgba(20, 83, 45, 0);
            transform: scale(1.08);
          }
        }
        .animate-sustainability-pulse {
          animation: sustainability-pulse 2.5s ease-in-out infinite;
        }
      `}</style>
      
      {/* Premium badge */}
      {isPremiumProduct && (
        <span className="absolute top-3 left-3 bg-gradient-to-r from-gold to-accent text-primary font-bold text-xs px-3 py-1 rounded-full shadow border border-gold animate-fade-in animate-premium-glow z-20">
          ⭐ Premium
        </span>
      )}
      
      {/* Eco badge */}
      {product.sustainabilityScore >= 8 && (
        <span className="absolute top-3 left-3 bg-gold text-primary font-bold text-xs px-3 py-1 rounded-full shadow border border-gold animate-fade-in animate-eco-pulse">
          Eco
        </span>
      )}
      
      {/* Sustainability Score Badge */}
      {product.sustainabilityScore >= 9 && (
        <span className="absolute top-3 right-3 bg-primary text-gold font-bold text-xs px-3 py-1 rounded-full shadow border border-primary animate-sustainability-pulse">
          {product.sustainabilityScore}/10
        </span>
      )}
      
      <div className="w-full flex flex-col items-center group h-full justify-between relative transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-2">
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <img
            src={imageUrl}
            alt={product.name || "Product"}
            className={`w-32 h-32 object-cover rounded-2xl bg-cloud border-2 border-gold shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 ease-out ${
              showPremiumOverlay ? 'blur-sm' : ''
            }`}
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80'; }}
          />
          
          {/* Premium overlay for non-logged users */}
          {showPremiumOverlay && (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-accent/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-xs font-bold text-primary bg-white/90 rounded-lg px-2 py-1">
                  Premium Product
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Price badge below image */}
          {product.price !== undefined && product.price !== "" && (
          <div className="mb-2 flex justify-center w-full">
            <span className={`bg-gold text-primary text-sm font-bold px-4 py-1 rounded-full shadow border border-gold ${
              showPremiumOverlay ? 'blur-sm' : ''
            }`} style={{minWidth: '64px', textAlign: 'center'}}>
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
          )}
        
        {/* View Details button below price */}
        <div className="mb-2 flex justify-center w-full">
          <Link to={`/products/${product._id || product.id}`}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-gold font-bold rounded-full shadow hover:bg-accent hover:text-cloud transition-colors border border-gold text-sm">
            <span className="material-icons text-base">visibility</span>
            View Details
          </Link>
        </div>
        
        {/* Quick Add button for customers only */}
        {user && user.role === "customer" && onAddToCart && (
          <div className="w-full flex justify-center mt-3">
            <button
              onClick={() => {
                // Use first available size/color if present
                const sizes = product.sizes
                  ? (Array.isArray(product.sizes)
                      ? product.sizes
                      : typeof product.sizes === "string" && product.sizes
                      ? product.sizes.split(",").map(s => s.trim()).filter(Boolean)
                      : [])
                  : [];
                const colors = product.colors
                  ? (Array.isArray(product.colors)
                      ? product.colors
                      : typeof product.colors === "string" && product.colors
                      ? product.colors.split(",").map(c => c.trim()).filter(Boolean)
                      : [])
                  : [];
                onAddToCart({
                  id: product._id || product.id,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  size: sizes[0] || undefined,
                  color: colors[0] || undefined
                });
              }}
              className="bg-gold text-primary px-6 py-2 rounded-full font-heading font-bold shadow-lg border-2 border-gold hover:bg-accent hover:text-cloud hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-gold relative overflow-hidden transform hover:-translate-y-1"
            >
              Quick Add
            </button>
          </div>
        )}

        {/* Sign up prompt for non-logged users */}
        {!user && (
          <div className="w-full flex justify-center mt-3">
            <a
              href="/login"
              className="bg-accent text-cloud px-6 py-2 rounded-full font-heading font-bold shadow-lg border-2 border-accent hover:bg-primary hover:text-gold hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-accent relative overflow-hidden flex items-center gap-2 transform hover:-translate-y-1"
            >
              <span className="material-icons text-sm">favorite</span>
              Sign up to save
            </a>
          </div>
        )}

        <div className={`w-full px-2 ${showPremiumOverlay ? 'blur-sm' : ''}`}>
          <h2 className="font-extrabold text-lg text-primary mb-2 w-full overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-accent transition-colors" title={product.name || "Unnamed Product"}>
          {product.name || "Unnamed Product"}
        </h2>
          {/* Material/feature badges */}
          <div className="flex flex-wrap gap-2 justify-center w-full">
            {Array.isArray(product.material)
              ? product.material.map((mat, i) => (
                  <span key={mat + i} className="bg-sage/80 text-primary font-semibold text-xs px-3 py-1 rounded-full border border-sage/60 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {mat}
        </span>
                ))
              : product.material && (
                  <span className="bg-sage/80 text-primary font-semibold text-xs px-3 py-1 rounded-full border border-sage/60 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {product.material}
          </span>
        )}
      </div>
        </div>
        
        {/* Premium unlock overlay */}
        {showPremiumOverlay && (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-accent/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center p-6 bg-white/95 rounded-2xl border-2 border-gold shadow-xl max-w-[90%]">
              <div className="text-4xl mb-3">🔓</div>
              <h3 className="font-bold text-primary text-lg mb-2">Unlock Premium Access</h3>
              <p className="text-stone text-sm mb-4">Join our community to see full product details and exclusive deals</p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-primary text-gold px-4 py-2 rounded-full font-bold text-sm hover:bg-accent hover:text-cloud transition-all duration-200"
              >
                <span className="material-icons text-sm">rocket_launch</span>
                Join Now
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}