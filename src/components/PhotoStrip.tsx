import React from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LocalPhoto } from '../types';
import { colors } from '../utils/theme';

interface Props {
  photos: LocalPhoto[];
  onAddPhoto: () => void;
  onDeletePhoto?: (photo: LocalPhoto) => void;
  onPhotoPress?: (index: number) => void;
  editable?: boolean;
}

export default function PhotoStrip({
  photos,
  onAddPhoto,
  onDeletePhoto,
  onPhotoPress,
  editable = true,
}: Props) {
  function confirmDelete(photo: LocalPhoto) {
    Alert.alert('Delete Photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeletePhoto?.(photo) },
    ]);
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {/* Add button */}
      {editable && (
        <TouchableOpacity style={styles.addBtn} onPress={onAddPhoto}>
          <Ionicons name="camera-outline" size={24} color={colors.primary} />
          <Text style={styles.addLabel}>Add Photo</Text>
        </TouchableOpacity>
      )}

      {/* Photos */}
      {photos.map((photo, index) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.photoContainer}
          onPress={() => onPhotoPress?.(index)}
          onLongPress={() => editable && confirmDelete(photo)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: photo.uri }} style={styles.photo} />
          {editable && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => confirmDelete(photo)}
              hitSlop={4}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}

      {/* Spacer at end */}
      <View style={styles.endSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  addBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    gap: 2,
  },
  addLabel: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 8,
    overflow: 'hidden',
  },
  photo: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  deleteBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  endSpacer: {
    width: 8,
  },
});
