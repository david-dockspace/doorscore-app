import { create } from 'zustand';
import { File, Directory, Paths } from 'expo-file-system';
import type { Property, LocalPhoto, PropertyFormData, ChecklistItem } from '../types';
import { DEFAULT_CHECKLIST } from '../utils/defaultChecklist';
import { generateId } from '../utils/uuid';
import {
  dbGetAllProperties,
  dbGetProperty,
  dbInsertProperty,
  dbUpdateProperty,
  dbDeleteProperty,
  dbInsertPhoto,
  dbDeletePhoto,
  dbGetChecklistItems,
  dbInsertChecklistItems,
  dbSetChecklistScore,
} from '../db/database';

interface PropertyStore {
  properties: Property[];
  isLoading: boolean;

  // Lifecycle
  loadProperties: () => void;

  // Property CRUD
  addProperty: (data: PropertyFormData) => string;
  updateProperty: (id: string, data: PropertyFormData) => void;
  deleteProperty: (id: string) => void;
  getProperty: (id: string) => Property | undefined;

  // Photo management
  addPhoto: (propertyId: string, sourceUri: string, caption?: string) => Promise<LocalPhoto>;
  deletePhoto: (photo: LocalPhoto) => Promise<void>;

  // Checklist
  checklistItems: Record<string, ChecklistItem[]>;
  loadChecklist: (propertyId: string) => void;
  setChecklistScore: (propertyId: string, itemId: string, score: 0 | 1 | 2 | 3) => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  isLoading: false,
  checklistItems: {},

  loadProperties() {
    set({ isLoading: true });
    try {
      const properties = dbGetAllProperties();
      set({ properties, isLoading: false });
    } catch (err) {
      console.error('[Store] loadProperties error:', err);
      set({ isLoading: false });
    }
  },

  addProperty(data) {
    const now = new Date().toISOString();
    const property: Property = {
      ...data,
      id: generateId(),
      photos: [],
      createdAt: now,
      updatedAt: now,
    };
    dbInsertProperty(property);
    set((state) => ({ properties: [property, ...state.properties] }));
    return property.id;
  },

  updateProperty(id, data) {
    const existing = get().properties.find((p) => p.id === id);
    if (!existing) return;
    const updated: Property = {
      ...existing,
      ...data,
      id,
      photos: existing.photos,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    dbUpdateProperty(updated);
    set((state) => ({
      properties: state.properties.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deleteProperty(id) {
    const property = get().properties.find((p) => p.id === id);
    if (property) {
      property.photos.forEach((photo) => {
        try {
          new File(photo.uri).delete();
        } catch {}
      });
    }
    dbDeleteProperty(id);
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    }));
  },

  getProperty(id) {
    return get().properties.find((p) => p.id === id);
  },

  async addPhoto(propertyId, sourceUri, caption) {
    const photosDir = new Directory(Paths.document, 'photos');
    photosDir.create({ intermediates: true, idempotent: true });

    const photoId = generateId();
    const srcFile = new File(sourceUri);
    const ext = srcFile.extension || '.jpg';
    const destFile = new File(photosDir, `${photoId}${ext}`);

    srcFile.copy(destFile);

    const photo: LocalPhoto = {
      id: photoId,
      propertyId,
      uri: destFile.uri,
      caption,
      takenAt: new Date().toISOString(),
    };

    dbInsertPhoto(photo);

    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === propertyId ? { ...p, photos: [...p.photos, photo] } : p
      ),
    }));

    return photo;
  },

  loadChecklist(propertyId) {
    let items = dbGetChecklistItems(propertyId);
    if (items.length === 0) {
      // First time — seed from defaults
      items = DEFAULT_CHECKLIST.map((d) => ({
        id: generateId(),
        propertyId,
        category: d.category,
        label: d.label,
        score: 0 as const,
      }));
      dbInsertChecklistItems(items);
    }
    set((state) => ({
      checklistItems: { ...state.checklistItems, [propertyId]: items },
    }));
  },

  setChecklistScore(propertyId, itemId, score) {
    dbSetChecklistScore(itemId, score);
    set((state) => ({
      checklistItems: {
        ...state.checklistItems,
        [propertyId]: (state.checklistItems[propertyId] ?? []).map((item) =>
          item.id === itemId ? { ...item, score } : item
        ),
      },
    }));
  },

  async deletePhoto(photo) {
    dbDeletePhoto(photo.id);
    try {
      new File(photo.uri).delete();
    } catch {}
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === photo.propertyId
          ? { ...p, photos: p.photos.filter((ph) => ph.id !== photo.id) }
          : p
      ),
    }));
  },
}));
