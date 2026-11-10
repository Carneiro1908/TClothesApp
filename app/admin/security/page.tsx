'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Copy, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminSecurityPage() {
  const [enabled, setEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadStatus() {
    try {
      const response = await fetch('/api/admin/totp');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load authenticator status');
      setEnabled(data.enabled);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load authenticator status');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadStatus(); }, []);

  async function startSetup() {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const response = await fetch('/api/admin/totp', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not start setup');
      setSecret(data.secret);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not start setup');
    } finally {
      setSaving(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const response = await fetch('/api/admin/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not verify code');
      setEnabled(true);
      setSecret('');
      setCode('');
      setNotice('Authenticator is enabled. You will need a code the next time you sign in.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not verify code');
    } finally {
      setSaving(false);
    }
  }

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secret);
      setNotice('Setup key copied.');
    } catch {
      setError('Could not copy the key. Select and copy it manually.');
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 md:py-16">
      <Link href="/admin/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-white">
        <ArrowLeft size={16} /> Back to products
      </Link>
      <section className="border border-brand-border bg-brand-surface p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="text-gold" size={24} />
          <div>
            <h1 className="text-xl font-semibold text-white">Authenticator security</h1>
            <p className="text-sm text-brand-muted">Add a Google Authenticator code to admin sign-in.</p>
          </div>
        </div>

        {error && <p role="alert" className="mb-4 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        {notice && <p role="status" className="mb-4 border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">{notice}</p>}

        {loading ? <Loader2 className="animate-spin text-gold" /> : enabled ? (
          <div className="flex items-center gap-2 text-sm text-green-300"><CheckCircle2 size={18} /> Two-step verification is enabled.</div>
        ) : !secret ? (
          <div>
            <p className="mb-5 text-sm leading-relaxed text-brand-muted">Set up an authenticator app on your phone. You will keep your current password and enter a changing six-digit code each time you sign in.</p>
            <button onClick={startSetup} disabled={saving} className="flex items-center gap-2 bg-gold px-4 py-2.5 text-sm font-semibold text-black hover:bg-gold-light disabled:opacity-50">
              {saving && <Loader2 size={15} className="animate-spin" />} Set up authenticator
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2 text-sm leading-relaxed text-brand-muted">
              <p>In Google Authenticator, tap <strong className="text-white">+</strong>, choose <strong className="text-white">Enter a setup key</strong>, and enter this key. Use <strong className="text-white">TClothes Admin</strong> as the account name.</p>
              <p>Keep this key private. It gives access to codes for your admin account.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <code className="break-all border border-brand-border bg-brand-card px-3 py-2 font-mono text-sm tracking-widest text-gold">{secret}</code>
              <button type="button" onClick={copySecret} className="inline-flex items-center gap-2 border border-brand-border px-3 py-2 text-sm text-white hover:border-gold/40"><Copy size={14} /> Copy key</button>
            </div>
            <form onSubmit={verifyCode} className="space-y-3 border-t border-brand-border pt-5">
              <label htmlFor="setup-code" className="block text-xs font-medium uppercase tracking-widest text-brand-muted">Enter the 6-digit code shown in the app</label>
              <div className="flex flex-wrap gap-3">
                <input id="setup-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-36 border border-brand-border bg-brand-card px-3 py-2.5 font-mono text-white focus:border-gold/50 focus:outline-none" placeholder="123456" />
                <button disabled={saving || code.length !== 6} className="flex items-center gap-2 bg-gold px-4 py-2.5 text-sm font-semibold text-black hover:bg-gold-light disabled:opacity-50">
                  {saving && <Loader2 size={15} className="animate-spin" />} Verify and enable
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
