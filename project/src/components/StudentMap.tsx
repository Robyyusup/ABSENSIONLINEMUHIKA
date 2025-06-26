import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import { LoadingSpinner } from './LoadingSpinner';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const StudentMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([-6.5583, 107.4589], 12);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Load student locations
    loadStudentLocations();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const loadStudentLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      const snapshot = await get(ref(database, 'absensi/siswa'));
      const rawData = snapshot.val();
      
      if (!rawData) {
        setError('Tidak ada data lokasi siswa yang tersedia');
        setLoading(false);
        return;
      }

      const bounds = L.latLngBounds([]);
      let locationsFound = false;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Process student location data
      for (const userId in rawData) {
        const mapelData = rawData[userId];
        for (const mapelKey in mapelData) {
          const waktuData = mapelData[mapelKey];
          for (const waktuKey in waktuData) {
            const entry = waktuData[waktuKey];
            if (entry.lokasi && entry.lokasi.latitude && entry.lokasi.longitude) {
              const lat = parseFloat(entry.lokasi.latitude);
              const lng = parseFloat(entry.lokasi.longitude);

              if (!isNaN(lat) && !isNaN(lng)) {
                const position: L.LatLngExpression = [lat, lng];
                
                // Create custom icon
                const customIcon = L.divIcon({
                  className: 'custom-div-icon',
                  html: `
                    <div class="flex items-center justify-center w-8 h-8 bg-primary-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  `,
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                });

                const marker = L.marker(position, { icon: customIcon });
                
                // Create popup content
                const popupContent = `
                  <div class="bg-dark-800 text-white p-4 rounded-lg border border-primary-500/30 min-w-[250px]">
                    <div class="flex items-center gap-2 mb-3">
                      <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                      <h4 class="font-bold text-primary-300">${entry.nama || 'Siswa Tidak Dikenal'}</h4>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-400">Kelas:</span>
                        <span class="text-white">${entry.kelas || 'Tidak Diketahui'}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">Pelajaran:</span>
                        <span class="text-white">${entry.mapel || 'Tidak Diketahui'}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">Waktu:</span>
                        <span class="text-white">${new Date(entry.waktu).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    ${entry.foto ? `
                      <div class="mt-3">
                        <img src="${entry.foto}" alt="Foto Siswa" class="w-full h-32 object-cover rounded-lg border border-primary-500/30">
                      </div>
                    ` : ''}
                  </div>
                `;

                marker.bindPopup(popupContent, {
                  maxWidth: 300,
                  className: 'custom-popup'
                });

                if (mapInstanceRef.current) {
                  marker.addTo(mapInstanceRef.current);
                  markersRef.current.push(marker);
                  bounds.extend(position);
                  locationsFound = true;
                }
              }
            }
          }
        }
      }

      if (locationsFound && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      } else {
        setError('Tidak ada data lokasi siswa yang tersedia');
      }

    } catch (error) {
      console.error('Error loading student locations:', error);
      setError('Gagal memuat lokasi siswa');
    } finally {
      setLoading(false);
    }
  };

  const centerMap = () => {
    if (mapInstanceRef.current && markersRef.current.length > 0) {
      const bounds = L.latLngBounds([]);
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getLatLng());
      });
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full mr-3"></div>
          <MapPin className="w-5 h-5 mr-2 text-primary-400" />
          Peta Lokasi Siswa
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={loadStudentLocations}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600/20 text-primary-300 border border-primary-500/30 rounded-lg hover:bg-primary-600/30 transition-all duration-200 button-glow"
          >
            <Navigation className="w-4 h-4" />
            Refresh
          </button>
          
          {markersRef.current.length > 0 && (
            <button
              onClick={centerMap}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all duration-200 button-glow"
            >
              <MapPin className="w-4 h-4" />
              Pusatkan
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-900/50 backdrop-blur-sm rounded-xl">
            <LoadingSpinner message="Memuat peta lokasi siswa..." />
          </div>
        )}
        
        {error && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-900/50 backdrop-blur-sm rounded-xl">
            <div className="text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div 
          ref={mapRef} 
          className="w-full h-[500px] rounded-xl border border-dark-600 overflow-hidden"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
            <span>Lokasi Siswa</span>
          </div>
          <span>•</span>
          <span>{markersRef.current.length} lokasi ditemukan</span>
        </div>
        <p className="text-xs">Klik marker untuk melihat detail</p>
      </div>
    </div>
  );
};