import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_ROOT = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : "http://localhost:5000";


// Demo fallback images for known brands
const brandImages = {
  "EcoWear": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&q=80",
  "GreenStyle": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=256&q=80",
  "PureEarth": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=facearea&w=256&q=80",
  "Sustainify": "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=256&q=80",
  "Conscious Cotton": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=facearea&w=256&q=80"
};

const API_URL = `${API_ROOT}/api/brands`;

export default function Brands({ user }) {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    imageUrl: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(allBrands => {
        if (user && user.role === "supplier") {
          setBrands(allBrands.filter(b => b.uploader === user.username));
        } else {
          setBrands(allBrands.filter(b => b.approved));
        }
      });
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("No token provided. Please log in again.");
      return;
    }
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ ...form, uploader: user?.username }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Brand submitted for approval!");
      setForm({ name: "", description: "", website: "", imageUrl: "" });
      fetch(API_URL)
        .then(res => res.json())
        .then(allBrands => setBrands(allBrands.filter(b => b.uploader === user.username)));
    } else {
      setMessage(data.error || "Submission failed");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/30 to-cloud/80 py-12 px-2">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-heading font-extrabold mb-12 text-primary tracking-tight text-center drop-shadow-lg">
        {user && user.role === "supplier" ? "Your Brands" : "Our Trusted Brands"}
      </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-20">
        {brands.map(b => (
          <Link
            to={`/brands/${b._id}`}
            key={b._id}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] py-8 px-6 flex flex-col justify-between items-center text-center border-2 border-gold group focus:outline-none focus:ring-2 focus:ring-gold transform"
            aria-label={`View profile for ${b.name}`}
              tabIndex={0}
          >
              <div className="w-full flex flex-col items-center">
                <div className="w-full h-28 flex items-center justify-center mb-4">
              <img
                src={b.imageUrl || brandImages[b.name] || "https://placehold.co/96x96?text=Brand"}
                alt={`${b.name} logo`}
                    className="object-contain h-28 w-full rounded-2xl bg-cloud border-2 border-gold shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 ease-out"
                loading="lazy"
              />
            </div>
                <h2 className="font-heading font-extrabold text-lg text-primary mb-2 truncate group-hover:text-accent transition-colors" style={{ maxWidth: '90%' }}>{b.name}</h2>
                <p className="text-stone text-sm mb-3 font-light line-clamp-2" style={{ maxWidth: '95%' }}>{b.description.length > 120 ? b.description.slice(0, 120) + '...' : b.description}</p>
            <a
              href={b.website}
                  className="text-primary underline text-sm font-medium hover:text-accent break-words mb-3"
              target="_blank"
              rel="noopener noreferrer"
                  tabIndex={-1}
                  style={{ maxWidth: '95%', overflowWrap: 'break-word' }}
            >
              {b.website.replace("https://", "").replace("http://", "")}
            </a>
              </div>
              <div className="mt-4 pt-2 text-sm flex flex-col items-center gap-2 w-full">
                {b.approved ? (
                  <span className="bg-gold/80 text-primary font-bold text-xs px-4 py-1 rounded-full shadow border-2 border-gold animate-fade-in flex items-center gap-1"><span className="material-icons text-base align-middle">verified</span> Approved</span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 font-bold text-xs px-4 py-1 rounded-full shadow border-2 border-yellow-200 animate-fade-in flex items-center gap-1"><span className="material-icons text-base align-middle">hourglass_empty</span> Pending Approval</span>
                )}
              </div>
          </Link>
        ))}
        </div>
      </div>
      {/* Only allow suppliers to see the submission form */}
      {user && user.role === "supplier" && (
        <div className="bg-white/98 border border-gold/30 rounded-3xl shadow-2xl p-10 sm:p-12 max-w-4xl mx-auto mb-20 relative overflow-hidden backdrop-blur-sm">
          {/* Premium accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-sage to-gold"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-heading font-bold text-primary mb-4">
                Submit Your Brand
              </h3>
              <p className="text-stone/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Are you an ethical brand? Join our network. Please provide a professional logo image URL for best results.
          </p>
              <div className="w-40 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6"></div>
            </div>
            
            {message && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center font-medium">
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8" aria-label="Brand Submission Form">
              {/* Brand Name */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-3" htmlFor="brand-name">
                  <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                  Brand Name *
                </label>
              <input
                  className="w-full px-6 py-5 border-2 border-gold/20 rounded-2xl bg-white/98 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                id="brand-name"
                  placeholder="Enter your brand name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                aria-label="Brand Name"
              />
            </div>

              {/* Description */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-3" htmlFor="brand-description">
                  <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                  Description *
                </label>
              <textarea
                  className="w-full px-6 py-5 border-2 border-gold/20 rounded-2xl bg-white/98 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-xl hover:shadow-2xl resize-none"
                id="brand-description"
                  placeholder="Describe your brand, its values, and what makes it unique..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                aria-label="Description"
                  rows="4"
              />
            </div>

              {/* Website */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-3" htmlFor="brand-website">
                  <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                  Website
                </label>
              <input
                  className="w-full px-6 py-5 border-2 border-gold/20 rounded-2xl bg-white/98 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                id="brand-website"
                  placeholder="https://yourbrand.com"
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
                aria-label="Website"
                type="url"
              />
            </div>

              {/* Logo Image URL */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-3" htmlFor="brand-image">
                  <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                  Logo Image URL
                </label>
                <div className="relative">
              <input
                    className="w-full px-6 py-5 border-2 border-gold/20 rounded-2xl bg-white/98 focus:ring-4 focus:ring-gold/20 focus:border-gold/50 transition-all duration-300 font-medium text-primary placeholder-stone/40 shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                id="brand-image"
                placeholder="Logo Image URL (recommended min. 256x256, square)"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                aria-label="Logo Image URL"
                type="url"
              />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone/40 text-sm">
                    PNG, JPG, GIF
                  </div>
                </div>
            </div>

              {/* Submit Button */}
              <button 
                className="w-full bg-gradient-to-r from-primary to-accent text-gold font-bold py-6 px-10 rounded-2xl text-xl shadow-2xl transition-all duration-300 border-2 border-gold/30 flex items-center justify-center gap-4 mt-10 hover:shadow-3xl hover:scale-[1.03] group" 
                aria-label="Submit Brand"
              >
                <div className="w-3 h-3 bg-gold rounded-full"></div>
                Submit Brand
            </button>
          </form>
          </div>
        </div>
      )}
      {/* Optional: Add spacing below */}
      <div className="py-8" />
    </div>
  );
}