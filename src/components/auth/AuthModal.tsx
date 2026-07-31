import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('sahil@instagram.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('sahil_monpara');
  const [fullName, setFullName] = useState('Sahil Monpara');
  const [rememberMe, setRememberMe] = useState(true);

  const { user, signIn, signUp, signInWithOAuth, loading } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = await signIn(email, password);
      if (success && onClose) onClose();
    } else {
      const success = await signUp(email, password, username, fullName);
      if (success && onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-dark-border w-full max-w-md rounded-2xl p-8 relative shadow-2xl">
        {user && onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-instagram-gradient bg-clip-text text-transparent inline-block tracking-tight mb-1">
            Instagram
          </h2>
          <p className="text-xs text-neutral-400">
            {isLogin ? 'Sign in to see photos & videos from friends' : 'Create an account to join Instagram'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-dark-primary border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-instagram-blue"
                  required
                />
              </div>

              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-primary border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-instagram-blue"
                  required
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-primary border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-instagram-blue"
              required
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-primary border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-instagram-blue"
              required
            />
          </div>

          {isLogin && (
            <div className="flex justify-between items-center text-[11px] text-neutral-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-dark-primary border-dark-border text-instagram-blue focus:ring-0"
                />
                Remember me
              </label>
              <button type="button" className="hover:underline text-instagram-blue">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-instagram-blue hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg mt-1"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-dark-border"></div>
          <span className="text-[10px] text-neutral-500 font-semibold uppercase">OR</span>
          <div className="flex-1 h-px bg-dark-border"></div>
        </div>

        {/* OAUTH SSO BUTTONS */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => signInWithOAuth('google')}
            className="w-full bg-white text-black font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-5 text-center text-xs text-neutral-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-instagram-blue font-semibold hover:underline ml-1"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};
