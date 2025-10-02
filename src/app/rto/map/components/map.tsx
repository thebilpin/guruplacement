
'use client';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import type { Location } from '../lib/locations';
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Building, GraduationCap } from 'lucide-react';

const createIcon = (type: 'provider' | 'rto') => {
  const iconMarkup = renderToStaticMarkup(
    <div
      className={`h-10 w-10 rounded-full shadow-lg flex items-center justify-center text-white ${
        type === 'provider' ? 'bg-blue-500' : 'bg-teal-500'
      }`}
    >
      {type === 'provider' ? <Building className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
    </div>
  );
  return divIcon({
    html: iconMarkup,
    className: 'bg-transparent border-0',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const providerIcon = createIcon('provider');
const rtoIcon = createIcon('rto');

export default function Map({ locations }: { locations: Location[] }) {
  return (
    <MapContainer
      center={[-25.2744, 133.7751]} // Centered on Australia
      zoom={4}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {locations.map((location) => (
        <Marker key={location.id} position={location.position} icon={location.type === 'provider' ? providerIcon : rtoIcon}>
          <Tooltip>
            {location.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
