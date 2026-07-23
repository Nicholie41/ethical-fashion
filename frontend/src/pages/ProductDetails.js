import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProducts } from "../api";

export default function ProductDetails({
  user,
  cartItems,
  totalPrice,
  onAddToCart,
  onCheckout
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState([]);

  // Always define sizes/colors as arrays, even if product is null
  const sizes = product && product.sizes
    ? (Array.isArray(product.sizes)
        ? product.sizes
        : typeof product.sizes === "string" && product.sizes
        ? product.sizes.split(",").map(s => s.trim()).filter(Boolean)
        : [])
    : [];
  const colors = product && product.colors
    ? (Array.isArray(product.colors)
        ? product.colors
        : typeof product.colors === "string" && product.colors
        ? product.colors.split(",").map(c => c.trim()).filter(Boolean)
        : [])
    : [];

  // Only reset selected size/color when the product changes
  useEffect(() => {
    setSelectedSize(sizes[0] || "");
    setSelectedColor(colors[0] || "");
    // eslint-disable-next-line
  }, [product ? product._id : null]);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetchProducts();
        // Handle both old format (array) and new format (object with products array)
        const all = Array.isArray(response) ? response : (response.products || []);
      const found = all.find(p => p._id === id || p.id === id);
      setProduct(found || null);
      setImgIdx(0);
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
      setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!product) return <div className="p-8 text-red-700">Product not found.</div>;

  // Gather all images
  let images = [];
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    images = product.imageUrls.filter(Boolean);
  } else if (
    typeof product.imageUrls === "string" &&
    product.imageUrls.trim() !== ""
  ) {
    images = product.imageUrls.split(",").map(s => s.trim()).filter(Boolean);
  } else if (product.imageUrl) {
    images = [product.imageUrl];
  } else if (product.image) {
    images = [product.image];
  }
  if (images.length === 0) {
    images = [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80"
    ];
  }

  const showPrev = () =>
    setImgIdx(idx => (idx === 0 ? images.length - 1 : idx - 1));
  const showNext = () =>
    setImgIdx(idx => (idx === images.length - 1 ? 0 : idx + 1));

  const canAdd = (
    (sizes.length === 0 || selectedSize) &&
    (colors.length === 0 || selectedColor)
  );

  function handleAddToCart() {
    onAddToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  function handleAddToCartWithOptions() {
    onAddToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    });
  }

  // For multi-selection
  function handleAddSelection() {
    if (!selectedSize && sizes.length > 0) return;
    if (!selectedColor && colors.length > 0) return;
    if (!quantity || quantity < 1) return;
    setSelections(prev => [
      ...prev,
      {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        quantity: Number(quantity)
      }
    ]);
  }

  function handleAddAllToCart() {
    selections.forEach(sel => onAddToCart(sel));
    setSelections([]); // Optionally clear after adding
  }

  // Debug logs
  console.log("ProductDetails user:", user);
  console.log("ProductDetails user.role:", user && user.role);
  console.log("ProductDetails product.price:", product && product.price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-10 px-2">
      {/* PRODUCT SECTION */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto flex flex-col md:flex-row overflow-hidden">
        {/* Image Section */}
        <div className="md:w-1/2 flex flex-col items-center justify-start bg-gray-50 p-6 relative min-h-[420px] pt-8">
          {/* Main Image Display */}
          <div className="relative w-full max-w-md">
            <img
              src={images[imgIdx]}
              alt={`${product.name} - Image ${imgIdx + 1}`}
              className="rounded-xl object-cover w-full h-[380px] border border-green-100 shadow-lg transition-all duration-300"
              style={{ background: "#fff" }}
              onError={e => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/380x380?text=Product";
              }}
            />
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm font-semibold">
                {imgIdx + 1} / {images.length}
              </div>
            )}
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-primary text-xl rounded-full p-3 shadow-lg border border-gray-200 transition-all duration-200 hover:scale-110"
                  onClick={showPrev}
                  aria-label="Previous image"
                >
                  &#8592;
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-primary text-xl rounded-full p-3 shadow-lg border border-gray-200 transition-all duration-200 hover:scale-110"
                  onClick={showNext}
                  aria-label="Next image"
                >
                  &#8594;
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="mt-6 w-full max-w-md">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      i === imgIdx 
                        ? 'border-primary shadow-lg' 
                        : 'border-gray-300 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/64x64?text=Image";
                      }}
                    />
                  </button>
                ))}
              </div>
              
              {/* Progress Dots */}
              <div className="flex justify-center gap-1 mt-3">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i === imgIdx 
                        ? 'bg-primary scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Details Section */}
        <div className="md:w-1/2 flex flex-col justify-between p-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-green-900 mb-2">
              {product.name}
            </h1>
            {product.price && (
              <div className="mb-4 text-xl font-bold text-green-700">
                ${Number(product.price).toFixed(2)}
              </div>
            )}
            {/* Multi-selection Add to Cart section - polished */}
            <section className="flex justify-center mt-10 mb-6">
              <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-gold p-8 flex flex-col items-center gap-4">
                <h2 className="text-xl font-heading font-bold text-primary mb-2">Select Options &amp; Add to Cart</h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full mb-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1" htmlFor="quantity">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full border rounded px-2 py-1 text-center focus:ring-2 focus:ring-gold"
                      aria-label="Quantity"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddSelection}
                  className="w-full bg-gold text-primary text-base font-heading font-bold py-3 rounded-full shadow-lg border-2 border-gold hover:bg-accent hover:text-cloud hover:scale-105 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={!canAdd}
                  aria-label="Add selection to list"
                >
                  <span className="material-icons text-lg">add_shopping_cart</span>
                  Add Selection
                </button>
                {!canAdd && (
                  <div className="text-xs text-red-600 mt-2 text-center">Please select {(!selectedSize ? "size" : "") + (!selectedSize && !selectedColor ? " and " : "") + (!selectedColor ? "color" : "")}.</div>
                )}
                {/* Divider */}
                <div className="w-full border-t border-gold/40 my-2"></div>
                {/* List of selections */}
                {selections.length > 0 && (
                  <div className="w-full mt-2">
                    <div className="font-semibold mb-2 text-primary">Selections:</div>
                    <ul className="space-y-2">
                      {selections.map((sel, idx) => (
                        <li key={sel.size + sel.color + idx} className="flex flex-wrap sm:flex-nowrap justify-between items-center bg-sage/40 rounded-xl px-4 py-2 text-xs shadow-sm">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-bold text-stone text-sm">{sel.name}</span>
                            {sel.size && <span className="bg-gold/80 text-primary font-semibold px-2 py-0.5 rounded-full border border-gold/60">Size: {sel.size}</span>}
                            {sel.color && <span className="bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full border border-yellow-200">Color: {sel.color}</span>}
                            <span className="bg-primary text-gold font-semibold px-2 py-0.5 rounded-full border border-gold/60">Qty: {sel.quantity}</span>
                          </div>
                          <button onClick={() => setSelections(selections.filter((_, i) => i !== idx))} className="ml-2 text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 px-2 py-1 rounded transition" aria-label="Remove selection">Remove</button>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleAddAllToCart}
                      className="w-full mt-4 bg-primary text-gold font-heading font-bold py-3 rounded-full shadow-lg border-2 border-gold hover:bg-accent hover:text-cloud transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold flex items-center justify-center gap-2 text-base"
                      aria-label="Add all selections to cart"
                    >
                      <span className="material-icons text-lg">shopping_cart_checkout</span>
                      Add All to Cart
                    </button>
                  </div>
                )}
              </div>
            </section>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">
                Sustainability Score:{" "}
              </span>
              <span className="font-bold text-green-800">
                {product.sustainabilityScore ?? "N/A"}
              </span>
            </div>
            <div className="mb-6">
              <span className="block font-bold text-gray-700 mb-1">
                Description:
              </span>
              <span className="text-gray-800">{product.description}</span>
            </div>
            {product.material && (
              <div className="mb-4">
                <span className="block font-bold text-gray-700 mb-1">
                  Material:
                </span>
                <span className="text-gray-800">{product.material}</span>
              </div>
            )}
            {/* Size selection */}
            {sizes.length > 0 && (
              <div className="mb-3">
                <label className="block font-semibold text-gray-700 mb-1">Select Size:</label>
                <select
                  className="border rounded px-3 py-2 w-full max-w-xs"
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                >
                  <option value="">Choose size...</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                ))}
                </select>
              </div>
            )}
            {/* Color selection */}
            {colors.length > 0 && (
              <div className="mb-3">
                <label className="block font-semibold text-gray-700 mb-1">Select Color:</label>
                <select
                  className="border rounded px-3 py-2 w-full max-w-xs"
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                >
                  <option value="">Choose color...</option>
                  {colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                ))}
                </select>
              </div>
            )}
            {product.brand && (
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Brand: </span>
                <Link
                  to={`/brands/${product.brand._id || product.brand.id}`}
                  className="text-green-700 underline"
                >
                  {product.brand.name}
                </Link>
              </div>
            )}
          </div>
          {/* Back button */}
          <div className="flex flex-col gap-2 mt-8">
            <Link
              to="/products"
              className="text-green-700 underline font-semibold mt-2"
            >
              &larr; Back to Products
            </Link>
          </div>
        </div>
      </div>
      {/* CART SUMMARY SECTION */}
      {cartItems.length > 0 && (
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gold">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-icons text-gold">shopping_cart</span>
                Cart Summary ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
              </h2>
              <button
                onClick={() => window.location.href = '/payment'}
                className="bg-primary text-gold px-4 py-2 rounded-full font-semibold hover:bg-accent hover:text-cloud transition-colors"
              >
                View Full Cart
              </button>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {cartItems.slice(0, 3).map(item => {
                const uniqueKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`;
                return (
                <div
                  key={uniqueKey}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-primary">{item.name}</span>
                    <div className="flex gap-2 mt-1">
                      {item.size && (
                        <span className="text-xs bg-gold/80 text-primary px-2 py-0.5 rounded-full border border-gold/60">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200">
                          Color: {item.color}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-primary">
                      ${Number(item.price).toFixed(2)} x {item.quantity}
                    </span>
                  </div>
                </div>
              );
              })}
              {cartItems.length > 3 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  +{cartItems.length - 3} more items in cart
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gold/30">
              <span className="text-lg font-bold text-primary">Total:</span>
              <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
            </div>
            
            <button
              className="mt-4 w-full bg-primary text-gold font-bold py-3 rounded-xl hover:bg-accent hover:text-cloud transition-all duration-200 shadow-lg"
              onClick={() => navigate('/payment')}
            >
              <span className="material-icons inline mr-2">shopping_cart_checkout</span>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
      
      {/* Custom CSS for enhanced slideshow */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .image-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}