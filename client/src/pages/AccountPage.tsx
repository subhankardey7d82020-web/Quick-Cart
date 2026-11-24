import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Lock,
  Heart,
  LogOut,
  Plus,
  Trash2,
  ExternalLink,
  Truck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Order, Address } from '../types';

export const AccountPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { formatPrice } = useSettings();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist' | 'security'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // New Address state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
    isDefault: false,
  });

  // Selected Order for Modal View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [ordersRes, addrRes] = await Promise.all([
          api.getMyOrders(),
          api.getAddresses(),
        ]);
        if (ordersRes?.orders) setOrders(ordersRes.orders);
        if (addrRes?.addresses) setAddresses(addrRes.addresses);
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await api.updateProfile({ name, phone });
      await refreshUser();
      success('Profile updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);
    try {
      await api.updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      success('Password updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAddress(newAddress);
      if (res?.address) {
        setAddresses([res.address, ...addresses]);
        setShowAddressForm(false);
        setNewAddress({
          fullName: '',
          phone: '',
          street: '',
          city: '',
          state: 'Maharashtra',
          pincode: '',
          landmark: '',
          isDefault: false,
        });
        success('New address added.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id?: number) => {
    if (!id) return;
    try {
      await api.deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      success('Address removed.');
    } catch (err: any) {
      error(err.message || 'Failed to delete address.');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you certain you wish to cancel this order?')) return;
    try {
      const res = await api.cancelOrder(orderId);
      if (res?.order) {
        setOrders(orders.map((o) => (o.id === orderId ? res.order : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(res.order);
        }
        success('Order cancelled successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Could not cancel order.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-sand-200 flex flex-col sm:flex-row justify-between items-baseline gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Client Concierge
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal">
            Account of {user?.name}
          </h1>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center space-x-1.5 text-xs uppercase tracking-widest text-red-600 hover:text-red-700 font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Navigation Tabs Sidebar */}
        <div className="lg:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold text-left transition-colors ${
              activeTab === 'orders' ? 'bg-noir-900 text-cream-50' : 'bg-white hover:bg-cream-100 text-noir-800 border border-sand-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold text-left transition-colors ${
              activeTab === 'profile' ? 'bg-noir-900 text-cream-50' : 'bg-white hover:bg-cream-100 text-noir-800 border border-sand-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold text-left transition-colors ${
              activeTab === 'addresses' ? 'bg-noir-900 text-cream-50' : 'bg-white hover:bg-cream-100 text-noir-800 border border-sand-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold text-left transition-colors ${
              activeTab === 'wishlist' ? 'bg-noir-900 text-cream-50' : 'bg-white hover:bg-cream-100 text-noir-800 border border-sand-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold text-left transition-colors ${
              activeTab === 'security' ? 'bg-noir-900 text-cream-50' : 'bg-white hover:bg-cream-100 text-noir-800 border border-sand-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-9 bg-white border border-sand-200 p-6 sm:p-8 shadow-xs">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-normal uppercase tracking-wider text-noir-900 pb-3 border-b border-sand-200">
                Your Orders
              </h2>

              {loadingOrders ? (
                <p className="text-xs text-neutral-500">Loading order records...</p>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-neutral-300 mx-auto" />
                  <p className="text-xs text-neutral-500">You have not placed any orders yet.</p>
                  <Link to="/shop" className="inline-block px-4 py-2 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold">
                    Browse Store
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="p-4 border border-sand-200 bg-cream-50/40 hover:bg-cream-50 transition-colors space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-sand-200 text-xs">
                        <div>
                          <span className="font-mono font-bold text-noir-900">{o.orderNumber}</span>
                          <span className="text-neutral-400 mx-2">•</span>
                          <span className="text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                            o.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-noir-900 text-cream-50'
                          }`}>
                            {o.orderStatus}
                          </span>
                          <span className="text-neutral-400">|</span>
                          <span className="font-semibold text-noir-900">{formatPrice(o.total)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 text-xs text-neutral-600">
                          <span>{o.items?.length || 0} articles</span>
                          <span>•</span>
                          <span>Payment: {o.paymentMethod} ({o.paymentStatus})</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-3 py-1.5 bg-white border border-sand-300 text-xs uppercase tracking-wider font-semibold text-noir-900 hover:bg-cream-100"
                          >
                            View Order Details
                          </button>
                          <Link
                            to={`/order-tracking?orderNumber=${o.orderNumber}`}
                            className="px-3 py-1.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 flex items-center space-x-1"
                          >
                            <Truck className="w-3.5 h-3.5 text-accent" />
                            <span>Track</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="font-serif text-xl font-normal uppercase tracking-wider text-noir-900 pb-3 border-b border-sand-200">
                Personal Profile
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    Email Address (Account ID)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full p-2.5 bg-neutral-100 border border-sand-300 text-xs text-neutral-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-neutral-400">Email addresses are tied to your order records.</span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98201 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-2.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors disabled:opacity-50"
                >
                  {updatingProfile ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-sand-200">
                <h2 className="font-serif text-xl font-normal uppercase tracking-wider text-noir-900">
                  Shipping Addresses
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-3 py-1.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-wider font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Add New Address Form Modal/Toggle */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="p-4 bg-cream-50 border border-sand-200 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">Add New Shipping Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase text-neutral-600 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className="w-full p-2 bg-white border border-sand-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-neutral-600 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full p-2 bg-white border border-sand-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-600 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full p-2 bg-white border border-sand-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase text-neutral-600 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full p-2 bg-white border border-sand-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-neutral-600 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full p-2 bg-white border border-sand-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-neutral-600 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="w-full p-2 bg-white border border-sand-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button type="submit" className="px-5 py-2 bg-noir-900 text-cream-50 text-xs uppercase tracking-wider font-semibold">
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border border-sand-300 text-xs uppercase tracking-wider text-noir-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 border border-sand-200 bg-cream-50/50 space-y-2 relative">
                    {addr.isDefault && (
                      <span className="inline-block px-2 py-0.5 bg-noir-900 text-cream-50 text-[10px] uppercase font-bold tracking-wider">
                        Default Address
                      </span>
                    )}
                    <p className="font-semibold text-xs text-noir-900">{addr.fullName}</p>
                    <p className="text-xs text-neutral-600">{addr.street}</p>
                    <p className="text-xs text-neutral-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-xs text-neutral-500">Phone: {addr.phone}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-neutral-400 hover:text-red-600 text-xs flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-normal uppercase tracking-wider text-noir-900 pb-3 border-b border-sand-200">
                Your Saved Pieces ({wishlist.length})
              </h2>

              {wishlist.length === 0 ? (
                <p className="text-xs text-neutral-500">You haven't saved any items yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="p-3 border border-sand-200 flex space-x-3 items-center">
                      <img src={item.images?.[0]?.url} alt="" className="w-16 h-20 object-cover bg-sand-100 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Link to={`/product/${item.slug}`} className="text-xs font-semibold text-noir-900 hover:text-accent line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-xs font-bold text-noir-900">{formatPrice(item.price)}</p>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-[11px] text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="font-serif text-xl font-normal uppercase tracking-wider text-noir-900 pb-3 border-b border-sand-200">
                Change Password
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    New Password (Min. 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-6 py-2.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors disabled:opacity-50"
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-noir-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-sand-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-sand-200">
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Order Details</span>
                <h3 className="font-mono text-xl font-bold text-noir-900">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-neutral-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-black font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="uppercase text-neutral-400 font-semibold block mb-1">Shipping Details</span>
                <p className="font-semibold text-noir-900">{selectedOrder.customerName}</p>
                <p className="text-neutral-600">{selectedOrder.shippingStreet}</p>
                <p className="text-neutral-600">{selectedOrder.shippingCity}, {selectedOrder.shippingState} - {selectedOrder.shippingPincode}</p>
                <p className="text-neutral-600">Phone: {selectedOrder.customerPhone}</p>
              </div>
              <div className="text-right">
                <span className="uppercase text-neutral-400 font-semibold block mb-1">Status</span>
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-noir-900 text-cream-50 rounded">
                  {selectedOrder.orderStatus}
                </span>
                <p className="text-neutral-500 mt-2">Payment: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
              </div>
            </div>

            {/* Articles List */}
            <div className="divide-y divide-sand-200 border-y border-sand-200 py-2">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-noir-900">{item.productName}</p>
                    <p className="text-neutral-500">{item.selectedSize} / {item.selectedColor} × {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-noir-900">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="space-y-1.5 text-xs text-right">
              <p>Subtotal: {formatPrice(selectedOrder.subtotal)}</p>
              {selectedOrder.discount > 0 && <p className="text-emerald-700">Discount: -{formatPrice(selectedOrder.discount)}</p>}
              <p>Shipping: {selectedOrder.shippingFee === 0 ? 'Free' : formatPrice(selectedOrder.shippingFee)}</p>
              <p className="text-sm font-bold text-noir-900 pt-1 border-t border-sand-200">
                Total: {formatPrice(selectedOrder.total)}
              </p>
            </div>

            {/* Actions: Cancel if Pending */}
            <div className="flex justify-between items-center pt-4 border-t border-sand-200">
              {selectedOrder.orderStatus !== 'Cancelled' && selectedOrder.orderStatus !== 'Delivered' && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs uppercase tracking-wider font-semibold"
                >
                  Cancel Order
                </button>
              )}

              <Link
                to={`/order-confirmation/${selectedOrder.orderNumber}`}
                className="ml-auto px-4 py-2 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800"
              >
                Print / View Receipt
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
