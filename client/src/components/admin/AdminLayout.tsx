import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If not admin, redirect or show unauthorized
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-cream-100">
        <div className="max-w-md w-full bg-white p-8 text-center space-y-4 border border-sand-300 shadow-md">
          <ShieldCheck className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="font-serif text-2xl text-noir-900">Restricted Admin Area</h2>
          <p className="text-xs text-neutral-500">
            You must be signed in with administrator privileges to access this console.
          </p>
          <Link
            to="/admin/login"
            className="inline-block px-6 py-2.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-widest font-semibold"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full justify-between bg-noir-900 text-cream-100">
      <div>
        {/* Brand Monogram */}
        <div className="p-6 border-b border-noir-800">
          <Link to="/admin" className="block">
            <span className="font-serif text-xl tracking-widest uppercase font-medium text-white">
              {settings.storeName}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block mt-0.5">
              Control Atelier
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-noir-900 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-noir-800'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Storefront Link & Logout */}
      <div className="p-4 border-t border-noir-800 space-y-2">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded text-xs text-neutral-400 hover:text-white hover:bg-noir-800 transition-colors"
        >
          <span className="flex items-center space-x-2">
            <ExternalLink className="w-4 h-4" />
            <span>View Live Storefront</span>
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3.5 py-2 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100/60 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-noir-800">
        <div className="fixed inset-y-0 w-64">
          {SidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-noir-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 h-full z-10 animate-in slide-in-from-left">
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Header */}
        <header className="h-16 bg-white border-b border-sand-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-noir-800 hover:text-black"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold hidden sm:inline">
              Administrative Console
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-xs font-semibold text-noir-900 block">{user?.name}</span>
              <span className="text-[10px] text-accent uppercase font-bold tracking-wider">Super Administrator</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-noir-900 text-accent font-serif font-bold text-xs flex items-center justify-center">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
