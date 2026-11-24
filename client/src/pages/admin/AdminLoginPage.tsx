import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@quickcart.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-cream-100">
      <div className="max-w-md w-full bg-white border border-sand-300 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-noir-900 text-accent rounded-full flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-[11px] uppercase tracking-widest text-accent font-semibold">
            Administrative Access
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-noir-900">
            Quick Cart Atelier Portal
          </h1>
          <p className="text-xs text-neutral-500">
            Sign in with authorized administrator credentials.
          </p>
        </div>

        {/* Quick Demo Credentials Autofill Banner */}
        <div className="p-3.5 bg-cream-100 border border-sand-200 flex items-center justify-between text-xs rounded">
          <div>
            <p className="font-semibold text-noir-900 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Default Admin Credentials</span>
            </p>
            <p className="text-[10px] text-neutral-500 font-mono">admin@quickcart.com / admin123</p>
          </div>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="px-3 py-1 bg-noir-900 text-cream-50 text-[10px] font-semibold uppercase tracking-wider hover:bg-noir-800 transition-colors"
          >
            Auto-Fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@quickcart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
              Admin Password
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
            <span>{loading ? 'Authenticating Admin...' : 'Enter Admin Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-sand-200 text-center">
          <Link to="/" className="text-xs uppercase tracking-widest text-neutral-500 hover:text-noir-900 transition-colors">
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
