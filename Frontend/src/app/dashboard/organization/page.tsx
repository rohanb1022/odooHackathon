'use client';

import { useState } from 'react';
import DepartmentsTab from '@/components/organization/DepartmentsTab';
import CategoriesTab from '@/components/organization/CategoriesTab';
import EmployeesTab from '@/components/organization/EmployeesTab';
import { useAuthStore } from '@/store/authStore';

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments');
  const user = useAuthStore(state => state.user);

  if (user?.role !== 'Admin') {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 style={{ color: 'hsl(var(--error))', fontSize: '1.25rem' }}>Access Denied</h2>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Only Administrators can access the Organization Setup.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Organization Setup</h1>
        <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Manage departments, asset categories, and the employee directory.</p>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Tabs Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsla(var(--surface), 0.5)' }}>
          <button 
            onClick={() => setActiveTab('departments')}
            style={{ 
              flex: 1, padding: '1rem', border: 'none', background: 'none', fontWeight: 500,
              borderBottom: activeTab === 'departments' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              color: activeTab === 'departments' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
            }}>
            Departments
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            style={{ 
              flex: 1, padding: '1rem', border: 'none', background: 'none', fontWeight: 500,
              borderBottom: activeTab === 'categories' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              color: activeTab === 'categories' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
            }}>
            Asset Categories
          </button>
          <button 
            onClick={() => setActiveTab('employees')}
            style={{ 
              flex: 1, padding: '1rem', border: 'none', background: 'none', fontWeight: 500,
              borderBottom: activeTab === 'employees' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              color: activeTab === 'employees' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
            }}>
            Employee Directory
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'departments' && <DepartmentsTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'employees' && <EmployeesTab />}
        </div>
      </div>
    </div>
  );
}
