export function formatPrice(price: number): string {
  if (!price) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatSqft(sqft?: number): string {
  if (!sqft) return '—';
  return `${sqft.toLocaleString()} sqft`;
}

export function formatBedsBaths(beds: number, baths: number): string {
  const b = beds === 1 ? '1 bd' : `${beds} bd`;
  const ba = baths === 1 ? '1 ba' : `${baths} ba`;
  return `${b} · ${ba}`;
}

export function todayISOString(): string {
  return new Date().toISOString().split('T')[0];
}
