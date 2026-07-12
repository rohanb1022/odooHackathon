'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login  = useAuthStore(s => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user);
      setTimeout(() => router.push('/dashboard'), 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Heading */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-.03em', color: 'hsl(var(--text))', fontFamily: 'var(--font-sans)', lineHeight: 1.2 }}>
          Welcome back
        </h1>
        <p style={{ color: 'hsl(var(--text-muted))', marginTop: '.375rem', fontSize: '.9rem', fontFamily: 'var(--font-sans)' }}>
          Sign in to your AssetFlow account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem', padding: '.75rem 1rem' }}>
          <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '.8375rem' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="form-label">Email address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))', pointerEvents: 'none' }} />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="you@company.com" required
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
            <a href="#" style={{ fontSize: '.75rem', color: 'hsl(var(--primary))', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Forgot password?</a>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))', pointerEvents: 'none' }} />
            <input
              type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" placeholder="••••••••" required
              style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
            />
            <button
              type="button" onClick={() => setShowPw(s => !s)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', display: 'flex' }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={isLoading}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '.5rem', position: 'relative', gap: '.5rem' }}
        >
          {isLoading ? (
            <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Signing in…</>
          ) : (
            <><LogIn size={16} /> Sign In</>
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.875rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-sans)' }}>
        Don't have an account?{' '}
        <Link href="/signup" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Create account</Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
