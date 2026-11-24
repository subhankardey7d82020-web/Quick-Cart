import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/account');
    } catch {
      // toast in context
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCustomer = () => {
    setEmail('customer@quickcart.com');
    setPassword('customer123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white border border-sand-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            Member Portal
          </p>
          <h1 className="font-serif text-3xl font-normal text-noir-900">
            Sign In to Atelier
          </h1>
          <p className="text-xs text-neutral-500">
            Access your curated wishlist, saved addresses, and active orders.
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div className="p-3 bg-cream-100 border border-sand-200 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-noir-900 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Demo Customer Access</span>
            </p>
            <p className="text-[10px] text-neutral-500">customer@quickcart.com / customer123</p>
          </div>
          <button
            type="button"
            onClick={handleFillDemoCustomer}
            className="px-2.5 py-1 bg-noir-900 text-cream-50 text-[10px] font-semibold uppercase tracking-wider hover:bg-noir-800 transition-colors"
          >
            Auto-Fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-sand-200 text-center space-y-3 text-xs">
          <p className="text-neutral-500">
            Do not have an account?{' '}
            <Link to="/register" className="font-semibold text-noir-900 hover:text-accent underline">
              Create an account
            </Link>
          </p>

          <Link
            to="/admin/login"
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-accent font-semibold hover:text-accent-hover"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Store Administrator Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
