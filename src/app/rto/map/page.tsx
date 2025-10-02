
'use client';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { locations } from './lib/locations';
import { Building, GraduationCap } from 'lucide-react';

export default function MapPage() {
  const Map = useMemo(
    () =>
      dynamic(() => import('./components/map'), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  return (
    <div className="p-6 h-[calc(100vh-4rem-1px)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-headline text-slate-800">Map View</h1>
        <p className="text-muted-foreground mt-1">
          Visualize placement providers and RTOs across the country.
        </p>
      </header>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-full rounded-2xl overflow-hidden shadow-sm border">
          <Map locations={locations} />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
              <CardDescription>Map markers legend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white">
                  <Building className="h-4 w-4" />
                </div>
                <span className="font-medium">Provider</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 text-white">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-medium">RTO</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
