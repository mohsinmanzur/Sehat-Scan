// src/screens/ShareAccess/ShareAccessScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';

type DurationPreset = '10m' | '1h' | '1d' | '1w' | 'custom';

interface AccessRecord {
  id: string;
  doctor: string;
  hospital: string;
  duration: string;
  status: 'active' | 'expired';
}

const initialAccess: AccessRecord[] = [
  {
    id: '1',
    doctor: 'Dr. Ahsan Malik',
    hospital: 'Aga Khan Hospital',
    duration: '1 day',
    status: 'expired',
  },
  {
    id: '2',
    doctor: 'Dr. Sara Ahmed',
    hospital: 'South City Hospital',
    duration: '1 week',
    status: 'active',
  },
];

const ShareAccessScreen: React.FC = () => {

  const [doctorName, setDoctorName] = useState('');
  const [hospital, setHospital] = useState('');
  const [expertise, setExpertise] = useState('');
  const [preset, setPreset] = useState<DurationPreset>('10m');
  const [customValue, setCustomValue] = useState('');
  const [customUnit, setCustomUnit] = useState<'min' | 'h' | 'd' | 'w'>('min');
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [accessList, setAccessList] = useState<AccessRecord[]>(initialAccess);

  const { theme } = useTheme();

  const toggleAccessModal = () =>
    setAccessModalVisible((prev) => !prev);

  const addAccessRecord = () => {
    const duration =
      preset === 'custom'
        ? `${customValue || '1'} ${customUnit === 'min'
          ? 'minute(s)'
          : customUnit === 'h'
            ? 'hour(s)'
            : customUnit === 'd'
              ? 'day(s)'
              : 'week(s)'
        }`
        : preset === '10m'
          ? '10 minutes'
          : preset === '1h'
            ? '1 hour'
            : preset === '1d'
              ? '1 day'
              : '1 week';

    const doctor = doctorName || 'Unnamed doctor';
    const hosp = hospital || 'Unknown hospital';

    const newRecord: AccessRecord = {
      id: `${Date.now()}`,
      doctor,
      hospital: hosp,
      duration,
      status: 'active',
    };

    setAccessList((prev) => [newRecord, ...prev]);
  };

  const revokeAccess = (id: string) => {
    setAccessList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'expired' } : r
      )
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.safeTop} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Share access
        </Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Select a doctor and how long they can view your reports.
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.muted }]}>
          Doctor name
        </Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: theme.border, color: theme.text },
          ]}
          value={doctorName}
          onChangeText={setDoctorName}
          placeholder="e.g. Dr. Ahsan Malik"
          placeholderTextColor={theme.muted}
        />

        <Text
          style={[
            styles.label,
            { color: theme.muted, marginTop: 12 },
          ]}
        >
          Hospital / clinic
        </Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: theme.border, color: theme.text },
          ]}
          value={hospital}
          onChangeText={setHospital}
          placeholder="e.g. Aga Khan Hospital"
          placeholderTextColor={theme.muted}
        />

        <Text
          style={[
            styles.label,
            { color: theme.muted, marginTop: 12 },
          ]}
        >
          Expertise
        </Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: theme.border, color: theme.text },
          ]}
          value={expertise}
          onChangeText={setExpertise}
          placeholder="e.g. Cardiologist, Diabetologist"
          placeholderTextColor={theme.muted}
        />

        <Text
          style={[
            styles.label,
            { color: theme.muted, marginTop: 14 },
          ]}
        >
          Access duration
        </Text>

        <View style={styles.chipRow}>
          {(['10m', '1h', '1d', '1w'] as DurationPreset[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.chip,
                preset === v && {
                  backgroundColor: theme.primary,
                },
              ]}
              onPress={() => setPreset(v)}
            >
              <Text
                style={{
                  color: preset === v ? '#fff' : theme.text,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {v === '10m'
                  ? '10 min'
                  : v === '1h'
                    ? '1 hour'
                    : v === '1d'
                      ? '1 day'
                      : '1 week'}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.chip,
              preset === 'custom' && {
                backgroundColor: theme.primary,
              },
            ]}
            onPress={() => setPreset('custom')}
          >
            <Text
              style={{
                color: preset === 'custom' ? '#fff' : theme.text,
                fontSize: 13,
                fontWeight: '600',
              }}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {preset === 'custom' && (
          <View style={styles.customRow}>
            <TextInput
              style={[
                styles.customInput,
                {
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={customValue}
              onChangeText={setCustomValue}
              keyboardType="numeric"
              placeholder="Value"
              placeholderTextColor={theme.muted}
            />
            <View style={styles.customUnits}>
              {(['min', 'h', 'd', 'w'] as Array<
                'min' | 'h' | 'd' | 'w'
              >).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.chip,
                    customUnit === u && {
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() => setCustomUnit(u)}
                >
                  <Text
                    style={{
                      color:
                        customUnit === u ? '#fff' : theme.text,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.shareButton,
            { backgroundColor: theme.primary },
          ]}
          onPress={addAccessRecord}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.shareLabel}>Generate access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reviewButton}
          onPress={toggleAccessModal}
        >
          <Text
            style={{
              color: theme.primary,
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            Review access
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.safeBottom} />

      {/* ACCESS REVIEW MODAL */}
      <Modal
        visible={accessModalVisible}
        transparent
        animationType="slide"
        onRequestClose={toggleAccessModal}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text
              style={[
                styles.modalTitle,
                { color: theme.text },
              ]}
            >
              Access review
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: theme.muted },
              ]}
            >
              Who can see your reports, for how long.
            </Text>

            {accessList.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.accessCard,
                  {
                    borderColor:
                      a.status === 'active'
                        ? theme.primary
                        : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.accessTitle,
                    { color: theme.text },
                  ]}
                >
                  {a.doctor}
                </Text>
                <Text
                  style={{ color: theme.muted, fontSize: 13 }}
                >
                  {a.hospital}
                </Text>
                <Text
                  style={{ color: theme.muted, fontSize: 13 }}
                >
                  Duration: {a.duration}
                </Text>
                <View style={styles.accessRow}>
                  <Text
                    style={{
                      color:
                        a.status === 'active'
                          ? theme.success
                          : theme.muted,
                      fontSize: 13,
                    }}
                  >
                    {a.status === 'active' ? 'Active' : 'Expired'}
                  </Text>
                  {a.status === 'active' && (
                    <TouchableOpacity
                      style={[
                        styles.revokeButton,
                        { backgroundColor: theme.danger },
                      ]}
                      onPress={() => revokeAccess(a.id)}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: '600',
                        }}
                      >
                        Revoke
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={toggleAccessModal}
            >
              <Text
                style={{ color: theme.primary, fontSize: 15 }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeTop: { height: 28 },
  safeBottom: { height: 28 },

  header: { paddingHorizontal: 16, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  label: { fontSize: 13, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
    marginTop: 6,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#64748b',
  },

  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginTop: 8,
  },
  customInput: {
    flex: 0.4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },
  customUnits: {
    flexDirection: 'row',
    columnGap: 6,
    flex: 0.6,
  },

  shareButton: {
    marginTop: 18,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 8,
  },
  shareLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  reviewButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000066',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    height: '65%',
  },
  modalHandle: {
    width: 46,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#6b7280',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalSubtitle: { fontSize: 12, marginTop: 2, marginBottom: 8 },

  accessCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  accessTitle: { fontSize: 15, fontWeight: '600' },
  accessRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revokeButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  closeBtn: {
    alignSelf: 'center',
    marginTop: 16,
  },
});

export default ShareAccessScreen;
