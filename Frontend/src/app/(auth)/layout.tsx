export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--background))' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }} className="glass-panel animate-fade-in">
        {children}
      </div>
    </div>
  );
}
