import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle2, Clock, Truck, AlertCircle, Home } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';

interface TimelineStep {
  status: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [isCancelled, setIsCancelled] = useState(false);

  const { formatPrice } = useSettings();

  const handleTrackSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim()) {
      setErrorMsg('Please enter your order reference (e.g. QC-202611-1042).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.trackOrder(orderNumber.trim().toUpperCase(), phone.trim() || undefined);
      if (res && res.order) {
        setOrder(res.order);
        setTimeline(res.timeline || []);
        setIsCancelled(res.isCancelled || false);
        setSearchParams({ orderNumber: orderNumber.trim().toUpperCase(), phone: phone.trim() });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No order found matching your tracking reference.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      handleTrackSubmit();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Live Logistics Concierge
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal">
          Track Your Atelier Parcel
        </h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          Monitor your shipment's journey from our Mumbai atelier to your doorstep in real-time.
        </p>
      </div>

      {/* Tracking Search Box */}
      <div className="p-6 bg-white border border-sand-200 shadow-sm max-w-2xl mx-auto">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                Order Reference *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. QC-202611-1042"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-cream-50 border border-sand-300 text-xs font-mono uppercase focus:outline-none focus:border-noir-900"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                Contact Phone (Verification)
              </label>
              <input
                type="tel"
                placeholder="e.g. 9820112345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-cream-50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Locating Parcel...' : 'Track Shipment'}</span>
          </button>
        </form>
      </div>

      {/* Visual Tracking Timeline */}
      {order && (
        <div className="bg-white border border-sand-200 p-6 sm:p-8 space-y-8 shadow-xs animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-sand-200 gap-2">
            <div>
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold block">
                Tracking Reference
              </span>
              <h2 className="font-mono text-xl font-bold text-noir-900">{order.orderNumber}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500">Current Status:</span>
              <span className={`ml-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                order.orderStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.orderStatus === 'Cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-noir-900 text-cream-50'
              }`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          {isCancelled ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-800">
                This Order has been Cancelled
              </h3>
              <p className="text-xs text-red-600 max-w-sm mx-auto">
                No further parcel transit will take place. If you have any inquiries, please reach our concierge.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
                {/* Connecting Line for desktop */}
                <div className="hidden md:block absolute top-1/2 left-6 right-6 h-0.5 bg-sand-200 -translate-y-1/2 z-0" />

                {timeline.map((step, idx) => (
                  <div
                    key={step.status}
                    className="relative z-10 flex md:flex-col items-center space-x-4 md:space-x-0 md:space-y-2 text-left md:text-center flex-1"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.isCompleted
                          ? 'bg-noir-900 text-white border-noir-900 shadow-sm'
                          : step.isCurrent
                          ? 'bg-accent text-white border-accent ring-4 ring-accent/20 animate-pulse'
                          : 'bg-white text-neutral-300 border-sand-300'
                      }`}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${
                        step.isCompleted || step.isCurrent ? 'text-noir-900' : 'text-neutral-400'
                      }`}>
                        {step.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Destination & Articles Preview */}
          <div className="pt-6 border-t border-sand-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-semibold uppercase tracking-widest text-noir-900 mb-2">
                Shipping Destination
              </h4>
              <p className="font-semibold text-noir-900">{order.customerName}</p>
              <p className="text-neutral-600">{order.shippingStreet}</p>
              <p className="text-neutral-600">{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</p>
              <p className="text-neutral-600">Contact: {order.customerPhone}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold uppercase tracking-widest text-noir-900 mb-2">
                Articles in Parcel ({order.items?.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-cream-50 border border-sand-200">
                    <span className="font-medium text-noir-900 truncate max-w-[200px]">{item.productName}</span>
                    <span className="text-neutral-500">{item.selectedSize} × {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
