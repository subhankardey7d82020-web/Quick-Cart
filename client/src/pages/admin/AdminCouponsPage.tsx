import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, X, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { Coupon } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { formatPrice } = useSettings();
  const { success, error } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetCoupons();
      if (res?.coupons) setCoupons(res.coupons);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinSpend('999');
    setMaxDiscount('1500');
    setUsageLimit('200');
    setExpiresAt('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(String(c.discountValue));
    setMinSpend(String(c.minSpend || 0));
    setMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : '');
    setUsageLimit(c.usageLimit ? String(c.usageLimit) : '');
    setExpiresAt(c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : '');
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      error('Code and discount amount are required.');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minSpend: minSpend ? parseFloat(minSpend) : 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      isActive,
    };

    try {
      if (editingCoupon) {
        await api.adminUpdateCoupon(editingCoupon.id, payload);
        success('Coupon updated successfully.');
      } else {
        await api.adminCreateCoupon(payload);
        success('Coupon created successfully.');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      error(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.adminDeleteCoupon(id);
      setCoupons(coupons.filter((c) => c.id !== id));
      success('Coupon deleted.');
    } catch (err: any) {
      error(err.message || 'Failed to delete coupon.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-sand-200">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Marketing & Promotions
          </p>
          <h1 className="font-serif text-3xl text-noir-900 font-normal">
            Promotional Coupons
          </h1>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white border border-sand-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-sand-200 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Spend</th>
                <th className="py-3 px-4">Usage Limit</th>
                <th className="py-3 px-4">Times Redeemed</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">Loading coupons...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">No promotional coupons configured.</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-noir-900 text-sm">
                      <span className="p-1.5 bg-sand-100 border border-sand-200 rounded tracking-wider">{c.code}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </td>
                    <td className="py-3 px-4">{formatPrice(c.minSpend)}</td>
                    <td className="py-3 px-4">{c.usageLimit ? `${c.usageLimit} total` : 'Unlimited'}</td>
                    <td className="py-3 px-4 font-semibold text-noir-900">{c.timesUsed} times</td>
                    <td className="py-3 px-4 text-neutral-500">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-neutral-500 hover:text-noir-900 hover:bg-cream-100 rounded"
                        title="Edit Coupon"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-noir-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-sand-200">
            <div className="flex justify-between items-center pb-4 border-b border-sand-200">
              <h3 className="font-serif text-xl font-normal text-noir-900">
                {editingCoupon ? 'Modify Coupon' : 'Create Promotional Code'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LUXE10 or WELCOME20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs font-mono uppercase focus:outline-none focus:border-noir-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="10 or 500"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Min. Purchase (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="999"
                    value={minSpend}
                    onChange={(e) => setMinSpend(e.target.value)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="1500 (Optional)"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    placeholder="200 (Optional)"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-noir-900"
                  />
                  <span className="font-semibold">Activate this coupon code immediately</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-sand-300 text-xs uppercase tracking-wider font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold hover:bg-noir-800 transition-colors shadow-sm"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
