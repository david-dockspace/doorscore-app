import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { PhotoGalleryScreenProps } from '../navigation/types';
import { usePropertyStore } from '../store/propertyStore';
import { colors } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PhotoGalleryScreen({ route, navigation }: PhotoGalleryScreenProps) {
  const { id, initialIndex = 0 } = route.params;
  const { properties, deletePhoto } = usePropertyStore();
  const property = properties.find((p) => p.id === id);
  const photos = property?.photos ?? [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const listRef = useRef<FlatList>(null);

  if (!property || photos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No photos</Text>
      </View>
    );
  }

  function handleDelete(index: number) {
    const photo = photos[index];
    Alert.alert('Delete Photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePhoto(photo);
          if (index >= photos.length - 1 && index > 0) {
            setCurrentIndex(index - 1);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.counter}>
          {currentIndex + 1} / {photos.length}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(currentIndex)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Photos */}
      <FlatList
        ref={listRef}
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        initialScrollIndex={initialIndex}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.photoPage}>
            <Image
              source={{ uri: item.uri }}
              style={styles.photo}
              resizeMode="contain"
            />
            {item.caption ? (
              <Text style={styles.caption}>{item.caption}</Text>
            ) : null}
          </View>
        )}
      />

      {/* Thumbnail strip */}
      <FlatList
        data={photos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.thumbStrip}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => {
              setCurrentIndex(index);
              listRef.current?.scrollToIndex({ index, animated: true });
            }}
          >
            <Image
              source={{ uri: item.uri }}
              style={[styles.thumb, index === currentIndex && styles.thumbActive]}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 4,
  },
  counter: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
  },
  photoPage: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  caption: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  thumbStrip: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 6,
    marginRight: 6,
    opacity: 0.6,
  },
  thumbActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
