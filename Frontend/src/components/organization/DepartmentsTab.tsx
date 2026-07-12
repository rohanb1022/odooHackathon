'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '@/lib/axios';

interface Department {
  _id: string;
  name: string;
  head?: { _id: string; name: string };
  parentDepartment?: { _id: string; name: string };
  isActive: boolean;
}

export default function DepartmentsTab() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch departments', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/departments', {
        name: newDeptName,
        description: newDeptDesc
      });
      if (data.success) {
        setIsModalOpen(false);
        setNewDeptName('');
        setNewDeptDesc('');
        fetchDepartments();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add department');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Departments</h3>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={16} /> Add Department
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-muted))' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-muted))' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Head</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Parent Dept</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map(dept => (
                  <tr key={dept._id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{dept.name}</td>
                    <td style={{ padding: '1rem' }}>{dept.head?.name || '-'}</td>
                    <td style={{ padding: '1rem' }}>{dept.parentDepartment?.name || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 500,
                        backgroundColor: dept.isActive ? 'hsla(var(--success), 0.1)' : 'hsla(var(--error), 0.1)',
                        color: dept.isActive ? 'hsl(var(--success))' : 'hsl(var(--error))'
                      }}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))' }}><Edit2 size={16} /></button>
                      <button style={{ background: 'none', border: 'none', color: 'hsl(var(--error))' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Department Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Add New Department</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDepartment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Department Name *</label>
                <input 
                  type="text" 
                  value={newDeptName} 
                  onChange={e => setNewDeptName(e.target.value)} 
                  className="input-field" 
                  required 
                  placeholder="e.g. Engineering"
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Description</label>
                <textarea 
                  value={newDeptDesc} 
                  onChange={e => setNewDeptDesc(e.target.value)} 
                  className="input-field" 
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
