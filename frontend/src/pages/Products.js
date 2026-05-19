import React, { useEffect, useState } from "react";
import { fetchProducts } from "../api";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";

// --- Payment Dashboard Component ---
function PaymentDashboard({ cart, totalPrice, onBack }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200 max-w-xl mx-auto my-12">
      <h2 className="text-2xl font-bold text-green-900 mb-4 text-center">💳 Payment Dashboard</h2>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
        <ul className="divide-y divide-green-100">
          {cart.map((item, idx) => (
            <li key={idx} className="py-2">
              <div className="font-medium">{item.name}</div>
              {item.selectedSize && (
                <div className="text-xs text-gray-500">Size: {item.selectedSize}</div>
              )}
              {item.selectedColor && (
                <div className="text-xs text-gray-500">Color: {item.selectedColor}</div>
              )}
              <div className="text-sm text-gray-700">
                ${Number(item.price).toFixed(2)} × {item.quantity} = <span className="text-green-700 font-bold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center font-bold text-xl mt-6 border-t border-green-100 pt-3">
          <span>Total:</span>
          <span className="text-green-700">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      {/* Payment form placeholder */}
      <form className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Card Number
          <input type="text" placeholder="1234 5678 9012 3456" className="border rounded p-2 w-full mt-1" autoComplete="cc-number" />
        </label>
        <div className="flex gap-4 mb-2">
          <label className="flex-1 text-sm font-medium text-gray-700">
            Expiry
            <input type="text" placeholder="MM/YY" className="border rounded p-2 w-full mt-1" autoComplete="cc-exp" />
          </label>
          <label className="flex-1 text-sm font-medium text-gray-700">
            CVC
            <input type="text" placeholder="CVC" className="border rounded p-2 w-full mt-1" autoComplete="cc-csc" />
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl text-lg shadow transition mt-4"
          disabled
          title="Demo only"
        >
          Pay Now
        </button>
      </form>
      <button
        onClick={onBack}
        className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold shadow transition hover:bg-gray-300"
      >
        Back to Cart
      </button>
      <div className="text-xs text-gray-400 text-center mt-4">
        Payments Methods under construction🚧🚧🚧🚧🚧, We are working tirelessly.
      </div>
    </div>
  );
}

// --- Main Products Component ---
export default function Products({ user }) {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'relevance',
    minPrice: '',
    maxPrice: '',
    category: 'all',
    brand: 'all',
    sustainability: 'all',
    dateRange: 'all',
    materials: [],
    colors: [],
    sizes: []
  });
  const [adding, setAdding] = useState(false);
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    imageUrls: "",
    description: "",
    sustainabilityScore: "",
    material: "",
    brand: "",
    sizes: "",
    colors: "",
    price: "",
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    // Fetch brands
    fetch("http://localhost:5000/api/brands")
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch(() => setBrands([]));
    
    // Fetch categories from products
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const uniqueCategories = [...new Set(data.map(product => product.category).filter(Boolean))];
        setCategories(uniqueCategories);
      })
      .catch(() => setCategories([]));
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        
        // Add filter parameters
        if (filters.search) queryParams.append('q', filters.search);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
        if (filters.brand && filters.brand !== 'all') queryParams.append('brand', filters.brand);
        if (filters.sustainability && filters.sustainability !== 'all') {
          const [min, max] = filters.sustainability.split('-').map(Number);
          if (min) queryParams.append('minSustainability', min);
          if (max) queryParams.append('maxSustainability', max);
        }
        if (filters.dateRange && filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
        if (filters.materials.length > 0) queryParams.append('materials', filters.materials.join(','));
        if (filters.colors.length > 0) queryParams.append('colors', filters.colors.join(','));
        if (filters.sizes.length > 0) queryParams.append('sizes', filters.sizes.join(','));

        const response = await fetch(`http://localhost:5000/api/products?${queryParams.toString()}`);
        const data = await response.json();
        // Handle both old format (array) and new format (object with products array)
        setProducts(Array.isArray(data) ? data : (data.products || []));
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [filters]);



  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("material", newProduct.material);
      formData.append("sustainabilityScore", newProduct.sustainabilityScore);
      formData.append("uploader", user.username);
      formData.append("brand", newProduct.brand);
      formData.append("price", newProduct.price);

      formData.append(
        "sizes",
        JSON.stringify(
          newProduct.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      );
      formData.append(
        "colors",
        JSON.stringify(
          newProduct.colors
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        )
      );

      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append("images", imageFiles[i]);
        }
      }
      if (newProduct.imageUrls) {
        newProduct.imageUrls
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
          .forEach((url) => {
            formData.append("imageUrls", url);
          });
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        const created = await res.json();
        setProducts((prev) => [created, ...prev]);
        setNewProduct({
          name: "",
          imageUrls: "",
          description: "",
          sustainabilityScore: "",
          material: "",
          brand: "",
          sizes: "",
          colors: "",
          price: "",
        });
        setImageFiles([]);
      } else {
        alert("Failed to add product");
      }
    } catch (err) {
      alert("Error adding product");
    }
    setAdding(false);
  };

  // Add to Cart handler (considers size/color)
  function handleAddToCart(product, selectedSize, selectedColor) {
    setCart((prevCart) => {
      const found = prevCart.find(
        (item) =>
          (item.id === product.id || item._id === product._id) &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );
      if (found) {
        return prevCart.map((item) =>
          (item.id === product.id || item._id === product._id) &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          ...product,
          selectedSize,
          selectedColor,
          quantity: 1,
        },
      ];
    });
  }

  function handleRemoveFromCart(idx) {
    setCart((prevCart) => prevCart.filter((_, i) => i !== idx));
  }

  function handleUpdateQuantity(idx, newQty) {
    setCart((prevCart) =>
      prevCart.map((item, i) =>
        i === idx ? { ...item, quantity: Math.max(1, newQty) } : item
      )
    );
  }

  function handleClearCart() {
    setCart([]);
  }

  const totalPrice = cart.reduce(
    (acc, item) => acc + Number(item.price) * (item.quantity || 1),
    0
  );

  // Show the payment dashboard on proceed
  function handleCheckout() {
    setShowPayment(true);
  }

  function handleBackToCart() {
    setShowPayment(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/40 via-cloud/80 to-gold/20 py-12 px-6 relative">
      {/* Subtle premium background pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      {/* Premium background texture */}

      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-10">
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="w-1.5 h-10 bg-gradient-to-b from-gold to-transparent rounded-full"></div>
              <h1 className="text-5xl sm:text-6xl font-heading font-black text-primary tracking-tight">
        {user && user.role === "supplier" ? "Your Products" : "Our Ethical Products"}
      </h1>
              <div className="w-1.5 h-10 bg-gradient-to-b from-gold to-transparent rounded-full"></div>
            </div>
            <div className="relative">
              <div className="w-64 h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gold rounded-full -mt-2"></div>
            </div>
          </div>
          <p className="text-stone/70 text-lg max-w-4xl mx-auto leading-relaxed font-medium">
            {user && user.role === "supplier" 
              ? "Manage and showcase your sustainable product collection with ease" 
              : "Discover ethically crafted products from sustainable brands worldwide"}
          </p>
        </div>

        {/* Signup Prompt for non-logged users */}
        {!user && (
          <div className="bg-gradient-to-r from-accent/20 via-gold/30 to-primary/20 rounded-3xl p-8 mb-16 border-2 border-gold/30 shadow-xl animate-pulse">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-heading font-bold text-primary mb-2">
                  🎉 Unlock Full Access!
              </h3>
                <p className="text-stone font-medium mb-2">
                  Join our community to save products, track orders, and get exclusive deals
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-stone/70">
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-gold text-sm">favorite</span>
                    Save favorites
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-gold text-sm">local_shipping</span>
                    Track orders
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-gold text-sm">discount</span>
                    15% off first order
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/login"
                  className="px-6 py-3 bg-primary text-gold font-bold rounded-full hover:bg-accent hover:text-cloud transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  <span className="material-icons">person_add</span>
                  Join Now
                </a>
                <button
                  onClick={() => document.getElementById('signup-prompt').style.display = 'none'}
                  className="px-6 py-3 bg-white/80 text-stone font-medium rounded-full hover:bg-white transition-all duration-200 border border-gold/30"
                >
                  Maybe Later
                </button>
                </div>
              </div>
          </div>
        )}

      {/* Enhanced Filters */}
      {!showPayment && (
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          brands={brands.map(brand => brand.name)}
          onApplyFilters={(newFilters) => {
            setFilters(newFilters);
          }}
          onClearFilters={() => {
            setFilters({
              search: '',
              sortBy: 'relevance',
              minPrice: '',
              maxPrice: '',
              category: 'all',
              brand: 'all',
              sustainability: 'all',
              dateRange: 'all',
              materials: [],
              colors: [],
              sizes: []
            });
          }}
        />
      )}

      {/* Add Product Form: Supplier only */}
      {!showPayment && user && user.role === "supplier" && (
        <div className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 sm:p-12 max-w-4xl mx-auto mb-20 relative overflow-hidden backdrop-blur-sm">
          {/* Premium accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-heading font-bold text-primary mb-4">
            Add New Product
          </h2>
              <p className="text-stone/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Add your product to the catalog. Please use high quality images for best results.
          </p>
              <div className="w-40 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6"></div>
            </div>
            
          <form
            onSubmit={handleAddProduct}
              className="grid gap-4 sm:gap-6"
            encType="multipart/form-data"
            aria-label="Product Submission Form"
          >
              {/* Product Name */}
              <div className="form-group mb-8">
                <label className="block text-sm font-bold text-primary mb-4 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                  Product Name *
              </label>
              <input
                  className="w-full px-6 py-5 border-2 border-gold/20 rounded-2xl bg-white/98 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                  placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
                aria-label="Product Name"
              />
            </div>

              {/* Description */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
                  Description *
              </label>
              <textarea
                  className="border-2 border-gold/30 p-3 rounded-xl w-full focus:ring-2 focus:ring-gold focus:border-gold transition-all hover:border-gold/50 font-medium text-primary placeholder-stone/60 resize-none"
                  placeholder="Describe your product in detail..."
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                required
                aria-label="Description"
                  rows={4}
              />
            </div>

              {/* Material and Sustainability Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Material *
                  </label>
              <input
                type="text"
                    placeholder="e.g., Organic Cotton, Hemp"
                value={newProduct.material}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, material: e.target.value })
                }
                    className="border-2 border-gold/30 p-3 rounded-xl w-full focus:ring-2 focus:ring-gold focus:border-gold transition-all hover:border-gold/50 font-medium text-primary placeholder-stone/60"
                required
              />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Sustainability Score *
                  </label>
              <input
                type="number"
                    placeholder="0-100"
                value={newProduct.sustainabilityScore}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    sustainabilityScore: e.target.value,
                  })
                }
                    className="border-2 border-gold/30 p-3 rounded-xl w-full focus:ring-2 focus:ring-gold focus:border-gold transition-all hover:border-gold/50 font-medium text-primary placeholder-stone/60"
                min={0}
                max={100}
                required
              />
            </div>
              </div>

              {/* Brand Selection */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
                  Brand *
                </label>
            <select
              value={newProduct.brand}
              onChange={(e) =>
                setNewProduct({ ...newProduct, brand: e.target.value })
              }
                  className="border-2 border-gold/30 p-3 rounded-xl w-full focus:ring-2 focus:ring-gold focus:border-gold transition-all hover:border-gold/50 font-medium text-primary bg-white"
              required
            >
                  <option value="">Select a brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
              </div>

              {/* Sizes and Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Available Sizes
                  </label>
            <input
              type="text"
                    placeholder="S, M, L, XL (comma separated)"
              value={newProduct.sizes}
              onChange={(e) =>
                setNewProduct({ ...newProduct, sizes: e.target.value })
              }
                    className="border-2 border-gold/30 p-3 rounded-xl w-full focus:ring-2 focus:ring-gold focus:border-gold transition-all hover:border-gold/50 font-medium text-primary placeholder-stone/60"
            />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Available Colors
                  </label>
            <input
              type="text"
                    placeholder="Red, Blue, Green (comma separated)"
              value={newProduct.colors}
              onChange={(e) =>
                setNewProduct({ ...newProduct, colors: e.target.value })
              }
                    className="border-2 border-gold/30 p-3 rounded-xl w-full focus:ring-2 focus:ring-gold focus:border-gold transition-all hover:border-gold/50 font-medium text-primary placeholder-stone/60"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
                  Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone font-medium">$</span>
            <input
              type="number"
                    placeholder="0.00"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
                    className="border-2 border-gold/30 p-3 pl-8 rounded-xl w-full focus:ring-2 focus:ring-gold focus:border-gold transition-all hover:border-gold/50 font-medium text-primary placeholder-stone/60"
                    step="0.01"
                    min="0"
              required
            />
                </div>
              </div>

              {/* Image URLs */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
                  Image URLs (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  value={newProduct.imageUrls}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, imageUrls: e.target.value })
                  }
                  className="border-2 border-gold/30 p-3 rounded-xl w-full focus:ring-2 focus:ring-gold focus:border-gold transition-all hover:border-gold/50 font-medium text-primary placeholder-stone/60"
                />
                <p className="text-xs text-stone mt-1">Separate multiple URLs with commas</p>
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
                  Upload Images
                </label>
                <div className="border-2 border-dashed border-gold/30 rounded-xl p-4 text-center hover:border-gold/50 transition-all cursor-pointer bg-gradient-to-r from-gold/5 to-sage/5 hover:from-gold/10 hover:to-sage/10">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-primary font-medium text-sm">Click to upload images</span>
                        <p className="text-stone/60 text-xs mt-1">PNG, JPG, GIF up to 10MB each</p>
                      </div>
                    </div>
                  </label>
                </div>
                {imageFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-primary font-medium mb-2">Selected files ({imageFiles.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="bg-sage/20 border border-sage/30 rounded-lg px-3 py-1 text-xs text-primary">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
            <button
                  className="w-full bg-gradient-to-r from-primary to-accent text-gold font-bold py-6 px-10 rounded-2xl text-xl shadow-2xl transition-all duration-300 border-2 border-gold/30 flex items-center justify-center gap-4 mt-10 hover:shadow-3xl hover:scale-[1.03] disabled:opacity-60 disabled:cursor-not-allowed group"
              aria-label="Submit Product"
              disabled={adding}
            >
                  <div className="w-3 h-3 bg-gold rounded-full"></div>
                {adding ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Product...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 2L11.09 8.26L18 9L11.09 9.74L10 16L8.91 9.74L2 9L8.91 8.26L10 2Z" fill="#ffd166"/>
                    </svg>
                    Add Product
                  </>
                )}
            </button>
          </form>
          </div>
        </div>
      )}
      {/* Products Grid */}
      {!showPayment && (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-gold mb-4"></div>
                <div className="text-primary font-semibold text-lg">Loading products...</div>
                <div className="text-stone/60 text-sm">Discovering sustainable fashion</div>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {products.map((p, index) => (
              <div key={p._id || p.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
              <ProductCard
                product={p}
                user={user}
                onAddToCart={(product, size, color) =>
                  handleAddToCart(product, size, color)
                }
              />
              </div>
            ))}
          </div>
          )}
          {products.length === 0 && (
            <div className="bg-white/80 border-2 border-gold/30 rounded-2xl shadow-lg p-8 text-center animate-fade-in">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-primary text-xl font-semibold mb-2">
              {user && user.role === "supplier"
                ? "You haven't uploaded any products yet."
                : "No products found."}
              </div>
              <div className="text-stone text-sm">
                {user && user.role === "supplier"
                  ? "Use the form above to add your first product!"
                  : "Try adjusting your search filters."}
              </div>
            </div>
          )}
        </>
      )}

      {/* Cart or Payment Section */}
      {showPayment ? (
        <PaymentDashboard
          cart={cart}
          totalPrice={totalPrice}
          onBack={handleBackToCart}
        />
      ) : (
        <div className="bg-white/90 border-2 border-gold rounded-3xl shadow-xl p-6 sm:p-8 max-w-xl mx-auto my-12 animate-fade-in">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6 flex items-center justify-center gap-3">
            <span className="inline-block bg-gold rounded-full p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="#14532d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="#14532d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="#14532d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Your Cart
          </h2>
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🛒</div>
              <div className="text-stone text-lg font-medium">Your cart is empty.</div>
              <div className="text-stone/60 text-sm">Add some products to get started!</div>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gold/20">
                {cart.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between py-4 transition-colors hover:bg-gold/5 rounded-lg px-2"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold block truncate text-primary">{item.name}</span>
                      {item.selectedSize && (
                        <span className="block text-xs text-stone">Size: {item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className="block text-xs text-stone">Color: {item.selectedColor}</span>
                      )}
                      <span className="block text-sm text-stone">${Number(item.price).toFixed(2)} each</span>
                      <span className="block text-md text-gold font-bold">
                        Subtotal: ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        className="px-3 py-1 bg-sage/20 border border-sage/30 rounded-lg hover:bg-sage/30 transition-all hover:scale-105 text-primary font-bold"
                        onClick={() => handleUpdateQuantity(idx, (item.quantity || 1) - 1)}
                        disabled={(item.quantity || 1) <= 1}
                        aria-label="Decrease quantity"
                      >−</button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity || 1}
                        onChange={e => handleUpdateQuantity(idx, Math.max(1, Number(e.target.value)))}
                        className="w-14 text-center border-2 border-gold/30 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold transition-all font-medium text-primary"
                      />
                      <button
                        className="px-3 py-1 bg-sage/20 border border-sage/30 rounded-lg hover:bg-sage/30 transition-all hover:scale-105 text-primary font-bold"
                        onClick={() => handleUpdateQuantity(idx, (item.quantity || 1) + 1)}
                        aria-label="Increase quantity"
                      >＋</button>
                      <button
                        className="ml-2 text-accent hover:text-red-600 hover:scale-110 transition-all p-1 rounded-lg hover:bg-red-50"
                        onClick={() => handleRemoveFromCart(idx)}
                        title="Remove from cart"
                        aria-label="Remove"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center font-bold text-xl mt-6 border-t border-gold/20 pt-4">
                <span className="text-primary">Total:</span>
                <span className="text-gold">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  className="flex-1 bg-sage/20 border border-sage/30 text-primary py-3 rounded-xl font-semibold shadow transition-all hover:bg-sage/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleClearCart}
                  disabled={cart.length === 0}
                >
                  Clear Cart
                </button>
                <button
                  className="flex-1 bg-primary hover:bg-accent text-gold font-semibold py-3 rounded-xl shadow-lg transition-all border-2 border-gold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-xl"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  Proceed to Payment
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <div className="py-8" />
      

      </div>
    </div>
  );
}