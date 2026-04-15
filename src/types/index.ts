export type PropertyStatus =
  | 'want_to_tour'
  | 'toured'
  | 'interested'
  | 'not_interested'
  | 'offer_made';

export interface LocalPhoto {
  id: string;
  propertyId: string;
  uri: string;
  caption?: string;
  takenAt: string; // ISO string
}

export interface Property {
  id: string;
  address: string;
  price: number;
  listingUrl?: string;
  dateViewed: string; // ISO string
  status: PropertyStatus;
  rating: number; // 1–10
  notes: string;
  pros: string[];
  cons: string[];
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  yearBuilt?: number;
  agentName?: string;
  agentPhone?: string;
  mlsNumber?: string;
  photos: LocalPhoto[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type PropertyFormData = Omit<Property, 'id' | 'photos' | 'createdAt' | 'updatedAt'>;

export interface ChecklistItem {
  id: string;
  propertyId: string;
  category: string;
  label: string;
  score: 0 | 1 | 2 | 3; // 0 = unrated
}

export interface OGData {
  address?: string;
  price?: number;
  imageUrl?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
}
