'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icons not loading in webpack/nextjs
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Asset {
  _id: string;
  name: string;
  assetTag: string;
  location: string;
  status: string;
  customFieldValues?: Record<string, any>;
}

interface AssetMapProps {
  assets: Asset[];
}

export default function AssetMap({ assets }: AssetMapProps) {
  // Base coordinates (New York City HQ)
  const baseLat = 40.7128;
  const baseLng = -74.0060;

  // Simple deterministic hash function for strings
  const stringHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  // Group assets by exact location string
  const locationGroups = assets.reduce((acc, asset) => {
    const loc = asset.location || 'Unknown';
    if (!acc[loc]) {
      // Check if real coordinates exist in customFieldValues
      const lat = asset.customFieldValues?.lat;
      const lng = asset.customFieldValues?.lng;
      
      let coordinates: [number, number];
      
      if (lat && lng) {
        coordinates = [Number(lat), Number(lng)];
      } else {
        // Fallback: Deterministically offset lat/lng based on the string hash (~5km radius)
        const offsetLat = ((stringHash(loc + "lat") % 100) - 50) / 1000;
        const offsetLng = ((stringHash(loc + "lng") % 100) - 50) / 1000;
        coordinates = [baseLat + offsetLat, baseLng + offsetLng];
      }
      
      acc[loc] = {
        name: loc,
        coordinates,
        assets: []
      };
    }
    acc[loc].assets.push(asset);
    return acc;
  }, {} as Record<string, { name: string, coordinates: [number, number], assets: Asset[] }>);

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid hsl(var(--border))' }}>
      <MapContainer center={[baseLat, baseLng]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.values(locationGroups).map((group, idx) => (
          <Marker key={idx} position={group.coordinates} icon={icon}>
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <h3 style={{ fontWeight: 600, margin: '0 0 0.5rem 0', borderBottom: '1px solid #ccc', paddingBottom: '0.25rem' }}>
                  {group.name}
                </h3>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
                  {group.assets.length} {group.assets.length === 1 ? 'asset' : 'assets'} here:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', maxHeight: '120px', overflowY: 'auto' }}>
                  {group.assets.map(a => (
                    <li key={a._id} style={{ marginBottom: '0.25rem' }}>
                      <strong>{a.assetTag}</strong>: {a.name} 
                      <span style={{ color: 'hsl(var(--primary))', marginLeft: '0.25rem' }}>({a.status})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
