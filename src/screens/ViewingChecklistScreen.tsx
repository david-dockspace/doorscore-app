import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ViewingChecklistScreenProps } from '../navigation/types';
import { usePropertyStore } from '../store/propertyStore';
import { colors } from '../utils/theme';
import { CATEGORY_ICONS } from '../utils/defaultChecklist';
import type { ChecklistItem } from '../types';

const SCORE_COLORS: Record<number, string> = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#10B981',
};

const SCORE_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'OK',
  3: 'Good',
};

function computeScore(items: ChecklistItem[]) {
  const rated = items.filter((i) => i.score > 0);
  if (rated.length === 0) return null;
  const sum = rated.reduce((acc, i) => acc + i.score, 0);
  const max = rated.length * 3;
  return Math.round((sum / max) * 100);
}

export default function ViewingChecklistScreen({ route }: ViewingChecklistScreenProps) {
  const { id } = route.params;
  const { checklistItems, loadChecklist, setChecklistScore } = usePropertyStore();

  useEffect(() => {
    loadChecklist(id);
  }, [id]);

  const items = checklistItems[id] ?? [];
  const total = items.length;
  const ratedCount = items.filter((i) => i.score > 0).length;
  const overallScore = computeScore(items);
  const progress = total > 0 ? ratedCount / total : 0;

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Progress + score header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.ratedLabel}>{ratedCount} / {total} rated</Text>
          </View>
          {overallScore !== null && (
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor(overallScore) }]}>
              <Text style={styles.scoreText}>{overallScore}%</Text>
            </View>
          )}
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Persistent scale key */}
      <View style={styles.scaleBar}>
        {([1, 2, 3] as const).map((n) => (
          <View key={n} style={styles.scaleItem}>
            <View style={[styles.scaleDot, { backgroundColor: SCORE_COLORS[n] }]} />
            <Text style={styles.scaleLabel}>{n} = {SCORE_LABELS[n]}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {categories.map((category) => {
          const catItems = items.filter((i) => i.category === category);
          const catScore = computeScore(catItems);
          const iconName = (CATEGORY_ICONS[category] ?? 'list-outline') as React.ComponentProps<typeof Ionicons>['name'];

          return (
            <View key={category} style={styles.category}>
              <View style={styles.categoryHeader}>
                <Ionicons name={iconName} size={15} color={colors.primary} />
                <Text style={styles.categoryTitle}>{category}</Text>
                {catScore !== null && (
                  <View style={[styles.catScoreBadge, { backgroundColor: scoreColor(catScore) }]}>
                    <Text style={styles.catScoreText}>{catScore}%</Text>
                  </View>
                )}
              </View>

              {catItems.map((item) => (
                <View key={item.id} style={styles.row}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <View style={styles.pills}>
                    {([1, 2, 3] as const).map((n) => {
                      const selected = item.score === n;
                      return (
                        <TouchableOpacity
                          key={n}
                          style={[
                            styles.pill,
                            selected && { backgroundColor: SCORE_COLORS[n], borderColor: SCORE_COLORS[n] },
                          ]}
                          onPress={() => setChecklistScore(id, item.id, selected ? 0 : n)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                            {n}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

function scoreColor(pct: number): string {
  if (pct >= 70) return '#10B981';
  if (pct >= 40) return '#F59E0B';
  return '#EF4444';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  scroll: {
    paddingBottom: 40,
  },
  category: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  catScoreText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  pills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  pillTextSelected: {
    color: '#fff',
  },
  scaleBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scaleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scaleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
});
