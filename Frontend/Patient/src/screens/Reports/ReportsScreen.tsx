// src/screens/Reports/ReportsScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCurrentPatient } from '@context/UserContext';
import { useTheme } from '@context/ThemeContext';

type Report = any; // keeps it flexible with your existing mock structure

type FilterType = 'all' | 'scanned' | 'manual';

const ReportsScreen: React.FC = () => {
  const { currentPatient: patient } = useCurrentPatient();

  const [filter, setFilter] = useState<FilterType>('all');
  const [query, setQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const { theme } = useTheme();

  // filter reports for logged-in patient (if any)
  const patientReports: Report[] = useMemo(() => {
    const base = patient
      ? allReports.filter((r: any) => r.patientId === patient.id)
      : allReports;

    let filtered = base;

    if (filter === 'scanned') {
      filtered = base.filter((r: any) => r.source === 'scanned');
    } else if (filter === 'manual') {
      filtered = base.filter((r: any) => r.source === 'manual');
    }

    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (r: any) =>
          r.title?.toLowerCase().includes(q) ||
          r.type?.toLowerCase().includes(q)
      );
    }

    // sort latest first
    filtered.sort((a: any, b: any) => (a.date < b.date ? 1 : -1));

    return filtered;
  }, [filter, query, patient]);

  const openInsights = (report: Report) => {
    setSelectedReport(report);
    setShowInsights(true);
  };

  const closeInsights = () => {
    setShowInsights(false);
    setSelectedReport(null);
  };

  const renderReport = ({ item }: { item: Report }) => {
    const risk = item.risk ?? 'ok';
    const status = item.status ?? 'ok'; // 'pending' used for blue outline

    const { outlineColor, iconBg, iconColor, iconName } = getRiskStyling(
      theme,
      risk,
      status
    );

    return (
      <View style={[styles.card, { borderColor: outlineColor }]}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardIconAndTitle}>
            <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
              {renderTypeIcon(item.type, iconColor)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {item.title ?? 'Report'}
              </Text>
              <Text style={[styles.cardMeta, { color: theme.muted }]}>
                {item.date ?? ''} •{' '}
                {item.source === 'scanned' ? 'Scanned report' : 'Manual'}
              </Text>
            </View>
          </View>

          <View style={[styles.riskBadge, { borderColor: outlineColor }]}>
            {iconName === 'check-circle' ? (
              <MaterialIcons name={iconName} size={20} color={iconColor} />
            ) : (
              <MaterialIcons name="check-circle-outline" size={20} color={iconColor} />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.aiButton, { borderColor: theme.primary }]}
          onPress={() => openInsights(item)}
        >
          <Ionicons name="stats-chart-outline" size={16} color={theme.primary} />
          <Text style={[styles.aiButtonText, { color: theme.primary }]}>
            AI insights & view image
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.safeTop} />

      <Text style={[styles.headerTitle, { color: theme.text }]}>Reports</Text>
      <Text style={[styles.headerSubtitle, { color: theme.muted }]}>
        Latest reports first. Blue = pending, green = OK, yellow = caution,
        red = high risk.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by type or title (e.g. BP, sugar, lab)"
        placeholderTextColor={theme.muted}
        style={[
          styles.searchInput,
          {
            borderColor: theme.border,
            color: theme.text,
            backgroundColor: theme.card,
          },
        ]}
      />

      <View style={styles.filterRow}>
        <FilterChip
          label="All"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
          colors={theme}
        />
        <FilterChip
          label="Scanned"
          active={filter === 'scanned'}
          onPress={() => setFilter('scanned')}
          colors={theme}
        />
        <FilterChip
          label="Manual"
          active={filter === 'manual'}
          onPress={() => setFilter('manual')}
          colors={theme}
        />
      </View>

      <FlatList
        data={patientReports}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={renderReport}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.safeBottom} />

      {/* AI insights modal */}
      <Modal
        visible={showInsights}
        transparent
        animationType="slide"
        onRequestClose={closeInsights}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHandle} />
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedReport?.title ?? 'Report insights'}
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.muted }]}>
                {selectedReport?.date ?? ''}{' '}
                {selectedReport?.type
                  ? `• ${String(selectedReport.type).toUpperCase()}`
                  : ''}
              </Text>

              {/* Dummy BP graph section */}
              {selectedReport?.type === 'bp' ? (
                <View style={styles.graphSection}>
                  <Text
                    style={[styles.graphTitle, { color: theme.text }]}
                  >
                    Blood pressure trend (dummy)
                  </Text>
                  <Text
                    style={[styles.graphSubtitle, { color: theme.muted }]}
                  >
                    Systolic BP over the last 18 months.
                  </Text>
                  <BpDummyGraph colors={theme} />
                </View>
              ) : (
                <View style={styles.graphSection}>
                  <Text
                    style={[styles.graphTitle, { color: theme.text }]}
                  >
                    Graph not available
                  </Text>
                  <Text
                    style={[styles.graphSubtitle, { color: theme.muted }]}
                  >
                    At the moment the dummy graph is only shown for blood
                    pressure reports.
                  </Text>
                </View>
              )}

              <View style={{ marginTop: 16 }}>
                <Text
                  style={[styles.insightText, { color: theme.text }]}
                >
                  • This is dummy AI text summarising whether the values are
                  stable, improving or worsening over time.
                </Text>
                <Text
                  style={[styles.insightText, { color: theme.text }]}
                >
                  • You can describe risk zones (green = safe, yellow =
                  caution, red = high risk) and recommend checking with a
                  doctor if values keep trending upwards or downwards.
                </Text>
              </View>

              <View style={{ marginTop: 14 }}>
                <Text
                  style={[styles.imageNote, { color: theme.muted }]}
                >
                  For now this is a dummy screen. When a real report image is
                  attached, it would be displayed here along with these
                  insights.
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeInsights}
                style={[styles.modalCloseButton, { borderColor: theme.border }]}
              >
                <Text
                  style={{ color: theme.text, fontSize: 15, fontWeight: '500' }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: any;
};

