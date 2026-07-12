'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  QrCode,
  Layers,
  ChevronDown,
  Globe,
  Bell,
  Settings,
  Download,
  ArrowUpRight,
  Database,
  Sliders,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'sales' | 'task' | 'report'>('overview');

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Soft Ambient Gradients */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1280px',
          height: '650px',
          background: 'radial-gradient(circle at 50% 15%, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.08) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ─── Top Navigation Header ─── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '18px',
                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1)',
              }}
            >
              AF
            </div>
            <span style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.5px', color: '#0f172a' }}>
              Asset<span style={{ color: '#2563eb' }}>Flow</span>
            </span>
          </div>

          {/* Center Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
              fontWeight: 600,
              fontSize: '14px',
              color: '#475569',
            }}
            className="hidden md:flex"
          >
            <a href="#home" style={{ color: '#0f172a', textDecoration: 'none' }}>Home</a>
            <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Features</a>
            <a href="#pricing" style={{ color: '#475569', textDecoration: 'none' }}>Pricing</a>
            <a href="#resources" style={{ color: '#475569', textDecoration: 'none' }}>Resources</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <span>Company</span>
              <ChevronDown size={14} />
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                }}
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#334155',
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                  className="hidden sm:inline-block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/login')}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                  }}
                >
                  Start for Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section
        id="home"
        style={{
          paddingTop: '60px',
          paddingBottom: '50px',
          maxWidth: '1280px',
          margin: '0 auto',
          paddingLeft: '24px',
          paddingRight: '24px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Satisfied Customers Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', marginLeft: '-6px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 700, marginLeft: '-6px' }}>A</div>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#6366f1', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 700, marginLeft: '-6px' }}>E</div>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ec4899', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 700, marginLeft: '-6px' }}>M</div>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#10b981', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 700, marginLeft: '-6px' }}>✓</div>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            More than <strong style={{ color: '#0f172a' }}>1,000+ satisfied</strong> operations leaders
          </span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-1.5px',
            color: '#0f172a',
            maxWidth: '900px',
            margin: '0 auto 24px auto',
          }}
        >
          A CRM that helps your <br />
          team{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            stay in flow
          </span>
        </h1>

        {/* Hero Description */}
        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 18px)',
            color: '#475569',
            maxWidth: '680px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6,
          }}
        >
          Simple, intuitive, and built for teams who want clarity—not clutter. Manage inventory, track allocations, schedule maintenance, and verify physical assets without the usual friction.
        </p>

        {/* Hero Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '60px' }}>
          <button
            onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '16px',
              padding: '16px 36px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            Start for Free
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{
              backgroundColor: '#ffffff',
              color: '#1e293b',
              fontWeight: 600,
              fontSize: '16px',
              padding: '16px 36px',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            }}
          >
            Contact Sales
          </button>
        </div>

        {/* ─── Interactive Mockup Container (Exact UI Reference Replication) ─── */}
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            padding: '32px',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.15)',
            textAlign: 'left',
          }}
        >
          {/* Top Bar inside Mockup */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '24px',
              marginBottom: '24px',
              borderBottom: '1px solid #f1f5f9',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>AF</div>
                <span>Asset<span style={{ color: '#2563eb' }}>Flow</span></span>
              </div>

              {/* Mockup Navigation Tabs */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#f1f5f9',
                  padding: '4px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
                className="hidden lg:flex"
              >
                {(['overview', 'contacts', 'sales', 'task', 'report'] as const).map((tab) => {
                  const labels: Record<typeof tab, string> = {
                    overview: 'Overview',
                    contacts: 'Assets',
                    sales: 'Allocations',
                    task: 'Maintenance',
                    report: 'Report',
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '9999px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activeTab === tab ? '#0f172a' : 'transparent',
                        color: activeTab === tab ? '#ffffff' : '#64748b',
                        fontWeight: 600,
                        fontSize: '12px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side controls inside mockup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <Bell size={16} />
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <Settings size={16} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #6366f1)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                  {isAuthenticated && user ? user.name?.[0] || 'E' : 'E'}
                </div>
              </div>
            </div>
          </div>

          {/* Greeting and Date Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Hello, {isAuthenticated && user ? user.name : 'Esther Howard'}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                Let&apos;s see your asset lifecycle & valuation metrics working today
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, padding: '8px 14px', backgroundColor: '#f1f5f9', borderRadius: '9999px', color: '#475569' }}>
                1-30 November 2026
              </div>
              <button
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <span>Export Data</span>
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* 4 Colorful KPI Cards (Exact Pastel/Bold Color Matching) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {/* Card 1: Soft Rose (#fdf2f8) */}
            <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fce7f3', padding: '18px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#9d174d' }}>Total Valuation</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ffffff', color: '#be185d', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <ArrowUpRight size={12} /> 5.32%
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#500724', marginBottom: '4px' }}>$600,000</div>
              <div style={{ fontSize: '12px', color: '#831843', fontWeight: 500 }}>Net book capital value</div>
            </div>

            {/* Card 2: Soft Purple (#f5f3ff) */}
            <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ede9fe', padding: '18px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#4338ca' }}>Active Allocations</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ffffff', color: '#4338ca', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <ArrowUpRight size={12} /> 8.32%
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#2e1065', marginBottom: '4px' }}>450</div>
              <div style={{ fontSize: '12px', color: '#3730a3', fontWeight: 500 }}>Assigned across departments</div>
            </div>

            {/* Card 3: Vibrant Amber (#fefce8) */}
            <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', padding: '18px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#854d0e' }}>Maintenance ROI</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ffffff', color: '#854d0e', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <ArrowUpRight size={12} /> 2.32%
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#422006', marginBottom: '4px' }}>$250,000</div>
              <div style={{ fontSize: '12px', color: '#713f12', fontWeight: 500 }}>Capital savings verified</div>
            </div>

            {/* Card 4: Soft Sky Blue (#eff6ff) */}
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', padding: '18px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1d4ed8' }}>Physical Audit Sweep</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ffffff', color: '#1d4ed8', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <ArrowUpRight size={12} /> 9.15%
                </span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#172554', marginBottom: '4px' }}>99.4%</div>
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 500 }}>Verified barcode compliance</div>
            </div>
          </div>

          {/* Interactive Charts Container */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Left Box: Allocation Density Bars */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '18px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Booking & Allocation Frequency</span>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>$12,000 Peak</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '80px', gap: '8px', padding: '0 4px' }}>
                <div style={{ flex: 1, backgroundColor: '#bfdbfe', borderRadius: '6px 6px 0 0', height: '45%' }} />
                <div style={{ flex: 1, backgroundColor: '#a5b4fc', borderRadius: '6px 6px 0 0', height: '65%' }} />
                <div style={{ flex: 1, backgroundColor: '#f9a8d4', borderRadius: '6px 6px 0 0', height: '35%' }} />
                <div style={{ flex: 1, backgroundColor: '#2563eb', borderRadius: '6px 6px 0 0', height: '85%' }} />
                <div style={{ flex: 1, backgroundColor: '#c7d2fe', borderRadius: '6px 6px 0 0', height: '55%' }} />
                <div style={{ flex: 1, backgroundColor: '#93c5fd', borderRadius: '6px 6px 0 0', height: '75%' }} />
                <div style={{ flex: 1, backgroundColor: '#f472b6', borderRadius: '6px 6px 0 0', height: '95%' }} />
              </div>
            </div>

            {/* Center Box: Asset Condition Health */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '18px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Asset Condition Health</span>
                <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#d1fae5', color: '#065f46' }}>
                  ✓ 95.6% Good
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                    <span>Active & Verified</span>
                    <span style={{ color: '#0f172a' }}>95.6%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#2563eb', height: '100%', width: '95.6%', borderRadius: '9999px' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                    <span>Needs Repair / Flagged</span>
                    <span style={{ color: '#0f172a' }}>4.4%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#f59e0b', height: '100%', width: '4.4%', borderRadius: '9999px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Departmental Share Donut */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '18px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Departmental Share</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }} />
                    <span>IT Equipment (46%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'inline-block' }} />
                    <span>Operations (28%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'inline-block' }} />
                    <span>Logistics (26%)</span>
                  </div>
                </div>
              </div>
              <div style={{ width: '74px', height: '74px', borderRadius: '50%', border: '8px solid #2563eb', borderRightColor: '#6366f1', borderBottomColor: '#ec4899', borderLeftColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: '#334155' }}>
                100%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trusted By Brand Banner ─── */}
      <section style={{ padding: '40px 0', borderTop: '1px solid rgba(226, 232, 240, 0.8)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '24px' }}>
            Trusted by fast-growing operations and modern enterprises
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
            <span style={{ fontWeight: 900, fontSize: '22px', color: '#2563eb', fontFamily: 'monospace' }}>coinbase</span>
            <span style={{ fontWeight: 800, fontSize: '22px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} /> Spotify
            </span>
            <span style={{ fontWeight: 900, fontSize: '22px', color: '#9333ea' }}># slack</span>
            <span style={{ fontWeight: 800, fontSize: '22px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={20} /> Dropbox
            </span>
            <span style={{ fontWeight: 900, fontSize: '22px', color: '#2563eb' }}>zoom</span>
            <span style={{ fontWeight: 800, fontSize: '22px', color: '#4338ca' }}>Odoo ERP</span>
          </div>
        </div>
      </section>

      {/* ─── Features Bento Grid Section (Exact Layout from Reference) ─── */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 64px auto' }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, backgroundColor: '#dbeafe', color: '#1d4ed8', marginBottom: '12px' }}>
            • Features
          </span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '16px' }}>
            Everything you need to <br />
            <span style={{ color: '#2563eb' }}>stay organized</span>
          </h2>
          <p style={{ fontSize: '17px', color: '#64748b', lineHeight: 1.6 }}>
            Your daily asset tools—clean, simple, and crafted to keep your enterprise team focused.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1: Centralized Control Panel */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '28px',
              padding: '32px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gridColumn: 'span 2 / auto',
            }}
            className="md:col-span-2"
          >
            <div style={{ maxWidth: '480px', marginBottom: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Sliders size={22} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Centralized Control Panel</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6 }}>
                Monitor your assets, allocations, bookings, and performance in one intuitive dashboard—everything updates in real time to keep your team aligned effortlessly.
              </p>
            </div>

            {/* Mini Mockup Inside Card 1 */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} /> Live Overview
                </span>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>100% Synced</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Assets</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>1,248</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Allocated</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb' }}>892</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Under Repair</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#d97706' }}>14</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Seamless Teamwork */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '28px',
              padding: '32px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Seamless Teamwork.</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                Collaborate across departments and locations. Assign tasks, sync transfer approvals, and keep everyone connected with live tracking.
              </p>
            </div>

            {/* Mini Map Location Preview */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                <span>Active Campuses</span>
                <Globe size={16} color="#6366f1" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} /> New York HQ
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>450 Assets</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'inline-block' }} /> London Tech Hub
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>320 Assets</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} /> Singapore Hub
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>180 Assets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Audit Cycles */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '28px',
              padding: '32px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <QrCode size={22} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Physical Audit Cycles</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                Run structured verification sweeps with barcode/QR scanning. Flag discrepancies (`Verified / Missing / Damaged`) instantly.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '14px', border: '1px solid #f1f5f9', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>Q3 IT Sweep</span>
                </div>
                <span style={{ fontWeight: 800, color: '#047857', fontSize: '12px' }}>$180,000 Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '14px', border: '1px solid #f1f5f9', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>Server Room B</span>
                </div>
                <span style={{ fontWeight: 800, color: '#047857', fontSize: '12px' }}>$150,000 Checked</span>
              </div>
            </div>
          </div>

          {/* Card 4: Actionable Insights */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '28px',
              padding: '32px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <TrendingUp size={22} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Actionable Insights</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                Analyze straight-line depreciation curves, peak usage heatmaps, and ROI metrics to make confident capital expenditure decisions.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Monthly Savings</span>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>$2,500</div>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                ↗ 9.15%
              </div>
            </div>
          </div>

          {/* Card 5: Integrations */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '28px',
              padding: '32px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#fef08a', color: '#a16207', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Odoo Integrations</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                Connect AssetFlow seamlessly with your ERP tools, Google Workspace, Slack alerts, and hardware scanners.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '12px 18px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#4338ca' }}>Odoo</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '12px 18px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#9333ea' }}>Slack</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '12px 18px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#2563eb' }}>QR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─── */}
      <section style={{ padding: '60px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: '#0f172a',
            borderRadius: '32px',
            padding: '64px 32px',
            textAlign: 'center',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          }}
        >
          <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#93c5fd', border: '1px solid rgba(255, 255, 255, 0.15)', marginBottom: '16px' }}>
            Get Started Today
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1px', maxWidth: '720px', margin: '0 auto 20px auto', lineHeight: 1.15 }}>
            Ready to stay in flow and master your asset operations?
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '17px', maxWidth: '600px', margin: '0 auto 36px auto', lineHeight: 1.6 }}>
            Join modern enterprises tracking their capital assets with 100% audit clarity and zero spreadsheet clutter.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '16px',
                padding: '16px 36px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
              }}
            >
              Start for Free
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '16px',
                padding: '16px 36px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid rgba(226, 232, 240, 0.9)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '14px' }}>
              AF
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>
              Asset<span style={{ color: '#2563eb' }}>Flow</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
            <a href="#home" style={{ color: '#475569', textDecoration: 'none' }}>Home</a>
            <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Features</a>
            <a href="#pricing" style={{ color: '#475569', textDecoration: 'none' }}>Pricing</a>
            <a href="#resources" style={{ color: '#475569', textDecoration: 'none' }}>Documentation</a>
            <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Privacy Policy</a>
          </div>

          <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>
            © 2026 AssetFlow. Built with precision for the Odoo Hackathon.
          </p>
        </div>
      </footer>
    </div>
  );
}
