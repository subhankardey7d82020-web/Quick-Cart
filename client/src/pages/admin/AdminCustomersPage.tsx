import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected customer for details modal
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const { formatPrice } = useSettings();
  const { success, error } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetCustomers({ search });
      if (res?.customers) {
        setCustomers(res.customers);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleViewCustomer = async (id: number) => {
    setLoadingDetails(true);
    try {
      const res = await api.adminGetCustomerDetails(id);
      if (res?.customer) {
        setSelectedCustomer(res.customer);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load customer details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await api.adminToggleCustomer(id);
      setCustomers(customers.map((c) => (c.id === id ? { ...c, isActive: res.customer.isActive } : c)));
      if (selectedCustomer?.id === id) {
        setSelectedCustomer({ ...selectedCustomer, isActive: res.customer.isActive });
      }
      success(res.message || 'Customer status updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update customer status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-sand-200">
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
          Client Relations
        </p>
        <h1 className="font-serif text-3xl text-noir-900 font-normal">
          Registered Atelier Customers ({total})
        </h1>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 border border-sand-200 shadow-xs relative max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
        />
        <Search className="w-4 h-4 text-neutral-400 absolute left-7 top-6.5" />
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-sand-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-sand-200 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">Loading client directory...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-noir-900">{c.name}</p>
                      <p className="text-[11px] text-neutral-400">{c.email}</p>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{c.phone || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold text-noir-900">{c.orderCount} orders</td>
                    <td className="py-3 px-4 font-semibold text-noir-900">{formatPrice(c.totalSpent)}</td>
                    <td className="py-3 px-4 text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewCustomer(c.id)}
                        className="px-3 py-1 bg-white border border-sand-300 hover:bg-cream-100 text-noir-900 font-semibold rounded text-xs"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-noir-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-sand-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-sand-200">
              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Client Dossier</span>
                <h3 className="font-serif text-2xl font-normal text-noir-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-neutral-500">{selectedCustomer.email} • {selectedCustomer.phone || 'No phone recorded'}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-cream-50 border border-sand-200">
                <span className="text-neutral-400 uppercase tracking-wider block mb-1">Lifetime Value</span>
                <p className="text-lg font-bold text-noir-900">{formatPrice(selectedCustomer.totalSpent)}</p>
              </div>
              <div className="p-3 bg-cream-50 border border-sand-200">
                <span className="text-neutral-400 uppercase tracking-wider block mb-1">Total Orders</span>
                <p className="text-lg font-bold text-noir-900">{selectedCustomer.orders?.length || 0}</p>
              </div>
            </div>

            {/* Customer Orders */}
            <div>
              <h4 className="font-semibold uppercase tracking-wider text-xs text-noir-900 mb-3">
                Order History
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedCustomer.orders?.map((o: any) => (
                  <div key={o.id} className="p-3 border border-sand-200 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-mono font-bold text-noir-900">{o.orderNumber}</p>
                      <p className="text-[10px] text-neutral-400">{new Date(o.createdAt).toLocaleDateString()} • {o.items?.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-noir-900">{formatPrice(o.total)}</p>
                      <span className="text-[10px] uppercase font-bold text-neutral-500">{o.orderStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-sand-200 flex justify-between items-center">
              <button
                onClick={() => handleToggleStatus(selectedCustomer.id)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded ${
                  selectedCustomer.isActive
                    ? 'border border-red-300 text-red-600 hover:bg-red-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedCustomer.isActive ? 'Deactivate Customer Account' : 'Reactivate Account'}
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-sand-300 text-xs uppercase tracking-wider font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
