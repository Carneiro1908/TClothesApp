'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username: username.trim(),
        password,
        totpCode,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('locked')) {
          setError('Account temporarily locked. Too many failed attempts. Try again in 15 minutes.');
        } else {
          setError('Invalid username, password, or authenticator code. Please try again.');
        }
      } else if (result?.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-serif font-bold tracking-widest text-white">
              T<span className="text-gold">C</span>lothes
            </span>
          </Link>
          <div className="gold-line mb-6" />
          <h1 className="text-lg font-semibold text-white tracking-wide">Admin Access</h1>
          <p className="text-sm text-brand-muted mt-1">Sign in to manage your store</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-brand-surface border border-brand-border p-6 space-y-4"
        >
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-medium tracking-widest uppercase text-brand-muted"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
                <User size={15} />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={isLoading}
                className="w-full bg-brand-card border border-brand-border text-white placeholder:text-brand-muted/50 text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50"
                placeholder="admin"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium tracking-widest uppercase text-brand-muted"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
                <Lock size={15} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="w-full bg-brand-card border border-brand-border text-white placeholder:text-brand-muted/50 text-sm pl-9 pr-10 py-2.5 focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-1.5">
            <label htmlFor="totpCode" className="block text-xs font-medium tracking-widest uppercase text-brand-muted">
              Authenticator Code <span className="normal-case tracking-normal">(if enabled)</span>
            </label>
            <input
              id="totpCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoading}
              className="w-full bg-brand-card border border-brand-border text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50"
              placeholder="123456"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold text-black text-sm font-semibold tracking-widest uppercase py-2.5 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-brand-muted/50 hover:text-brand-muted transition-colors tracking-wide"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
