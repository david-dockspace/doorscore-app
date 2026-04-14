import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import type { Property } from '../types';
import { colors } from '../utils/theme';
import { formatPrice, formatDate, formatBedsBaths } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import RatingDisplay from './RatingDisplay';

interface Props {
  property: Property;
  onPress: () => void;
}

export default function PropertyCard({ property, onPress }: Props) {
  const thumb = property.photos[0];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Thumbnail */}
      <View style={styles.thumbContainer}>
        {thumb ? (
          <Image source={{ uri: thumb.uri }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbIcon}>🏠</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.address} numberOfLines={1} ellipsizeMode="tail">
            {property.address}
          </Text>
          <RatingDisplay rating={property.rating} size="sm" />
        </View>

        <Text style={styles.price}>{formatPrice(property.price)}</Text>

        <Text style={styles.details}>
          {formatBedsBaths(property.bedrooms, property.bathrooms)}
          {property.sqft ? `  ·  ${property.sqft.toLocaleString()} sqft` : ''}
        </Text>

        <View style={styles.bottomRow}>
          <StatusBadge status={property.status} size="sm" />
          <Text style={styles.date}>{formatDate(property.dateViewed)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbContainer: {
    width: 100,
    height: 100,
  },
  thumb: {
    width: 100,
    height: 100,
  },
  thumbPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIcon: {
    fontSize: 36,
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  details: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  date: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
