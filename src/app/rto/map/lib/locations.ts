
export type Location = {
  id: string;
  name: string;
  position: [number, number];
  type: 'provider' | 'rto';
};

export const locations: Location[] = [
  { id: '1', name: 'HealthBridge', position: [-37.8136, 144.9631], type: 'provider' }, // Melbourne
  { id: '2', name: 'Innovate Inc.', position: [-33.8688, 151.2093], type: 'provider' }, // Sydney
  { id: '3', name: 'CareWell Aged Care', position: [-31.9505, 115.8605], type: 'provider' }, // Perth
  { id: '4', name: 'Sunshine Primary', position: [-27.4705, 153.0260], type: 'provider' }, // Brisbane
  { id: '5', name: 'TechStart Solutions', position: [-35.2809, 149.1300], type: 'provider' }, // Canberra
  { id: '6', name: 'BrightMinds Childcare', position: [-34.9285, 138.6007], type: 'provider' }, // Adelaide
  { id: '7', name: 'TAFE NSW - Sydney', position: [-33.882, 151.197], type: 'rto' },
  { id: '8', name: 'Skills Australia - Melbourne', position: [-37.81, 144.95], type: 'rto' },
  { id: '9', name: 'VET Institute - Brisbane', position: [-27.46, 153.02], type: 'rto' },
  { id: '10', name: 'Training Plus - Perth', position: [-31.96, 115.85], type: 'rto' },
];
