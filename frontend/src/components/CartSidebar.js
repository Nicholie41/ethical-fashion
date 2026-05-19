import React from "react";
import { FaTimes, FaTrash, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";

export default function CartSidebar({
  open,
  onClose,
  cartItems,
  onAdd,
  onRemove,
  onUpdateQuantity,
  onClear,
  totalPrice,
  onCheckout
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxWidth: 400 }}
      >
        {/* Header */}
        <div className="bg-primary text-gold p-6 border-b-2 border-gold">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaShoppingCart className="text-2xl" />
              <h2 className="text-xl font-bold">Shopping Cart</h2>
            </div>
            <button 
              className="p-2 rounded-full hover:bg-gold/20 transition-colors"
              onClick={onClose}
              aria-label="Close cart"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          {cartItems.length > 0 && (
            <p className="text-sm mt-2 opacity-90">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
            </p>
          )}
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <FaShoppingCart className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
              <p className="text-gray-500">Add some products to get started!</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {cartItems.map((item, index) => {
                    const uniqueKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`;
                    return (
                    <div key={uniqueKey} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary text-sm mb-1">{item.name}</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {item.size && (
                              <span className="bg-gold/80 text-primary font-semibold px-2 py-0.5 rounded-full border border-gold/60 text-xs">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full border border-yellow-200 text-xs">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-bold text-primary">
                            ${Number(item.price).toFixed(2)}
                          </div>
                        </div>
                        <button
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          onClick={() => onRemove(uniqueKey)}
                          aria-label="Remove item"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            className="w-8 h-8 rounded-full bg-primary text-gold hover:bg-accent hover:text-cloud transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => onUpdateQuantity(uniqueKey, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-12 text-center font-semibold text-primary">
                            {item.quantity}
                          </span>
                          <button
                            className="w-8 h-8 rounded-full bg-primary text-gold hover:bg-accent hover:text-cloud transition-colors flex items-center justify-center"
                            onClick={() => onUpdateQuantity(uniqueKey, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Subtotal</div>
                          <div className="font-bold text-primary">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>

              {/* Cart Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-primary">Total:</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3">
                  <button
                    className="w-full bg-primary text-gold font-bold py-3 rounded-xl hover:bg-accent hover:text-cloud transition-all duration-200 shadow-lg"
                    onClick={onCheckout}
                    disabled={cartItems.length === 0}
                  >
                    <FaShoppingCart className="inline mr-2" />
                    Proceed to Checkout
                  </button>
                  
                  <button
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition-colors"
                    onClick={onClear}
                    disabled={cartItems.length === 0}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}