export interface DefaultChecklistItem {
  category: string;
  label: string;
}

export const DEFAULT_CHECKLIST: DefaultChecklistItem[] = [
  // Exterior
  { category: 'Exterior', label: 'Roof condition' },
  { category: 'Exterior', label: 'Gutters & downspouts' },
  { category: 'Exterior', label: 'Siding / exterior walls' },
  { category: 'Exterior', label: 'Driveway & walkways' },
  { category: 'Exterior', label: 'Yard & landscaping' },
  { category: 'Exterior', label: 'Garage' },
  // Interior
  { category: 'Interior', label: 'Windows (seals & operation)' },
  { category: 'Interior', label: 'Doors (open, close & lock)' },
  { category: 'Interior', label: 'Floors (no damage or creaks)' },
  { category: 'Interior', label: 'Ceilings (no stains or cracks)' },
  { category: 'Interior', label: 'Walls (no cracks or damage)' },
  { category: 'Interior', label: 'Closet & storage space' },
  { category: 'Interior', label: 'Natural light' },
  // Kitchen
  { category: 'Kitchen', label: 'Appliances included' },
  { category: 'Kitchen', label: 'Cabinet condition' },
  { category: 'Kitchen', label: 'Countertop condition' },
  { category: 'Kitchen', label: 'Sink & faucet' },
  { category: 'Kitchen', label: 'Ventilation / range hood' },
  // Bathrooms
  { category: 'Bathrooms', label: 'Water pressure' },
  { category: 'Bathrooms', label: 'Drains (no slow drains)' },
  { category: 'Bathrooms', label: 'Fixtures condition' },
  { category: 'Bathrooms', label: 'Ventilation' },
  // Systems
  { category: 'Systems', label: 'HVAC (age & condition)' },
  { category: 'Systems', label: 'Water heater (age & condition)' },
  { category: 'Systems', label: 'Electrical panel' },
  { category: 'Systems', label: 'Plumbing (visible pipes)' },
  { category: 'Systems', label: 'Basement / crawl space' },
  // Neighborhood
  { category: 'Neighborhood', label: 'Street noise level' },
  { category: 'Neighborhood', label: 'Parking availability' },
  { category: 'Neighborhood', label: 'Cell signal' },
  { category: 'Neighborhood', label: 'Nearby amenities' },
];

export const CATEGORY_ICONS: Record<string, string> = {
  Exterior: 'home-outline',
  Interior: 'grid-outline',
  Kitchen: 'restaurant-outline',
  Bathrooms: 'water-outline',
  Systems: 'construct-outline',
  Neighborhood: 'location-outline',
};
