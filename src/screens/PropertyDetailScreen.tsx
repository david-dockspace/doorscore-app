import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { PropertyDetailScreenProps } from '../navigation/types';
import { usePropertyStore } from '../store/propertyStore';
import StatusBadge from '../components/StatusBadge';
import RatingDisplay from '../components/RatingDisplay';
import ProConsSection from '../components/ProConsSection';
import PhotoStrip from '../components/PhotoStrip';
import { colors } from '../utils/theme';
import { formatPrice, formatDate, formatBedsBaths, formatSqft } from '../utils/formatters';
import type { LocalPhoto } from '../types';

export default function PropertyDetailScreen({ route, navigation }: PropertyDetailScreenProps) {
  const { id } = route.params;
  const { properties, deleteProperty, addPhoto, deletePhoto } = usePropertyStore();
  const property = properties.find((p) => p.id === id);

  useLayoutEffect(() => {
    if (!property) return;
    navigation.setOptions({
      title: '',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProperty', { id })}
          style={styles.editBtn}
        >
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, id, property]);

  if (!property) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Property not found.</Text>
      </View>
    );
  }

  async function handleAddPhoto() {
    Alert.alert('Add Photo', '', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return;
          const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
          if (!result.canceled) await addPhoto(id, result.assets[0].uri);
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted' && status !== 'limited') return;
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
            copyToCacheDirectory: true,
          });
          if (!result.canceled) {
            for (const asset of result.assets) {
              try {
                await addPhoto(id, asset.uri);
              } catch (err) {
                Alert.alert('Photo upload failed', String(err));
              }
            }
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleDeleteProperty() {
    Alert.alert('Delete Property', `Remove "${property.address}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProperty(id);
          navigation.goBack();
        },
      },
    ]);
  }

  function handleDeletePhoto(photo: LocalPhoto) {
    deletePhoto(photo);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ──────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <RatingDisplay rating={property.rating} size="lg" />
            <View style={styles.heroMeta}>
              <Text style={styles.price}>{formatPrice(property.price)}</Text>
              <StatusBadge status={property.status} />
            </View>
          </View>

          <Text style={styles.address}>{property.address}</Text>

          <View style={styles.quickFacts}>
            <Fact icon="bed-outline" value={`${property.bedrooms} bd`} />
            <Fact icon="water-outline" value={`${property.bathrooms} ba`} />
            {property.sqft && <Fact icon="expand-outline" value={formatSqft(property.sqft)} />}
            {property.yearBuilt && <Fact icon="calendar-outline" value={`Built ${property.yearBuilt}`} />}
          </View>

          <Text style={styles.dateLabel}>
            Viewed {formatDate(property.dateViewed)}
          </Text>
        </View>

        {/* ── Photos ────────────────────────────────────── */}
        <Section title="Photos">
          <PhotoStrip
            photos={property.photos}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            onPhotoPress={(index) =>
              navigation.navigate('PhotoGallery', { id, initialIndex: index })
            }
          />
          {property.photos.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('PhotoGallery', { id })}
              style={styles.viewAllPhotos}
            >
              <Text style={styles.viewAllLabel}>View all {property.photos.length} photos</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
        </Section>

        {/* ── Notes ─────────────────────────────────────── */}
        {property.notes ? (
          <Section title="Notes">
            <Text style={styles.notes}>{property.notes}</Text>
          </Section>
        ) : null}

        {/* ── Pros & Cons ───────────────────────────────── */}
        {(property.pros.length > 0 || property.cons.length > 0) && (
          <Section title="Pros & Cons">
            {property.pros.length > 0 && (
              <ProConsSection
                label="Pros"
                items={property.pros}
                color="#10B981"
                icon="checkmark-circle"
                onChange={() => {}}
                editable={false}
              />
            )}
            {property.pros.length > 0 && property.cons.length > 0 && (
              <View style={styles.divider} />
            )}
            {property.cons.length > 0 && (
              <ProConsSection
                label="Cons"
                items={property.cons}
                color="#EF4444"
                icon="close-circle"
                onChange={() => {}}
                editable={false}
              />
            )}
          </Section>
        )}

        {/* ── Listing URL ───────────────────────────────── */}
        {property.listingUrl && (
          <Section title="Listing">
            <TouchableOpacity
              onPress={() => Linking.openURL(property.listingUrl!)}
              style={styles.linkRow}
            >
              <Ionicons name="link-outline" size={16} color={colors.primary} />
              <Text style={styles.linkText} numberOfLines={1}>
                {property.listingUrl}
              </Text>
              <Ionicons name="open-outline" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </Section>
        )}

        {/* ── Agent ─────────────────────────────────────── */}
        {(property.agentName || property.mlsNumber) && (
          <Section title="Agent & Listing">
            {property.agentName && (
              <InfoRow label="Agent" value={property.agentName} />
            )}
            {property.agentPhone && (
              <InfoRow label="Phone" value={property.agentPhone} />
            )}
            {property.mlsNumber && (
              <InfoRow label="MLS #" value={property.mlsNumber} />
            )}
          </Section>
        )}

        {/* ── Delete ────────────────────────────────────── */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteProperty}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.deleteLabel}>Delete Property</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

function Fact({
  icon,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
}) {
  return (
    <View style={factStyles.container}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={factStyles.text}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

const factStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontSize: 13,
    color: colors.text,
  },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    width: 72,
  },
  value: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: colors.textMuted,
  },
  scroll: {
    paddingBottom: 40,
  },
  editBtn: {
    marginRight: 4,
    padding: 4,
  },
  hero: {
    backgroundColor: colors.card,
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroMeta: {
    flex: 1,
    gap: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quickFacts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  viewAllPhotos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  viewAllLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteLabel: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
});

