import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { AddPropertyScreenProps } from '../navigation/types';
import { usePropertyStore } from '../store/propertyStore';
import ProConsSection from '../components/ProConsSection';
import PhotoStrip from '../components/PhotoStrip';
import { colors } from '../utils/theme';
import { parseListingUrl } from '../utils/ogParser';
import { todayISOString } from '../utils/formatters';
import type { PropertyStatus } from '../types';

const STATUS_OPTIONS: { label: string; value: PropertyStatus }[] = [
  { label: 'Want to Tour', value: 'want_to_tour' },
  { label: 'Toured', value: 'toured' },
  { label: 'Interested', value: 'interested' },
  { label: 'Not Interested', value: 'not_interested' },
  { label: 'Offer Made', value: 'offer_made' },
];

export default function AddPropertyScreen({ navigation }: AddPropertyScreenProps) {
  const { addProperty, addPhoto } = usePropertyStore();

  // Form state
  const [listingUrl, setListingUrl] = useState('');
  const [ogLoading, setOgLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<PropertyStatus>('toured');
  const [dateViewed, setDateViewed] = useState(todayISOString());

  function handleDateChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length > 6) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);
    setDateViewed(formatted);
  }
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sqft, setSqft] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [mlsNumber, setMlsNumber] = useState('');
  const [pendingPhotos, setPendingPhotos] = useState<{ id: string; uri: string }[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleAutoFill() {
    const url = listingUrl.trim();
    if (!url) return;
    setOgLoading(true);
    try {
      const data = await parseListingUrl(url);
      if (data.address) setAddress(data.address);
      if (data.price) setPrice(String(data.price));
      if (data.bedrooms) setBedrooms(String(data.bedrooms));
      if (data.bathrooms) setBathrooms(String(data.bathrooms));
      if (data.sqft) setSqft(String(data.sqft));
    } catch {
      Alert.alert('Auto-fill failed', 'Could not parse listing URL. Fill in manually.');
    } finally {
      setOgLoading(false);
    }
  }

  async function pickPhoto() {
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted' && perm !== 'limited') {
      Alert.alert('Permission needed', 'Allow photo access to attach images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map((asset, i) => ({
        id: `pending_${Date.now()}_${i}`,
        uri: asset.uri,
      }));
      setPendingPhotos((prev) => [...prev, ...newPhotos]);
    }
  }

  async function takePhoto() {
    const { status: perm } = await ImagePicker.requestCameraPermissionsAsync();
    if (perm !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setPendingPhotos((prev) => [
        ...prev,
        { id: `pending_${Date.now()}`, uri: result.assets[0].uri },
      ]);
    }
  }

  function removePendingPhoto(id: string) {
    setPendingPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  function showPhotoOptions() {
    Alert.alert('Add Photo', '', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickPhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleSave() {
    if (!address.trim()) {
      Alert.alert('Required', 'Address is required.');
      return;
    }
    setSaving(true);
    try {
      const propertyId = addProperty({
        address: address.trim(),
        price: parseFloat(price.replace(/[^0-9.]/g, '')) || 0,
        listingUrl: listingUrl.trim() || undefined,
        dateViewed,
        status,
        rating,
        notes,
        pros,
        cons,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseFloat(bathrooms) || 0,
        sqft: sqft ? parseInt(sqft) : undefined,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
        agentName: agentName.trim() || undefined,
        agentPhone: agentPhone.trim() || undefined,
        mlsNumber: mlsNumber.trim() || undefined,
      });

      // Attach pending photos
      for (const p of pendingPhotos) {
        await addPhoto(propertyId, p.uri);
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const pendingAsLocalPhotos = pendingPhotos.map((p) => ({
    id: p.id,
    propertyId: '',
    uri: p.uri,
    takenAt: new Date().toISOString(),
  }));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── URL Auto-fill ─────────────────────────────── */}
          <Section title="Listing URL (optional)">
            <View style={styles.urlRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={listingUrl}
                onChangeText={setListingUrl}
                placeholder="Paste Zillow / Redfin URL"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                style={styles.autoFillBtn}
                onPress={handleAutoFill}
                disabled={ogLoading || !listingUrl.trim()}
              >
                {ogLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.autoFillLabel}>Fill</Text>
                )}
              </TouchableOpacity>
            </View>
          </Section>

          {/* ── Address ───────────────────────────────────── */}
          <Section title="Address *">
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="123 Main St, City, State"
              placeholderTextColor={colors.textMuted}
            />
          </Section>

          {/* ── Price ─────────────────────────────────────── */}
          <Section title="List Price">
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="$0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </Section>

          {/* ── Status ────────────────────────────────────── */}
          <Section title="Status">
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setStatus(opt.value)}
                  style={[styles.statusChip, status === opt.value && styles.statusChipActive]}
                >
                  <Text
                    style={[
                      styles.statusLabel,
                      status === opt.value && styles.statusLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          {/* ── Date Viewed ───────────────────────────────── */}
          <Section title="Date Viewed">
            <TextInput
              style={styles.input}
              value={dateViewed}
              onChangeText={handleDateChange}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={10}
            />
          </Section>

          {/* ── Rating ────────────────────────────────────── */}
          <Section title={`Rating: ${rating}/10`}>
            <View style={styles.ratingRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setRating(n)}
                  style={[styles.ratingBtn, rating === n && styles.ratingBtnActive]}
                >
                  <Text style={[styles.ratingNum, rating === n && styles.ratingNumActive]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          {/* ── Details ───────────────────────────────────── */}
          <Section title="Property Details">
            <View style={styles.detailGrid}>
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>Beds</Text>
                <TextInput
                  style={styles.inputSm}
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  placeholder="3"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>Baths</Text>
                <TextInput
                  style={styles.inputSm}
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  placeholder="2"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>Sqft</Text>
                <TextInput
                  style={styles.inputSm}
                  value={sqft}
                  onChangeText={setSqft}
                  placeholder="1,500"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>Year Built</Text>
                <TextInput
                  style={styles.inputSm}
                  value={yearBuilt}
                  onChangeText={setYearBuilt}
                  placeholder="1995"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </Section>

          {/* ── Notes ─────────────────────────────────────── */}
          <Section title="Notes">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Overall impressions, things to follow up on..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Section>

          {/* ── Pros ──────────────────────────────────────── */}
          <Section title="Pros & Cons">
            <ProConsSection
              label="Pros"
              items={pros}
              color="#10B981"
              icon="checkmark-circle"
              onChange={setPros}
            />
            <View style={styles.divider} />
            <ProConsSection
              label="Cons"
              items={cons}
              color="#EF4444"
              icon="close-circle"
              onChange={setCons}
            />
          </Section>

          {/* ── Photos ────────────────────────────────────── */}
          <Section title="Photos">
            <PhotoStrip
              photos={pendingAsLocalPhotos}
              onAddPhoto={showPhotoOptions}
              onDeletePhoto={(photo) => removePendingPhoto(photo.id)}
            />
          </Section>

          {/* ── Agent (optional) ──────────────────────────── */}
          <Section title="Agent (optional)">
            <TextInput
              style={styles.input}
              value={agentName}
              onChangeText={setAgentName}
              placeholder="Agent name"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={agentPhone}
              onChangeText={setAgentPhone}
              placeholder="Agent phone"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={mlsNumber}
              onChangeText={setMlsNumber}
              placeholder="MLS #"
              placeholderTextColor={colors.textMuted}
            />
          </Section>

          {/* ── Save ──────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveLabel}>Save Property</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  urlRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  autoFillBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 52,
    alignItems: 'center',
  },
  autoFillLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputSm: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  textarea: {
    minHeight: 80,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  statusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statusLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  ratingBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingNum: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  ratingNumActive: {
    color: '#fff',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailField: {
    flex: 1,
    minWidth: 70,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  saveBtn: {
    margin: 16,
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
