'use client';

import { useState } from 'react';
import DepartmentsTab from '@/components/organization/DepartmentsTab';
import CategoriesTab  from '@/components/organization/CategoriesTab';
import EmployeesTab   from '@/components/organization/EmployeesTab';
import { useAuthStore } from '@/store/authStore';
import { Building2, Tag, Users2, ShieldOff } from 'lucide-react';

const TABS = [
  { id: 'departments', label: 'Departments',       icon: Building2 },
  { id: 'categories',  label: 'Asset Categories',  icon: Tag },
  { id: 'employees',   label: 'Employee Directory', icon: Users2 },
] as const;

type TabId = typeof TABS[number]['id'];

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<TabId>('departments');
  const user = useAuthStore(s => s.user);

  if (user?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-title">Organization</h1>
            <p className="page-subtitle">Manage departments, asset categories, and employees.</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '4rem 2rem' }}>
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: 'rgb(239,68,68/.1)', color: '#EF4444' }}>
              <ShieldOff size={22} />
            </div>
            <p className="empty-state-title" style={{ color: 'hsl(var(--error))' }}>Access Denied</p>
            <p className="empty-state-desc">Only Administrators can access Organization Setup.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div>
        <h1 className="page-title">Organization Setup</h1>
        <p className="page-subtitle">Manage departments, asset categories, and the employee directory.</p>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--surface))' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`tab-btn${active ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'departments' && <DepartmentsTab />}
          {activeTab === 'categories'  && <CategoriesTab />}
          {activeTab === 'employees'   && <EmployeesTab />}
        </div>

      </div>
    </div>
  );
}
