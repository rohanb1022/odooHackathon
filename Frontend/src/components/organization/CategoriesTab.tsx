'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

interface Category {
  _id: string;
  name: string;
  description: string;
  requiresMaintenance: boolean;
  fields: { name: string; type: string }[];
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/asset-categories');
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Asset Categories</h3>
        <button className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-muted))' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {categories.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-muted))' }}>
              No categories found.
            </div>
          ) : (
            categories.map(category => (
              <div key={category._id} style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 600 }}>{category.name}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))' }}><Edit2 size={16} /></button>
                    <button style={{ background: 'none', border: 'none', color: 'hsl(var(--error))' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', flex: 1 }}>{category.description}</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {category.requiresMaintenance && (
                    <span style={{ fontSize: '0.75rem', backgroundColor: 'hsla(var(--warning), 0.1)', color: 'hsl(var(--warning))', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Maintenance Req.</span>
                  )}
                  <span style={{ fontSize: '0.75rem', backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{category.fields.length} Custom Fields</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
