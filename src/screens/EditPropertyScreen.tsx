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
import { Ionicons } from '@expo/vector-icons';
import type { EditPropertyScreenProps } from '../navigation/types';
import { usePropertyStore } from '../store/propertyStore';
import ProConsSection from '../components/ProConsSection';
import { colors } from '../utils/theme';
import type { PropertyStatus } from '../types';

const STATUS_OPTIONS: { label: string; value: PropertyStatus }[] = [
  { label: 'Want to Tour', value: 'want_to_tour' },
  { label: 'Toured', value: 'toured' },
  { label: 'Interested', value: 'interested' },
  { label: 'Not Interested', value: 'not_interested' },
  { label: 'Offer Made', value: 'offer_made' },
];

export default function EditPropertyScreen({ route, navigation }: EditPropertyScreenProps) {
  const { id } = route.params;
  const { properties, updateProperty } = usePropertyStore();
  const property = properties.find((p) => p.id === id);

  const [address, setAddress] = useState(property?.address ?? '');
  const [price, setPrice] = useState(property?.price ? String(property.price) : '');
  const [listingUrl, setListingUrl] = useState(property?.listingUrl ?? '');
  const [status, setStatus] = useState<PropertyStatus>(property?.status ?? 'toured');
  const [dateViewed, setDateViewed] = useState(property?.dateViewed ?? '');
  const [rating, setRating] = useState(property?.rating ?? 5);
  const [notes, setNotes] = useState(property?.notes ?? '');
  const [pros, setPros] = useState<string[]>(property?.pros ?? []);
  const [cons, setCons] = useState<string[]>(property?.cons ?? []);
  const [bedrooms, setBedrooms] = useState(property?.bedrooms ? String(property.bedrooms) : '');
  const [bathrooms, setBathrooms] = useState(property?.bathrooms ? String(property.bathrooms) : '');
  const [sqft, setSqft] = useState(property?.sqft ? String(property.sqft) : '');
  const [yearBuilt, setYearBuilt] = useState(property?.yearBuilt ? String(property.yearBuilt) : '');
  const [agentName, setAgentName] = useState(property?.agentName ?? '');
  const [agentPhone, setAgentPhone] = useState(property?.agentPhone ?? '');
  const [mlsNumber, setMlsNumber] = useState(property?.mlsNumber ?? '');
  const [saving, setSaving] = useState(false);

  function handleDateChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length > 6) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);
    setDateViewed(formatted);
  }

  if (!property) {
    return (
      <View style={styles.notFound}>
        <Text>Property not found.</Text>
      </View>
    );
  }

  async function handleSave() {
    if (!address.trim()) {
      Alert.alert('Required', 'Address is required.');
      return;
    }
    setSaving(true);
    try {
      updateProperty(id, {
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
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

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
          <Section title="Address *">
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="123 Main St, City, State"
              placeholderTextColor={colors.textMuted}
            />
          </Section>

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

          <Section title="Listing URL">
            <TextInput
              style={styles.input}
              value={listingUrl}
              onChangeText={setListingUrl}
              placeholder="https://www.zillow.com/..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="url"
            />
          </Section>

          <Section title="Status">
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setStatus(opt.value)}
                  style={[styles.statusChip, status === opt.value && styles.statusChipActive]}
                >
                  <Text style={[styles.statusLabel, status === opt.value && styles.statusLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

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

          <Section title="Property Details">
            <View style={styles.detailGrid}>
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>Beds</Text>
                <TextInput
                  style={styles.inputSm}
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  keyboardType="numeric"
                  placeholder="3"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>Baths</Text>
                <TextInput
                  style={styles.inputSm}
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>Sqft</Text>
                <TextInput
                  style={styles.inputSm}
                  value={sqft}
                  onChangeText={setSqft}
                  keyboardType="numeric"
                  placeholder="1,500"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>Year Built</Text>
                <TextInput
                  style={styles.inputSm}
                  value={yearBuilt}
                  onChangeText={setYearBuilt}
                  keyboardType="numeric"
                  placeholder="1995"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </Section>

          <Section title="Notes">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Section>

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
                <Text style={styles.saveLabel}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 40 },
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
  textarea: { minHeight: 80 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  statusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusLabel: { fontSize: 13, color: colors.textMuted },
  statusLabelActive: { color: '#fff', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  ratingBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center',
  },
  ratingBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  ratingNum: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  ratingNumActive: { color: '#fff' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailField: { flex: 1, minWidth: 70, gap: 4 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  saveBtn: {
    margin: 16, marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
