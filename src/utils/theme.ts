import type { PropertyStatus } from '../types';

export const colors = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  background: '#F1F5F9',
  card: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#8B5CF6',
};

export const statusConfig: Record<PropertyStatus, { bg: string; text: string; label: string; dot: string }> = {
  want_to_tour: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Want to Tour' },
  toured:        { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Toured' },
  interested:    { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Interested' },
  not_interested:{ bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Not Interested' },
  offer_made:    { bg: '#EDE9FE', text: '#5B21B6', dot: '#8B5CF6', label: 'Offer Made' },
};

export function ratingColor(rating: number): string {
  if (rating >= 8) return '#10B981'; // green
  if (rating >= 5) return '#F59E0B'; // amber
  return '#EF4444';                  // red
}
