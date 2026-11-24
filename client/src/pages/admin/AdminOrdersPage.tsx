import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  X,
  Truck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Selected Order for Modal View & Status Update
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { formatPrice } = useSettings();
  const { success, error } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetOrders({
        status: statusFilter,
        search,
        page,
        limit: 20,
      });
      if (res?.orders) {
        setOrders(res.orders);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search, page]);

  const handleOpenOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await api.adminUpdateOrderStatus(selectedOrder.id, {
        orderStatus: newStatus,
        paymentStatus: newPaymentStatus,
      });

      if (res?.order) {
        setSelectedOrder(res.order);
        setOrders(orders.map((o) => (o.id === res.order.id ? res.order : o)));
        success('Order status updated. Customer tracking reflects live changes.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/orders/admin/export-csv', '_blank');
  };

  const statuses = [
    'All',
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-sand-200">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Fulfillment & Logistics
          </p>
          <h1 className="font-serif text-3xl text-noir-900 font-normal">
            Orders Ledger ({total})
          </h1>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-white border border-sand-300 hover:bg-cream-100 text-noir-900 text-xs uppercase tracking-wider font-semibold flex items-center space-x-2 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-neutral-500" />
          <span>Export Orders to CSV</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 border border-sand-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            placeholder="Search by order ID, customer name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900 cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Order Statuses' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-sand-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-sand-200 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">Loading order records...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">No orders match criteria.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-noir-900">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-noir-900">{o.customerName}</p>
                      <p className="text-[10px] text-neutral-400">{o.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-noir-900">{formatPrice(o.total)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.paymentMethod} ({o.paymentStatus})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                        o.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-noir-900 text-cream-50'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenOrderModal(o)}
                        className="px-3 py-1 bg-white border border-sand-300 hover:bg-cream-100 text-noir-900 text-xs font-semibold rounded"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Management & Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-noir-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-sand-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-sand-200">
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Order Management</span>
                <h3 className="font-mono text-2xl font-bold text-noir-900">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-neutral-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Updater Controls */}
            <div className="p-4 bg-cream-50 border border-sand-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
              <div>
                <label className="block uppercase font-bold text-noir-800 mb-1">
                  Change Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 bg-white border border-sand-300 text-xs cursor-pointer font-semibold"
                >
                  {statuses.filter((s) => s !== 'All').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase font-bold text-noir-800 mb-1">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full p-2 bg-white border border-sand-300 text-xs cursor-pointer font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleUpdateStatus}
                  className="w-full py-2 bg-noir-900 text-cream-50 font-bold uppercase tracking-wider hover:bg-noir-800 transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </div>

            {/* Shipping & Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-4 border-b border-sand-200">
              <div className="space-y-1">
                <span className="uppercase text-neutral-400 font-bold block mb-1">Customer & Destination</span>
                <p className="font-semibold text-noir-900">{selectedOrder.customerName}</p>
                <p className="text-neutral-600">{selectedOrder.shippingStreet}</p>
                <p className="text-neutral-600">{selectedOrder.shippingCity}, {selectedOrder.shippingState} - {selectedOrder.shippingPincode}</p>
                {selectedOrder.shippingLandmark && <p className="text-neutral-500">Landmark: {selectedOrder.shippingLandmark}</p>}
                <p className="text-neutral-600">Email: {selectedOrder.customerEmail}</p>
                <p className="text-neutral-600">Phone: {selectedOrder.customerPhone}</p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="uppercase text-neutral-400 font-bold block mb-1">Payment Summary</span>
                <p>Method: <strong>{selectedOrder.paymentMethod}</strong></p>
                <p>Status: <strong>{selectedOrder.paymentStatus}</strong></p>
                {selectedOrder.notes && (
                  <p className="pt-2 text-neutral-500 italic">Instructions: "{selectedOrder.notes}"</p>
                )}
              </div>
            </div>

            {/* Purchased Items */}
            <div>
              <h4 className="font-semibold uppercase tracking-wider text-noir-900 text-xs mb-3">
                Ordered Articles ({selectedOrder.items?.length})
              </h4>
              <div className="divide-y divide-sand-200 border-t border-b border-sand-200">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-3">
                      {item.productImage && (
                        <img src={item.productImage} alt="" className="w-12 h-16 object-cover bg-sand-100" />
                      )}
                      <div>
                        <p className="font-semibold text-noir-900">{item.productName}</p>
                        <p className="text-neutral-500">{item.selectedSize} / {item.selectedColor} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-noir-900">{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="max-w-xs ml-auto space-y-1.5 text-xs text-right">
              <p>Subtotal: {formatPrice(selectedOrder.subtotal)}</p>
              {selectedOrder.discount > 0 && <p className="text-emerald-700">Coupon Discount: -{formatPrice(selectedOrder.discount)}</p>}
              <p>Shipping: {selectedOrder.shippingFee === 0 ? 'Complimentary' : formatPrice(selectedOrder.shippingFee)}</p>
              <p className="text-base font-bold text-noir-900 pt-2 border-t border-sand-200">
                Total: {formatPrice(selectedOrder.total)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
