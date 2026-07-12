'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';

interface Category {
  _id: string;
  name: string;
}

export default function RegisterAssetPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    serialNumber: '',
    acquisitionDate: '',
    acquisitionCost: '',
    condition: 'Excellent',
    location: '',
    isBookable: false
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/asset-categories');
        if (data.success) setCategories(data.data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: any = {
        name: formData.name,
        categoryId: formData.categoryId,
        condition: formData.condition,
        location: formData.location,
        isBookable: formData.isBookable
      };
      
      if (formData.serialNumber) payload.serialNumber = formData.serialNumber;
      if (formData.acquisitionDate) payload.acquisitionDate = formData.acquisitionDate;
      if (formData.acquisitionCost) payload.acquisitionCost = Number(formData.acquisitionCost);

      
      const { data } = await api.post('/assets', payload);
      if (data.success) {
        alert('Asset registered successfully!');
        router.push('/dashboard/assets');
      }
    } catch (error: any) {
      console.error('Registration failed', error);
      alert(error.response?.data?.message || 'Failed to register asset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard/assets" style={{ color: 'hsl(var(--text-muted))', padding: '0.5rem', borderRadius: '50%', backgroundColor: 'hsl(var(--surface))' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Register New Asset</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Add a new physical asset or shared resource.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Asset Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required placeholder="e.g. Dell XPS 15" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Category *</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="input-field" required>
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Serial Number</label>
            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="input-field" placeholder="Optional" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Condition *</label>
            <select name="condition" value={formData.condition} onChange={handleChange} className="input-field" required>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Location *</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-field" required placeholder="e.g. IT Dept Room 2" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Acquisition Date</label>
            <input type="date" name="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Acquisition Cost (USD)</label>
            <input type="number" name="acquisitionCost" value={formData.acquisitionCost} onChange={handleChange} className="input-field" min="0" step="0.01" />
          </div>

          <div style={{ gridColumn: '1 / -1', padding: '1rem', backgroundColor: 'hsla(var(--primary), 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="checkbox" id="isBookable" name="isBookable" checked={formData.isBookable} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <div>
              <label htmlFor="isBookable" style={{ fontWeight: 600, cursor: 'pointer' }}>Mark as Shared/Bookable Resource</label>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Enable this if the asset (e.g. Conference Room, Projector) can be booked by employees for specific time slots.</p>
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Link href="/dashboard/assets" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.5rem' }} disabled={isLoading}>
              <Save size={18} /> {isLoading ? 'Saving...' : 'Register Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
