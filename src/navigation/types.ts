import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ─── Properties stack ─────────────────────────────────────────────────────────
export type PropertiesStackParamList = {
  PropertyList: undefined;
  AddProperty: undefined;
  PropertyDetail: { id: string };
  EditProperty: { id: string };
  PhotoGallery: { id: string; initialIndex?: number };
  ViewingChecklist: { id: string };
};

// ─── Compare tab ─────────────────────────────────────────────────────────────
export type CompareStackParamList = {
  Compare: undefined;
};

// ─── Root tab navigator ───────────────────────────────────────────────────────
export type RootTabParamList = {
  PropertiesTab: undefined;
  CompareTab: undefined;
};

// ─── Screen props helpers ────────────────────────────────────────────────────
export type PropertyListScreenProps = NativeStackScreenProps<PropertiesStackParamList, 'PropertyList'>;
export type AddPropertyScreenProps = NativeStackScreenProps<PropertiesStackParamList, 'AddProperty'>;
export type PropertyDetailScreenProps = NativeStackScreenProps<PropertiesStackParamList, 'PropertyDetail'>;
export type EditPropertyScreenProps = NativeStackScreenProps<PropertiesStackParamList, 'EditProperty'>;
export type PhotoGalleryScreenProps = NativeStackScreenProps<PropertiesStackParamList, 'PhotoGallery'>;
export type ViewingChecklistScreenProps = NativeStackScreenProps<PropertiesStackParamList, 'ViewingChecklist'>;
export type CompareScreenProps = NativeStackScreenProps<CompareStackParamList, 'Compare'>;
