import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, shippingFee, discount, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useSettings();
  const { error, success } = useToast();
  const navigate = useNavigate();

  // Customer Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: 'Maharashtra',
    shippingPincode: '',
    shippingLandmark: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'DEMO_INSTANT'>('COD');
  const [submitting, setSubmitting] = useState(false);

  // Autofill if logged in user has address or profile info
  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || defaultAddr?.phone || prev.customerPhone,
        shippingStreet: defaultAddr?.street || prev.shippingStreet,
        shippingCity: defaultAddr?.city || prev.shippingCity,
        shippingState: defaultAddr?.state || prev.shippingState,
        shippingPincode: defaultAddr?.pincode || prev.shippingPincode,
        shippingLandmark: defaultAddr?.landmark || prev.shippingLandmark,
      }));
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-noir-900">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-neutral-500">Please add items to your bag before proceeding to checkout.</p>
        <Link to="/shop" className="inline-block px-6 py-3 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold">
          Return to Boutique
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.customerEmail.trim() || !formData.customerPhone.trim()) {
      error('Please complete all contact details.');
      return;
    }

    if (!formData.shippingStreet.trim() || !formData.shippingCity.trim() || !formData.shippingPincode.trim()) {
      error('Please provide a complete shipping address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          productImage: i.image,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
        })),
        couponCode: appliedCoupon?.code || undefined,
      };

      const res = await api.createOrder(payload);

      if (res && res.order) {
        success('Order placed successfully!');
        clearCart();
        navigate(`/order-confirmation/${res.order.orderNumber}`, { state: { order: res.order } });
      }
    } catch (err: any) {
      error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const indianStates = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh',
    'Telangana', 'West Bengal', 'Rajasthan', 'Kerala', 'Madhya Pradesh', 'Punjab',
    'Haryana', 'Goa', 'Andhra Pradesh', 'Bihar', 'Odisha', 'Assam'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 pb-4 border-b border-sand-200">
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
          Secure Checkout
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal">
          Shipping & Payment Details
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Customer and Shipping Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Contact Information */}
            <div className="p-6 bg-white border border-sand-200 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-2 border-b border-sand-200">
                1. Customer Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    Phone Number (for SMS & tracking) *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    placeholder="e.g. +91 98201 12345"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                  Email Address (for order invoice & status) *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  placeholder="e.g. eleanor@example.com"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-6 bg-white border border-sand-200 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-2 border-b border-sand-200">
                2. Doorstep Shipping Address
              </h3>

              <div>
                <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                  Street Address & Flat / House / Building *
                </label>
                <input
                  type="text"
                  name="shippingStreet"
                  required
                  placeholder="e.g. Flat 402, Royale Crest, 14th Road"
                  value={formData.shippingStreet}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="shippingCity"
                    required
                    placeholder="e.g. Mumbai"
                    value={formData.shippingCity}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    State *
                  </label>
                  <select
                    name="shippingState"
                    value={formData.shippingState}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900 cursor-pointer"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="shippingPincode"
                    required
                    placeholder="e.g. 400050"
                    value={formData.shippingPincode}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="shippingLandmark"
                  placeholder="e.g. Near Heritage Arch or Central Park"
                  value={formData.shippingLandmark}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                  Special Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  name="notes"
                  placeholder="e.g. Please leave with security desk or ring twice..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="p-6 bg-white border border-sand-200 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-2 border-b border-sand-200">
                3. Payment Method
              </h3>

              <div className="space-y-3">
                {/* Cash On Delivery Option */}
                <label
                  className={`flex items-start p-4 border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-noir-900 bg-cream-50/80 shadow-xs ring-1 ring-noir-900'
                      : 'border-sand-300 hover:border-sand-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 mr-3 text-noir-900 focus:ring-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold uppercase tracking-wider text-noir-900">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100/60 px-2 py-0.5 font-semibold">
                        Zero Surcharge
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      Pay easily via Cash or UPI at your doorstep upon parcel arrival. Inspect the luxury packaging before payment.
                    </p>
                  </div>
                </label>

                {/* Demo Payment Mode for instant testing */}
                <label
                  className={`flex items-start p-4 border cursor-pointer transition-all ${
                    paymentMethod === 'DEMO_INSTANT'
                      ? 'border-noir-900 bg-cream-50/80 shadow-xs ring-1 ring-noir-900'
                      : 'border-sand-300 hover:border-sand-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DEMO_INSTANT"
                    checked={paymentMethod === 'DEMO_INSTANT'}
                    onChange={() => setPaymentMethod('DEMO_INSTANT')}
                    className="mt-1 mr-3 text-noir-900 focus:ring-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold uppercase tracking-wider text-noir-900">
                        Demo Mode Instant Payment (Testing)
                      </span>
                      <span className="text-[10px] text-accent bg-accent-light px-2 py-0.5 font-semibold">
                        Free Simulation
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      Instantly simulates an authenticated payment without any real gateway or charges. Perfect for evaluating the admin order workflow!
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Review */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-white border border-sand-200 shadow-sm space-y-6 sticky top-28">
              <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-3 border-b border-sand-200">
                Order Review ({items.length} pieces)
              </h3>

              {/* Items Mini List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-sand-100">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="pt-3 first:pt-0 flex space-x-3 text-xs">
                    <img src={item.image} alt="" className="w-12 h-16 object-cover bg-sand-100 flex-shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <p className="font-medium text-noir-900 line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {item.selectedSize} / {item.selectedColor} × {item.quantity}
                      </p>
                      <p className="font-semibold text-noir-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="pt-4 border-t border-sand-200 space-y-2.5 text-xs tracking-wider">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-noir-900">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>Expedited Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <strong className="text-emerald-700 uppercase">Complimentary</strong>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline text-sm">
                  <span className="font-bold uppercase tracking-wider text-noir-900">Total Payable</span>
                  <span className="font-serif text-2xl font-bold text-noir-900">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-noir-900 hover:bg-noir-800 disabled:bg-neutral-400 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 shadow-xl transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>{submitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              </button>

              <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
                By placing this order you acknowledge our 14-day complimentary return policy and terms of service.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
