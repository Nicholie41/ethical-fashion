import React, { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaCheckCircle, FaHourglassHalf, FaTimes, FaGlobe } from "react-icons/fa";

/**
 * SupplierBrands page
 * Shows supplier's uploaded brands (pending & approved), lets them add, edit, or delete brands.
 * Expects props: user (object with .username, .role), token (JWT string)
 */
export default function SupplierBrands({ user, token }) {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const fileInputRef = useRef();
  const editFileInputRef = useRef();

  // Debug log for token value
  useEffect(() => {
    console.log("SupplierBrands token:", token);
  }, [token]);

  // Load supplier's brands from backend using /api/brands/mine
  const loadBrands = async () => {
    if (!token) {
      setMessage("No token provided. Please log in again.");
      return;
    }
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
    if (user && user.role === "supplier" && token) {
      loadBrands();
    }
    // eslint-disable-next-line
  }, [user, token]);

  // Handle brand upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!token) {
      setMessage("No token provided. Please log in again.");
      return;
    }
    if (!name || !link || !description || !image) {
      setMessage("Please fill in all the fields and select an image.");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("link", link);
    formData.append("description", description);
    formData.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/api/brands", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        setMessage("Brand submitted! Awaiting approval.");
        setName("");
        setLink("");
        setDescription("");
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadBrands();
      } else {
        const errRes = await res.json();
        setMessage(errRes.error || "Upload failed.");
      }
    } catch (err) {
      setMessage("Network error.");
    }
  };

  // Start edit
  const handleEdit = (brand) => {
    setEditingId(brand._id);
    setEditName(brand.name);
    setEditLink(brand.link || "");
    setEditDescription(brand.description || "");
    setEditImage(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditLink("");
    setEditDescription("");
    setEditImage(null);
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!token) {
      setMessage("No token provided. Please log in again.");
      return;
    }
    if (!editName || !editLink || !editDescription) {
      setMessage("Please fill in all the fields.");
      return;
    }
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("link", editLink);
    formData.append("description", editDescription);
    if (editImage) formData.append("image", editImage);

    try {
      const res = await fetch(`http://localhost:5000/api/brands/${editingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        setMessage("Brand updated.");
        setEditingId(null);
        loadBrands();
      } else {
        const errRes = await res.json();
        setMessage(errRes.error || "Edit failed.");
      }
    } catch (err) {
      setMessage("Network error.");
    }
  };

  // Delete
  const handleDelete = async (brandId) => {
    if (!window.confirm("Delete this brand? This cannot be undone.")) return;
    setMessage("");
    if (!token) {
      setMessage("No token provided. Please log in again.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/brands/${brandId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("Brand deleted.");
        loadBrands();
      } else {
        setMessage("Delete failed.");
      }
    } catch (err) {
      setMessage("Network error.");
    }
  };

  // Calculate stats
  const totalBrands = brands.length;
  const approvedBrands = brands.filter(b => b.approved).length;
  const pendingBrands = brands.filter(b => !b.approved).length;
  const recentBrands = brands.slice(-3).reverse();

  if (!user || user.role !== "supplier") {
    return (
      <div className="max-w-xl mx-auto mt-8 text-red-600">
        Unauthorized: Only suppliers can access this page.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="w-full max-w-xl mx-auto mb-8 animate-fade-in">
        <div className="bg-white/90 border-2 border-gold rounded-3xl shadow-xl p-6 flex flex-col gap-4">
          <h2 className="text-xl font-heading font-bold text-primary mb-2 flex items-center gap-2">
            <span className="inline-block bg-gold rounded-full p-1"><svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#ffd166"/><path d="M24 36c-6-4-10-8-10-14 0-5 4-9 10-9s10 4 10 9c0 6-4 10-10 14z" fill="#14532d"/><text x="24" y="28" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="bold" fill="#e07a5f">EF</text></svg></span>
            Supplier Brands Dashboard
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="flex flex-col items-center bg-sage/40 rounded-xl p-3 border border-sage/30">
              <span className="text-2xl font-bold text-primary">{totalBrands}</span>
              <span className="text-xs text-stone">Total Brands</span>
            </div>
            <div className="flex flex-col items-center bg-sage/40 rounded-xl p-3 border border-sage/30">
              <span className="text-2xl font-bold text-gold">{approvedBrands}</span>
              <span className="text-xs text-stone">Approved</span>
            </div>
            <div className="flex flex-col items-center bg-sage/40 rounded-xl p-3 border border-sage/30">
              <span className="text-2xl font-bold text-accent">{pendingBrands}</span>
              <span className="text-xs text-stone">Pending</span>
            </div>
          </div>
          {recentBrands.length > 0 && (
            <div className="mt-2">
              <div className="font-semibold text-primary mb-1">Recent Brands</div>
              <ul className="divide-y divide-sage/40">
                {recentBrands.map(b => (
                  <li key={b._id} className="py-2 text-xs flex flex-col gap-1">
                    <span className="font-bold text-stone">{b.name}</span>
                    <span className="text-stone">{b.approved ? <span className="text-green-700">Approved</span> : <span className="text-yellow-700">Pending</span>}</span>
                    <span className="text-stone">{b.link}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4">Your Brands</h2>
      {brands.length === 0 && (
        <div className="text-gray-500 mb-4">
          You haven’t submitted any brands yet. Use the form below to add your first brand!
        </div>
      )}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {brands.map((b) =>
          editingId === b._id ? (
            <li key={b._id} className="bg-white/98 border-2 border-gold rounded-3xl shadow-2xl p-8 flex flex-col gap-6 animate-fade-in backdrop-blur-sm">
              <div className="text-center mb-4">
                <h4 className="text-2xl font-heading font-bold text-primary mb-2">Edit Brand</h4>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
              </div>
              
              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-primary uppercase tracking-wider">Brand Name</label>
                <input
                    className="w-full px-5 py-4 border-2 border-gold/20 rounded-2xl bg-white/95 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-lg hover:shadow-xl"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Brand Name"
                    required
                />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-primary uppercase tracking-wider">Website</label>
                <input
                    className="w-full px-5 py-4 border-2 border-gold/20 rounded-2xl bg-white/95 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-lg hover:shadow-xl"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  placeholder="Website"
                  type="url"
                    required
                />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-primary uppercase tracking-wider">Description</label>
                <textarea
                    className="w-full px-5 py-4 border-2 border-gold/20 rounded-2xl bg-white/95 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-lg hover:shadow-xl resize-none"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                    rows="3"
                    required
                />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-primary uppercase tracking-wider">Logo Image</label>
                <input
                    className="w-full px-5 py-4 border-2 border-gold/20 rounded-2xl bg-white/95 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-lg hover:shadow-xl"
                  type="file"
                  accept="image/*"
                  ref={editFileInputRef}
                  onChange={(e) => setEditImage(e.target.files[0])}
                />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-gold font-bold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 border-2 border-gold/30 hover:shadow-2xl hover:scale-[1.02]"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-stone/20 text-primary font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 border-2 border-stone/30 hover:shadow-xl hover:scale-[1.02]"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </li>
          ) : (
            <li key={b._id} className="relative bg-white border-2 border-gold rounded-3xl shadow-xl p-8 flex flex-col items-center group hover:shadow-2xl hover:-translate-y-2 transition-all animate-fade-in overflow-hidden">
              {/* Logo area */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-gold shadow-lg bg-sage/40 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-200">
                  {b.imageUrl ? (
                <img
                  src={b.imageUrl}
                  alt={b.name}
                      className="w-20 h-20 object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-3xl text-gold font-bold">{b.name?.[0] || '?'}</span>
                  )}
                </div>
                {/* Animated status badge */}
                <span className={`absolute -top-2 -right-2 px-4 py-1 rounded-full text-xs font-bold border-2 shadow flex items-center gap-1 animate-badge-appear
                  ${b.approved ? 'bg-gold/90 text-primary border-gold' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                  style={{ zIndex: 2 }}>
                  {b.approved ? <FaCheckCircle className="text-green-600" /> : <FaHourglassHalf className="text-yellow-600" />} {b.approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div className="flex-1 min-w-0 z-10 flex flex-col items-center text-center">
                <span className="font-bold text-primary text-lg truncate mb-1" title={b.name}>{b.name}</span>
                {b.link ? (
                  <a href={b.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary underline hover:text-accent text-sm mb-1 justify-center"><FaGlobe className="text-gold" />{b.link.replace(/^https?:\/\//, "")}</a>
                ) : (
                  <span className="flex items-center gap-1 text-stone text-sm mb-1 justify-center"><FaGlobe className="text-gold" /> No website</span>
                )}
                <div className="text-stone text-xs font-medium mb-2 line-clamp-3 max-w-xs">{b.description}</div>
              </div>
              <div className="flex flex-row gap-2 items-center mt-4 z-10 justify-center">
              <button
                  className="flex items-center gap-1 bg-black hover:bg-gold text-gold hover:text-black border-2 border-gold px-4 py-2 rounded-full shadow-lg text-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gold ripple"
                onClick={() => handleEdit(b)}
                  title="Edit"
                  style={{ minWidth: 44, minHeight: 44 }}
              >
                  <FaEdit />
              </button>
              <button
                  className="flex items-center gap-1 bg-black hover:bg-gold text-gold hover:text-black border-2 border-gold px-4 py-2 rounded-full shadow-lg text-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gold ripple"
                onClick={() => handleDelete(b._id)}
                  title="Delete"
                  style={{ minWidth: 44, minHeight: 44 }}
              >
                  <FaTrash />
              </button>
              </div>
            </li>
          )
        )}
      </ul>
      {/* Add New Brand Form */}
      <div className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 sm:p-12 max-w-4xl mx-auto mb-20 relative overflow-hidden backdrop-blur-sm">
        {/* Premium accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-heading font-bold text-primary mb-4">
              Add New Brand
            </h3>
            <p className="text-stone/60 text-lg max-w-2xl mx-auto leading-relaxed">
              Add your brand to the catalog. Please use high quality images and provide detailed information.
            </p>
            <div className="w-40 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Brand Name */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                Brand Name *
              </label>
        <input
                className="w-full px-6 py-5 border-2 border-gold/20 rounded-2xl bg-white/98 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                placeholder="Enter brand name"
          value={name}
          onChange={(e) => setName(e.target.value)}
                required
        />
            </div>

            {/* Website */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                Website *
              </label>
        <input
                className="w-full px-6 py-5 border-2 border-gold/20 rounded-2xl bg-white/98 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                placeholder="https://yourbrand.com"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
                required
        />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                Description *
              </label>
        <textarea
                className="w-full px-6 py-5 border-2 border-gold/20 rounded-2xl bg-white/98 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-xl hover:shadow-2xl resize-none"
                placeholder="Describe your brand, its values, and what makes it unique..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
                rows="4"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                Brand Logo *
              </label>
              <div className="relative">
        <input
                  className="w-full px-6 py-5 border-2 border-gold/20 rounded-2xl bg-white/98 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-xl hover:shadow-2xl hover:scale-[1.01]"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setImage(e.target.files[0])}
                  required
        />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone/40 text-sm">
                  PNG, JPG, GIF up to 10MB
                </div>
              </div>
            </div>

            {/* Submit Button */}
        <button
          type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-gold font-bold py-6 px-10 rounded-2xl text-xl shadow-2xl transition-all duration-300 border-2 border-gold/30 flex items-center justify-center gap-4 mt-10 hover:shadow-3xl hover:scale-[1.03] disabled:opacity-60 disabled:cursor-not-allowed group"
        >
              <div className="w-3 h-3 bg-gold rounded-full"></div>
          Upload Brand
        </button>
      </form>

          {message && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-center font-medium">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}