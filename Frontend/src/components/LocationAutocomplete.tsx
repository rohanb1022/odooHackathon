'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface LocationAutocompleteProps {
  onLocationSelect: (location: { name: string; lat: number; lng: number }) => void;
  initialValue?: string;
}

export default function LocationAutocomplete({ onLocationSelect, initialValue = '' }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedVal, setSelectedVal] = useState('');
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query || query.length < 3 || query === selectedVal) {
      setSuggestions([]);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Geocoding error', err);
      } finally {
        setIsLoading(false);
      }
    }, 600); // 600ms debounce to respect Nominatim limits

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  const handleSelect = (sugg: any) => {
    setSelectedVal(sugg.display_name);
    setQuery(sugg.display_name);
    setShowDropdown(false);
    setSuggestions([]);
    onLocationSelect({
      name: sugg.display_name,
      lat: parseFloat(sugg.lat),
      lng: parseFloat(sugg.lon)
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        className="input-field"
        placeholder="Start typing an address or location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        required
      />
      {isLoading && (
        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
          Searching...
        </div>
      )}
      {showDropdown && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'hsl(var(--surface))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 50,
          listStyle: 'none',
          margin: '0.25rem 0 0 0',
          padding: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {suggestions.map(sugg => (
            <li 
              key={sugg.place_id} 
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input from losing focus immediately
                handleSelect(sugg);
              }}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                borderBottom: '1px solid hsl(var(--border))',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}
              className="hover:bg-hsla-primary"
            >
              <MapPin size={16} style={{ marginTop: '2px', color: 'hsl(var(--primary))' }} />
              <span>{sugg.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
