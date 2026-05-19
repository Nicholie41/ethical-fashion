import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PaymentPage() {
  // Get cart from location state or localStorage (for demo, use localStorage)
  let cartItems = [];
  let totalPrice = 0;
  try {
    const stored = localStorage.getItem("cartItems");
    if (stored) cartItems = JSON.parse(stored);
    totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * (item.quantity || 1),
      0
    );
  } catch {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/40 to-cloud/80 py-12 px-2">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border-2 border-gold p-8">
        <h1 className="text-3xl font-heading font-bold text-primary mb-6 text-center">Payment Dashboard</h1>
        <h2 className="text-xl font-semibold text-primary mb-4">Order Summary</h2>
        {cartItems.length === 0 ? (
          <div className="text-gray-500 text-center mb-8">Your cart is empty.</div>
        ) : (
          <ul className="mb-6 divide-y divide-sage/40">
            {cartItems.map((item, idx) => (
              <li key={item.id + (item.size || '') + (item.color || '') + idx} className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <span className="font-bold text-stone text-base">{item.name}</span>
                  {item.size && <span className="ml-2 bg-gold/80 text-primary font-semibold px-2 py-0.5 rounded-full border border-gold/60 text-xs">Size: {item.size}</span>}
                  {item.color && <span className="ml-2 bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full border border-yellow-200 text-xs">Color: {item.color}</span>}
                </div>
                <span className="text-base font-semibold text-primary">${Number(item.price).toFixed(2)} x {item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between items-center font-bold text-xl mt-6 border-t border-gold/30 pt-4 mb-8">
          <span>Total:</span>
          <span className="text-gold">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="bg-sage/30 rounded-xl p-6 text-center mb-6">
          <span className="text-lg font-semibold text-primary">[Payment details and integration coming soon]</span>
        </div>
        <Link to="/products" className="inline-block mt-2 text-primary underline font-semibold">&larr; Back to Products</Link>
      </div>
    </div>
  );
} 