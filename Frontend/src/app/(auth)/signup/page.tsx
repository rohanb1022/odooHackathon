'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors   = ['', '#EF4444', '#F59E0B', '#10B981'];
  const pwLabels   = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-.03em', color: 'hsl(var(--text))', fontFamily: 'var(--font-sans)', lineHeight: 1.2 }}>
          Create your account
        </h1>
        <p style={{ color: 'hsl(var(--text-muted))', marginTop: '.375rem', fontSize: '.9rem', fontFamily: 'var(--font-sans)' }}>
          Join AssetFlow as an Employee
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem', padding: '.75rem 1rem' }}>
          <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '.8375rem' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="form-label">Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))', pointerEvents: 'none' }} />
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Jane Doe" required style={{ paddingLeft: '2.25rem' }} />
          </div>
        </div>
        <div>
          <label className="form-label">Email address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))', pointerEvents: 'none' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" required style={{ paddingLeft: '2.25rem' }} />
          </div>
        </div>
        <div>
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))', pointerEvents: 'none' }} />
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min. 6 characters" required minLength={6} style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }} />
            <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', display: 'flex' }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {/* Password strength indicator */}
          {password.length > 0 && (
            <div style={{ marginTop: '.5rem' }}>
              <div style={{ display: 'flex', gap: '.25rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength ? pwColors[pwStrength] : 'hsl(var(--border))', transition: 'background .2s' }} />
                ))}
              </div>
              <p style={{ fontSize: '.72rem', marginTop: '.3rem', color: pwColors[pwStrength], fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                {pwLabels[pwStrength]}
              </p>
            </div>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '.5rem', gap: '.5rem' }}>
          {isLoading ? (
            <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Creating account…</>
          ) : (
            <><UserPlus size={16} /> Create Account</>
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.875rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-sans)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Sign in</Link>
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
