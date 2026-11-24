import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Truck,
} from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useSettings();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.adminGetDashboard();
        setStats(res);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-2 border-noir-900 border-t-transparent rounded-full mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
          Aggregating store telemetry...
        </p>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    lowStockCount: 0,
  };

  const salesChart = stats?.salesChart || [];
  const recentOrders = stats?.recentOrders || [];
  const lowStockProducts = stats?.lowStockProducts || [];
  const topSelling = stats?.topSellingProducts || [];

  // Max value for chart normalization
  const maxRevenue = Math.max(...salesChart.map((s: any) => s.revenue), 1000);

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
          Executive Overview
        </p>
        <h1 className="font-serif text-3xl text-noir-900 font-normal">
          Boutique Performance Dashboard
        </h1>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 border border-sand-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Revenue</span>
            <div className="p-2 bg-emerald-50 rounded-full text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-noir-900">
            {formatPrice(summary.totalRevenue)}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Excluding cancelled orders</span>
        </div>

        <div className="bg-white p-5 border border-sand-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Orders</span>
            <div className="p-2 bg-noir-50 rounded-full text-noir-900">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-noir-900">
            {summary.totalOrders}
          </p>
          <span className="text-[11px] text-neutral-500">{summary.pendingOrders} pending / confirmed</span>
        </div>

        <div className="bg-white p-5 border border-sand-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Active Catalog</span>
            <div className="p-2 bg-sand-100 rounded-full text-noir-900">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-noir-900">
            {summary.totalProducts}
          </p>
          <span className="text-[11px] text-neutral-500">{summary.lowStockCount} items at low stock</span>
        </div>

        <div className="bg-white p-5 border border-sand-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Registered Clients</span>
            <div className="p-2 bg-accent-light rounded-full text-accent">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-noir-900">
            {summary.totalCustomers}
          </p>
          <span className="text-[11px] text-neutral-500">{summary.deliveredOrders} orders fulfilled</span>
        </div>
      </div>

      {/* Main Row: 7-Day Revenue Chart + Low Stock Alert Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-white border border-sand-200 p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-sand-200">
            <div>
              <h3 className="font-serif text-lg font-normal text-noir-900">Recent Revenue Trajectory</h3>
              <p className="text-xs text-neutral-400">Daily gross revenue over the past 7 days</p>
            </div>
            <span className="text-xs uppercase tracking-wider text-accent font-semibold">Live Feed</span>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {salesChart.map((item: any) => {
              const heightPercent = Math.max(8, Math.round((item.revenue / maxRevenue) * 100));
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-semibold text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatPrice(item.revenue)}
                  </span>
                  <div
                    className="w-full bg-sand-200 hover:bg-accent rounded-t transition-all duration-500 cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                    title={`${item.date}: ${formatPrice(item.revenue)}`}
                  />
                  <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts & Quick Status */}
        <div className="lg:col-span-4 bg-white border border-sand-200 p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-sand-200">
            <h3 className="font-serif text-lg font-normal text-noir-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Stock Alerts</span>
            </h3>
            <Link to="/admin/products" className="text-xs text-accent hover:underline font-semibold">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-neutral-500">Inventory levels are currently healthy.</p>
            ) : (
              lowStockProducts.map((p: any) => (
                <div key={p.id} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-noir-900 line-clamp-1">{p.name}</p>
                    <span className="text-[10px] text-neutral-500 font-mono">SKU: {p.sku}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-800 text-white font-bold text-[10px] rounded">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders Table + Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white border border-sand-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-sand-200">
            <h3 className="font-serif text-lg font-normal text-noir-900">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs text-accent hover:underline font-semibold flex items-center space-x-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-sand-200 text-neutral-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-cream-50 transition-colors">
                    <td className="py-3 font-mono font-bold text-noir-900">{o.orderNumber}</td>
                    <td className="py-3 text-noir-800">{o.customerName}</td>
                    <td className="py-3 font-semibold text-noir-900">{formatPrice(o.total)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                        o.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-noir-900 text-cream-50'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link to="/admin/orders" className="text-accent hover:underline font-semibold">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-4 bg-white border border-sand-200 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-sand-200">
            <h3 className="font-serif text-lg font-normal text-noir-900">Top Performing Items</h3>
            <p className="text-xs text-neutral-400">By units disbursed</p>
          </div>

          <div className="space-y-3">
            {topSelling.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-cream-50 border border-sand-100 text-xs">
                <div className="space-y-0.5 max-w-[180px]">
                  <p className="font-semibold text-noir-900 truncate">{item.name}</p>
                  <span className="text-[10px] text-neutral-500">{item.soldCount} units sold</span>
                </div>
                <span className="font-bold text-noir-900">{formatPrice(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