const FilterChip: React.FC<ChipProps> = ({ label, active, onPress, colors }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      active && { backgroundColor: colors.primary },
      { borderColor: colors.border },
    ]}
  >
    <Text
      style={[
        styles.chipText,
        { color: active ? '#fff' : colors.text },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// Small dummy bar graph for BP
const BpDummyGraph: React.FC<{ colors: any }> = ({ colors }) => {
  // dummy systolic values in mmHg across time
  const values = [118, 122, 130, 128, 135, 140, 132, 126, 124, 129, 138, 134];
  const max = Math.max(...values);
  const min = Math.min(...values);

  return (
    <View style={styles.graphWrapper}>
      <View style={styles.graphBarsRow}>
        {values.map((v, idx) => {
          const heightPercent = ((v - min) / (max - min + 1)) * 0.7 + 0.2; // 20–90%
          return (
            <View
              key={idx}
              style={[
                styles.graphBar,
                {
                  height: `${heightPercent * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.graphLegendRow}>
        <Text
          style={[styles.graphLegendText, { color: colors.muted }]}
        >
          Older
        </Text>
        <Text
          style={[styles.graphLegendText, { color: colors.muted }]}
        >
          Recent
        </Text>
      </View>
    </View>
  );
};

const getRiskStyling = (colors: any, risk: string, status: string) => {
  // blue for pending
  if (status === 'pending') {
    return {
      outlineColor: '#3b82f6',
      iconBg: '#3b82f622',
      iconColor: '#3b82f6',
      iconName: 'more-horiz',
    };
  }

  if (risk === 'high') {
    return {
      outlineColor: '#ef4444',
      iconBg: '#ef444422',
      iconColor: '#ef4444',
      iconName: 'warning',
    };
  }

  if (risk === 'medium') {
    return {
      outlineColor: '#facc15',
      iconBg: '#facc1522',
      iconColor: '#facc15',
      iconName: 'error-outline',
    };
  }

  // default: ok / low risk
  return {
    outlineColor: '#22c55e',
    iconBg: '#22c55e22',
    iconColor: '#22c55e',
    iconName: 'check-circle',
  };
};

const renderTypeIcon = (type: string, color: string) => {
  if (type === 'bp') {
    return <Ionicons name="heart-outline" size={18} color={color} />;
  }
  if (type === 'sugar') {
    return <Ionicons name="water-outline" size={18} color={color} />;
  }
  return <Ionicons name="briefcase-outline" size={18} color={color} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  safeTop: { height: 32 },
  safeBottom: { height: 24 },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardIconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
  },
  riskBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  aiButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 8,
    borderWidth: 1,
    maxHeight: '80%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 8,
    marginTop: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  graphSection: {
    marginTop: 4,
  },
  graphTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  graphSubtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  graphWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  graphBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
  },
  graphBar: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 4,
  },
  graphLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  graphLegendText: {
    fontSize: 11,
  },
  insightText: {
    fontSize: 13,
    marginBottom: 4,
  },
  imageNote: {
    fontSize: 12,
  },
  modalCloseButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});

export default ReportsScreen;
