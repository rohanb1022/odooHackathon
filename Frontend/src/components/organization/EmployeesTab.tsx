'use client';

import { useState, useEffect } from 'react';
import { Search, Shield } from 'lucide-react';
import api from '@/lib/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: { _id: string; name: string };
  isActive: boolean;
}

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/users');
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      // Optimistically update
      setEmployees(employees.map(emp => emp._id === userId ? { ...emp, role: newRole } : emp));
    } catch (error) {
      console.error('Failed to update role', error);
      alert('Failed to update role');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Employee Directory</h3>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="input-field" 
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-muted))' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-muted))' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Email</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Department</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Role</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp._id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{emp.name}</td>
                    <td style={{ padding: '1rem' }}>{emp.email}</td>
                    <td style={{ padding: '1rem' }}>{emp.department?.name || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        value={emp.role} 
                        onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--surface))',
                          color: 'hsl(var(--text))',
                          fontSize: '0.875rem'
                        }}
                      >
                        <option value="Employee">Employee</option>
                        <option value="Department Head">Department Head</option>
                        <option value="Asset Manager">Asset Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 500,
                        backgroundColor: emp.isActive ? 'hsla(var(--success), 0.1)' : 'hsla(var(--error), 0.1)',
                        color: emp.isActive ? 'hsl(var(--success))' : 'hsl(var(--error))'
                      }}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
