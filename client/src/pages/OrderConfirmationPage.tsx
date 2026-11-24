import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Printer, ArrowRight, Truck, MapPin, Package } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const { formatPrice } = useSettings();

  const [order, setOrder] = useState<Order | null>(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderNumber) {
      api.trackOrder(orderNumber)
        .then((res) => {
          if (res?.order) setOrder(res.order);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [order, orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-2 border-noir-900 border-t-transparent rounded-full mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-500">Generating order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl text-noir-900">Order Not Located</h2>
        <p className="text-xs text-neutral-500">Unable to find details for reference {orderNumber}.</p>
        <Link to="/shop" className="inline-block px-6 py-3 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Success Badge & Headline */}
      <div className="text-center space-y-3 pb-8 border-b border-sand-200">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-sm animate-in zoom-in">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">
          Order Confirmed & Logged
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal">
          Thank you for choosing Quick Cart Atelier
        </h1>
        <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
          Your order reference is <strong className="font-mono text-noir-900">{order.orderNumber}</strong>. A confirmation has been registered for {order.customerEmail}.
        </p>
      </div>

      {/* Action Bar (Print & Track) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-cream-100 p-4 border border-sand-200">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-neutral-500">Payment Status:</span>
          <span className={`px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] ${
            order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {order.paymentStatus} ({order.paymentMethod})
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-sand-300 text-xs uppercase tracking-wider font-semibold text-noir-900 hover:bg-cream-50 flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-neutral-500" />
            <span>Print Invoice</span>
          </button>

          <Link
            to={`/order-tracking?orderNumber=${order.orderNumber}&phone=${encodeURIComponent(order.customerPhone)}`}
            className="px-4 py-2 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Truck className="w-4 h-4 text-accent" />
            <span>Track Order</span>
          </Link>
        </div>
      </div>

      {/* Invoice Details Layout */}
      <div className="bg-white border border-sand-200 p-6 sm:p-8 space-y-8 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs pb-6 border-b border-sand-200">
          <div className="space-y-1">
            <span className="uppercase tracking-widest text-neutral-400 font-semibold block mb-1">
              Delivery Address
            </span>
            <p className="font-semibold text-noir-900">{order.customerName}</p>
            <p className="text-neutral-600">{order.shippingStreet}</p>
            <p className="text-neutral-600">{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</p>
            {order.shippingLandmark && <p className="text-neutral-500 italic">Landmark: {order.shippingLandmark}</p>}
            <p className="text-neutral-600">Phone: {order.customerPhone}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="uppercase tracking-widest text-neutral-400 font-semibold block mb-1">
              Order Information
            </span>
            <p><strong className="text-neutral-500">Order ID:</strong> {order.orderNumber}</p>
            <p><strong className="text-neutral-500">Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong className="text-neutral-500">Payment:</strong> {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Demo Instant Payment'}</p>
            <p><strong className="text-neutral-500">Order Status:</strong> <span className="font-semibold text-noir-900">{order.orderStatus}</span></p>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div>
          <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 mb-4">
            Purchased Articles
          </h3>
          <div className="divide-y divide-sand-200 border-t border-b border-sand-200">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  {item.productImage && (
                    <img src={item.productImage} alt="" className="w-12 h-16 object-cover bg-sand-100" />
                  )}
                  <div>
                    <p className="font-semibold text-noir-900">{item.productName}</p>
                    <p className="text-neutral-500">
                      {item.selectedSize} / {item.selectedColor} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-noir-900">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="max-w-xs ml-auto space-y-2 text-xs tracking-wider">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span className="font-semibold text-noir-900">{formatPrice(order.subtotal)}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-neutral-600">
            <span>Expedited Delivery</span>
            <span>{order.shippingFee === 0 ? 'Complimentary' : formatPrice(order.shippingFee)}</span>
          </div>

          <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline text-sm">
            <span className="font-bold uppercase tracking-wider text-noir-900">Total Paid/Due</span>
            <span className="font-serif text-xl font-bold text-noir-900">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-noir-900 hover:text-accent font-semibold"
        >
          <span>Continue Browsing Boutique</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
