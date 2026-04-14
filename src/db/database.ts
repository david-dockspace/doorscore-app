import * as SQLite from 'expo-sqlite';
import type { Property, LocalPhoto } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('reapp.db');
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDb();

  database.execSync(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY NOT NULL,
      address TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      listing_url TEXT,
      date_viewed TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'want_to_tour',
      rating INTEGER NOT NULL DEFAULT 5,
      notes TEXT NOT NULL DEFAULT '',
      pros TEXT NOT NULL DEFAULT '[]',
      cons TEXT NOT NULL DEFAULT '[]',
      bedrooms INTEGER NOT NULL DEFAULT 0,
      bathrooms REAL NOT NULL DEFAULT 0,
      sqft INTEGER,
      year_built INTEGER,
      agent_name TEXT,
      agent_phone TEXT,
      mls_number TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY NOT NULL,
      property_id TEXT NOT NULL,
      uri TEXT NOT NULL,
      caption TEXT,
      taken_at TEXT NOT NULL,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    );
  `);
}

// ─── Row types (SQLite snake_case) ───────────────────────────────────────────

interface PropertyRow {
  id: string;
  address: string;
  price: number;
  listing_url: string | null;
  date_viewed: string;
  status: string;
  rating: number;
  notes: string;
  pros: string;
  cons: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  year_built: number | null;
  agent_name: string | null;
  agent_phone: string | null;
  mls_number: string | null;
  created_at: string;
  updated_at: string;
}

interface PhotoRow {
  id: string;
  property_id: string;
  uri: string;
  caption: string | null;
  taken_at: string;
}

function rowToProperty(row: PropertyRow, photos: LocalPhoto[]): Property {
  return {
    id: row.id,
    address: row.address,
    price: row.price,
    listingUrl: row.listing_url ?? undefined,
    dateViewed: row.date_viewed,
    status: row.status as Property['status'],
    rating: row.rating,
    notes: row.notes,
    pros: JSON.parse(row.pros),
    cons: JSON.parse(row.cons),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sqft: row.sqft ?? undefined,
    yearBuilt: row.year_built ?? undefined,
    agentName: row.agent_name ?? undefined,
    agentPhone: row.agent_phone ?? undefined,
    mlsNumber: row.mls_number ?? undefined,
    photos,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToPhoto(row: PhotoRow): LocalPhoto {
  return {
    id: row.id,
    propertyId: row.property_id,
    uri: row.uri,
    caption: row.caption ?? undefined,
    takenAt: row.taken_at,
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function dbGetAllProperties(): Property[] {
  const database = getDb();
  const rows = database.getAllSync<PropertyRow>(
    'SELECT * FROM properties ORDER BY updated_at DESC'
  );
  return rows.map((row) => {
    const photos = dbGetPhotosByPropertyId(row.id);
    return rowToProperty(row, photos);
  });
}

export function dbGetProperty(id: string): Property | null {
  const database = getDb();
  const row = database.getFirstSync<PropertyRow>(
    'SELECT * FROM properties WHERE id = ?',
    id
  );
  if (!row) return null;
  const photos = dbGetPhotosByPropertyId(id);
  return rowToProperty(row, photos);
}

export function dbGetPhotosByPropertyId(propertyId: string): LocalPhoto[] {
  const database = getDb();
  const rows = database.getAllSync<PhotoRow>(
    'SELECT * FROM photos WHERE property_id = ? ORDER BY taken_at ASC',
    propertyId
  );
  return rows.map(rowToPhoto);
}

export function dbInsertProperty(property: Property): void {
  const database = getDb();
  database.runSync(
    `INSERT INTO properties (
      id, address, price, listing_url, date_viewed, status, rating, notes,
      pros, cons, bedrooms, bathrooms, sqft, year_built, agent_name,
      agent_phone, mls_number, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    property.id,
    property.address,
    property.price,
    property.listingUrl ?? null,
    property.dateViewed,
    property.status,
    property.rating,
    property.notes,
    JSON.stringify(property.pros),
    JSON.stringify(property.cons),
    property.bedrooms,
    property.bathrooms,
    property.sqft ?? null,
    property.yearBuilt ?? null,
    property.agentName ?? null,
    property.agentPhone ?? null,
    property.mlsNumber ?? null,
    property.createdAt,
    property.updatedAt
  );
}

export function dbUpdateProperty(property: Property): void {
  const database = getDb();
  database.runSync(
    `UPDATE properties SET
      address = ?, price = ?, listing_url = ?, date_viewed = ?, status = ?,
      rating = ?, notes = ?, pros = ?, cons = ?, bedrooms = ?, bathrooms = ?,
      sqft = ?, year_built = ?, agent_name = ?, agent_phone = ?,
      mls_number = ?, updated_at = ?
    WHERE id = ?`,
    property.address,
    property.price,
    property.listingUrl ?? null,
    property.dateViewed,
    property.status,
    property.rating,
    property.notes,
    JSON.stringify(property.pros),
    JSON.stringify(property.cons),
    property.bedrooms,
    property.bathrooms,
    property.sqft ?? null,
    property.yearBuilt ?? null,
    property.agentName ?? null,
    property.agentPhone ?? null,
    property.mlsNumber ?? null,
    property.updatedAt,
    property.id
  );
}

export function dbDeleteProperty(id: string): void {
  const database = getDb();
  database.runSync('DELETE FROM properties WHERE id = ?', id);
}

export function dbInsertPhoto(photo: LocalPhoto): void {
  const database = getDb();
  database.runSync(
    'INSERT INTO photos (id, property_id, uri, caption, taken_at) VALUES (?, ?, ?, ?, ?)',
    photo.id,
    photo.propertyId,
    photo.uri,
    photo.caption ?? null,
    photo.takenAt
  );
}

export function dbDeletePhoto(id: string): void {
  const database = getDb();
  database.runSync('DELETE FROM photos WHERE id = ?', id);
}
