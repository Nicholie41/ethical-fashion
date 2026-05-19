import React from "react";

export default function Cart({ cartItems, totalPrice, onCheckout }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.90)",
      borderRadius: "1rem",
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      padding: "1.5rem",
      maxWidth: 480,
      margin: "2rem auto",
      position: "relative"
    }}>
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#15803d", marginBottom: "1rem" }}>Cart</h2>
      <div>
        {cartItems.length === 0 ? (
          <div style={{ color: "#666", textAlign: "center", padding: "2rem 0" }}>Your cart is empty.</div>
        ) : (
          cartItems.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0" }}>
              <span>{item.name}</span>
              <span>${Number(item.price).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
      <div style={{ fontWeight: "bold", fontSize: "1.25rem", color: "#16a34a", margin: "1.5rem 0 1rem" }}>
        Total: ${Number(totalPrice).toFixed(2)}
      </div>
      <button
        onClick={onCheckout}
        disabled={cartItems.length === 0}
        style={{
          width: "100%",
          background: "#16a34a",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.1rem",
          padding: "1rem",
          border: "none",
          borderRadius: "0.75rem",
          cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
          opacity: cartItems.length === 0 ? 0.6 : 1,
          boxShadow: "0 2px 8px rgba(22,163,74,0.10)",
          marginTop: "0.5rem"
        }}
      >
        Proceed to Payment
      </button>
    </div>
  );
}