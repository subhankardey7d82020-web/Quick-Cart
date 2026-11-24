import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Sparkles, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export const CartPage: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shippingFee,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart();

  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplying(true);
    try {
      await applyCoupon(couponInput);
      setCouponInput('');
    } catch (err) {
      // toast shown in context
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center text-neutral-400 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-normal text-noir-900">Your Shopping Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          You currently have no pieces in your shopping bag. Explore our latest ready-to-wear silhouettes and luxury outerwear.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors shadow-md"
        >
          Explore Boutique Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="border-b border-sand-200 pb-6 flex flex-col sm:flex-row justify-between items-baseline gap-2">
        <h1 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal">
          Shopping Bag
        </h1>
        <button
          onClick={clearCart}
          className="text-xs uppercase tracking-wider text-neutral-500 hover:text-red-600 transition-colors"
        >
          Clear Entire Bag
        </button>
      </div>

      {/* Free Shipping Alert Meter */}
      <div className="p-4 bg-cream-100/80 border border-sand-200">
        {amountNeededForFreeShipping > 0 ? (
          <div className="space-y-2 max-w-xl">
            <p className="text-xs text-noir-800 font-medium flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>
                Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> more to receive Complimentary Express Shipping.
              </span>
            </p>
            <div className="w-full bg-sand-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-emerald-800 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Congratulations! You qualify for Complimentary Express Doorstep Shipping.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Items Table / List */}
        <div className="lg:col-span-8">
          <div className="divide-y divide-sand-200 border-y border-sand-200">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product thumbnail + details */}
                <div className="flex space-x-4 items-center">
                  <Link
                    to={`/product/${item.slug}`}
                    className="w-20 h-26 sm:w-24 sm:h-32 bg-sand-100 flex-shrink-0 overflow-hidden block"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </Link>

                  <div className="space-y-1">
                    <Link
                      to={`/product/${item.slug}`}
                      className="text-sm font-medium text-noir-900 hover:text-accent transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-neutral-500 space-x-2">
                      <span>Size: <strong className="text-noir-800">{item.selectedSize}</strong></span>
                      <span>•</span>
                      <span>Color: <strong className="text-noir-800">{item.selectedColor}</strong></span>
                    </div>
                    <p className="text-xs font-semibold text-noir-900">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls and Total */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                  <div className="flex items-center border border-sand-300 bg-white">
                    <button
                      onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                      className="px-3 py-1 text-sm hover:bg-cream-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                      className="px-3 py-1 text-sm hover:bg-cream-100 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-noir-900 min-w-20 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                    className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <Link
              to="/shop"
              className="text-xs uppercase tracking-widest text-noir-800 hover:text-accent font-semibold inline-flex items-center space-x-2"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4">
          <div className="p-6 bg-white border border-sand-200 shadow-sm space-y-6">
            <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-3 border-b border-sand-200">
              Order Summary
            </h3>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs tracking-wider">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-noir-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Estimated Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-emerald-700 uppercase">Complimentary</strong>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline text-sm">
                <span className="font-semibold uppercase tracking-wider text-noir-900">Estimated Total</span>
                <span className="font-serif text-xl font-bold text-noir-900">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-4 border-t border-sand-200">
              <label className="block text-xs uppercase tracking-widest text-noir-900 font-semibold mb-2">
                Promotional Coupon
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded">
                  <div className="flex items-center space-x-2 text-xs text-emerald-800">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied!</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-neutral-400 hover:text-red-600"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. LUXE10, ATELIER20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-cream-50 border border-sand-300 text-xs uppercase tracking-wider focus:outline-none focus:border-noir-900"
                  />
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-4 py-2 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50"
                  >
                    {applying ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              <p className="text-[10px] text-neutral-400 mt-1.5">
                Try codes: <strong>LUXE10</strong> (10% off) or <strong>FIRST500</strong> (₹500 off)
              </p>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
