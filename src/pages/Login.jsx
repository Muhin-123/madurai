import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CleanMaduraiLogo from '../components/logo/CleanMaduraiLogo';
import logoImage from '../assets/image.png';

// Local background image from assets
const LOGIN_BACKGROUND = logoImage;

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'citizen' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) throw new Error('Name is required');
        await register(form.email, form.password, form.name.trim(), form.role);
      }
      navigate('/');
    } catch (err) {
      const msgs = {
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'Email already registered.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Invalid email address.',
      };
      setError(msgs[err.code] || err.message || 'Authentication failed.');
      toast.error(msgs[err.code] || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        backgroundImage: `url(${LOGIN_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Content container - centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CleanMaduraiLogo size={56} />
          </motion.div>
        </div>

        {/* Branding section - visible on all screens */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
            CLEAN MADURAI
          </h1>
          <p className="text-sm lg:text-base text-white/80">
            Smart Waste & Sanitation System
          </p>
          <p className="text-xs text-white/60 mt-2">
            Real-time civic intelligence for a cleaner tomorrow
          </p>
        </motion.div>

        {/* Stats - hidden on small screens */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="hidden sm:flex gap-3 mb-8 justify-center"
        >
          {[
            { label: 'Smart Bins', value: '150+' },
            { label: 'Active Wards', value: '15' },
            { label: 'Citizens', value: '3M+' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-center hover:border-civic-blue/50 hover:bg-white/15 transition-all"
            >
              <div className="text-lg font-black bg-gradient-to-r from-civic-blue to-civic-green bg-clip-text text-transparent">{value}</div>
              <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/95 dark:bg-navy-800/95 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Join the Clean Madurai initiative'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 dark:bg-white/10 rounded-xl">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError('');
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-white dark:bg-navy-700 text-civic-blue dark:text-civic-green shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                {m === 'login' ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <LogIn className="w-4 h-4" /> Sign In
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <UserPlus className="w-4 h-4" /> Register
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-700/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-civic-blue dark:focus:ring-civic-blue transition-all"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required={mode === 'register'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'citizen', label: '👤 Citizen' },
                        { value: 'worker', label: '🔧 Worker' },
                        { value: 'officer', label: '🏛 Officer' },
                      ].map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                          className={`p-3 rounded-xl text-xs text-center border transition-all font-semibold ${
                            form.role === r.value
                              ? 'border-civic-blue dark:border-civic-blue bg-orange-50 dark:bg-orange-500/20 text-civic-blue dark:text-civic-blue'
                              : 'border-gray-200 dark:border-white/10 bg-white dark:bg-navy-700/50 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="text-lg mb-0.5">{r.label.split(' ')[0]}</div>
                          <div className="text-[11px]">
                            {r.label.split(' ').slice(1).join(' ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-700/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-civic-blue dark:focus:ring-civic-blue transition-all"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-gray-50 dark:bg-navy-700/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-civic-blue dark:focus:ring-civic-blue transition-all"
                  placeholder={
                    mode === 'register'
                      ? 'Minimum 6 characters'
                      : 'Enter your password'
                  }
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPass ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 mt-2 rounded-xl font-semibold text-white bg-gradient-to-r from-civic-blue to-civic-green hover:from-orange-600 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl shadow-civic-blue/50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'login'
                    ? 'Sign In to Dashboard'
                    : 'Create Account'}
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-white/5 rounded-xl border border-blue-200 dark:border-white/10">
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
              🔐 Secured by Firebase Authentication · Role-based access control
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/60 text-xs mt-6"
        >
          © 2024 Madurai Smart City Limited. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
