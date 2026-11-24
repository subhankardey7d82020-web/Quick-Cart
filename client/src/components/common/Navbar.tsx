import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useSettings();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?isNewArrival=true' },
    { label: 'Best Sellers', href: '/shop?isBestSeller=true' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-cream-50/95 backdrop-blur-md shadow-sm border-b border-sand-200/60'
          : 'bg-cream-50 border-b border-sand-200/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-noir-900 hover:text-accent transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-center sm:items-start group">
              <span className="font-serif text-2xl sm:text-3xl tracking-widest text-noir-900 uppercase font-medium group-hover:text-accent transition-colors">
                {settings.storeName || 'QUICK CART'}
              </span>
              <span className="text-[9px] tracking-widest uppercase text-noir-700/80 -mt-1 hidden sm:block font-medium">
                {settings.storeTagline || 'Atelier & Boutique'}
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || location.search.includes(link.href.split('?')[1] || '---');
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-xs uppercase tracking-luxury font-medium transition-colors hover:text-accent ${
                    isActive ? 'text-accent border-b border-accent pb-0.5' : 'text-noir-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Icon / Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-noir-800 hover:text-accent transition-colors relative"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 text-noir-800 hover:text-accent transition-colors relative"
              aria-label="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-noir-900 text-cream-50 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account Icon / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="p-2 text-noir-800 hover:text-accent transition-colors flex items-center space-x-1"
                aria-label="User Account"
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {accountMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border border-sand-200 shadow-xl rounded-md py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setAccountMenuOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Signed in as</p>
                        <p className="text-sm font-medium text-noir-900 truncate">{user?.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/account"
                        className="flex items-center justify-between px-4 py-2.5 text-xs tracking-wider uppercase text-noir-800 hover:bg-cream-100 transition-colors"
                      >
                        <span>Customer Dashboard</span>
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </Link>

                      <Link
                        to="/order-tracking"
                        className="flex items-center justify-between px-4 py-2.5 text-xs tracking-wider uppercase text-noir-800 hover:bg-cream-100 transition-colors"
                      >
                        <span>Track Orders</span>
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center justify-between px-4 py-2.5 text-xs tracking-wider uppercase font-semibold text-accent hover:bg-cream-100 transition-colors border-t border-b border-sand-100"
                        >
                          <span className="flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Portal</span>
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}

                      <button
                        onClick={logout}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs tracking-wider uppercase text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="flex items-center space-x-2">
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 text-center border-b border-sand-100">
                        <p className="text-xs text-noir-700 mb-2 font-medium">Welcome to {settings.storeName}</p>
                        <Link
                          to="/login"
                          className="block w-full py-2 bg-noir-900 text-cream-50 text-xs uppercase tracking-wider font-semibold hover:bg-noir-800 transition-colors rounded"
                        >
                          Sign In
                        </Link>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-xs uppercase tracking-wider text-noir-800 hover:bg-cream-100 transition-colors"
                        >
                          Create Account
                        </Link>
                        <Link
                          to="/order-tracking"
                          className="block px-4 py-2 text-xs uppercase tracking-wider text-noir-800 hover:bg-cream-100 transition-colors"
                        >
                          Track Order
                        </Link>
                        <Link
                          to="/admin/login"
                          className="flex items-center space-x-1.5 px-4 py-2 text-xs uppercase tracking-wider text-accent font-semibold hover:bg-cream-100 transition-colors border-t border-sand-100"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin Login</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag Icon with Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-noir-800 hover:text-accent transition-colors relative"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-cream-50 text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Overlay Bar */}
        {searchOpen && (
          <div className="py-3 px-2 border-t border-sand-200 animate-in fade-in slide-in-from-top-1">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search cashmere coats, silk dresses, linen shirts, leather bags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-24 py-3 bg-white border border-sand-300 rounded-none text-sm text-noir-900 placeholder-neutral-400 focus:outline-none focus:border-noir-900 transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-noir-900 text-cream-50 text-xs uppercase tracking-wider font-semibold hover:bg-noir-800 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sand-200 bg-cream-50 px-6 py-6 space-y-4 animate-in slide-in-from-top-2">
          <div className="space-y-3 pb-4 border-b border-sand-200">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="block text-sm uppercase tracking-luxury font-medium text-noir-900 hover:text-accent transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            <Link
              to="/order-tracking"
              className="block text-xs uppercase tracking-luxury text-noir-700 hover:text-noir-900 py-1"
            >
              Track Your Order
            </Link>
            <Link
              to="/wishlist"
              className="block text-xs uppercase tracking-luxury text-noir-700 hover:text-noir-900 py-1"
            >
              Saved Items ({wishlistCount})
            </Link>
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="block text-xs uppercase tracking-luxury text-noir-700 hover:text-noir-900 py-1"
            >
              {isAuthenticated ? `My Account (${user?.name})` : 'Sign In / Register'}
            </Link>
            <Link
              to="/admin/login"
              className="flex items-center space-x-2 text-xs uppercase tracking-luxury text-accent font-semibold py-1"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
