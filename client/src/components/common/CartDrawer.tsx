import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart();

  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-noir-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-sand-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-sand-200 flex items-center justify-between bg-cream-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-noir-900" />
              <h2 className="font-serif text-lg font-medium tracking-wide uppercase text-noir-900">
                Your Shopping Bag
              </h2>
              <span className="text-xs text-neutral-500 font-medium">({items.length})</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-noir-700 hover:text-black rounded-full hover:bg-sand-200 transition-colors"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="p-4 bg-cream-100/70 border-b border-sand-200 text-xs">
            {amountNeededForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <p className="text-noir-800 font-medium flex items-center justify-between">
                  <span>Add {formatPrice(amountNeededForFreeShipping)} more for Free Shipping</span>
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                </p>
                <div className="w-full bg-sand-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-emerald-800 font-medium">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>You unlocked Complimentary Express Shipping!</span>
              </div>
            )}
          </div>

          {/* Item List or Empty State */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-sand-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-normal text-noir-900">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Discover refined silhouettes, tailored suits, and luxurious cashmere from our current Atelier collection.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="mt-4 px-6 py-2.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="pt-4 first:pt-0 flex space-x-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={() => setIsCartOpen(false)}
                    className="w-20 h-26 bg-sand-100 flex-shrink-0 overflow-hidden block"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs font-medium text-noir-900 hover:text-accent transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                          className="text-neutral-400 hover:text-red-600 transition-colors ml-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-1 space-x-2">
                        <span>Size: <strong className="text-noir-800">{item.selectedSize}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-noir-800">{item.selectedColor}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-sand-300">
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-noir-700 hover:bg-cream-100"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-noir-700 hover:bg-cream-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs font-semibold text-noir-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-sand-200 bg-cream-50 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-xs uppercase tracking-widest text-neutral-600 font-medium">Estimated Subtotal</span>
                <span className="font-semibold text-noir-900 text-base">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[10px] text-neutral-500">
                Taxes and coupon discounts calculated during checkout.
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="block text-center py-2.5 border border-sand-300 bg-white hover:bg-cream-100 text-noir-900 text-xs uppercase tracking-widest font-semibold transition-colors"
                >
                  View Full Cart & Apply Coupons
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
