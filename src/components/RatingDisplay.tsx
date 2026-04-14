import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ratingColor } from '../utils/theme';

interface Props {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingDisplay({ rating, size = 'md' }: Props) {
  const color = ratingColor(rating);
  const dims = size === 'lg' ? 48 : size === 'sm' ? 28 : 36;
  const fontSize = size === 'lg' ? 20 : size === 'sm' ? 13 : 16;

  return (
    <View
      style={[
        styles.container,
        { width: dims, height: dims, borderRadius: dims / 2, borderColor: color },
      ]}
    >
      <Text style={[styles.text, { color, fontSize }]}>{rating}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontWeight: '700',
    lineHeight: undefined,
  },
});
