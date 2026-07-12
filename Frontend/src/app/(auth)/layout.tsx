import { Hexagon } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'hsl(var(--background))',
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-panel-left">
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', left: '-60px', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <Hexagon size={20} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-.02em', fontFamily: 'var(--font-sans)' }}>AssetFlow</span>
        </div>

        {/* Tagline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, letterSpacing: '-.03em', fontFamily: 'var(--font-sans)', marginBottom: '1rem' }}>
            Enterprise Asset<br />Management,<br />Simplified.
          </p>
          <p style={{ fontSize: '.9375rem', color: 'rgba(255,255,255,.7)', lineHeight: 1.6, maxWidth: 340, fontFamily: 'var(--font-sans)' }}>
            Track, allocate, and maintain every asset across your organization — all in one unified platform.
          </p>
        </div>

        {/* Footer note */}
        <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', position: 'relative', zIndex: 1, fontFamily: 'var(--font-sans)' }}>
          Secure · Audited · Enterprise-ready
        </p>

        <style>{`
          @media (max-width: 768px) { .auth-panel-left { display: none !important; } }
        `}</style>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
