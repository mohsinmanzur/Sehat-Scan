import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@context/ThemeContext';

type Unit = 'minutes' | 'hours' | 'days' | 'weeks';

interface Props {
  onChange: (preset: string | null, custom: { value: number; unit: Unit } | null, isValid: boolean) => void;
}

const presetOptions = [
  { label: '10 mins', value: '10m' },
  { label: '1 hour', value: '1h' },
  { label: '1 day', value: '1d' },
  { label: '1 week', value: '1w' }
];

const DurationSelector: React.FC<Props> = ({ onChange }) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>('10m');
  const [customValue, setCustomValue] = useState<string>('');
  const [unit, setUnit] = useState<Unit>('minutes');
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();

  const validate = (valueStr: string, unitVal: Unit, preset: string | null) => {
    let isValid = true;
    let err: string | null = null;

    if (preset) {
      setError(null);
      onChange(preset, null, true);
      return;
    }

    const value = Number(valueStr);
    if (!valueStr || Number.isNaN(value) || value <= 0) {
      err = 'Enter a valid duration.';
      isValid = false;
    } else {
      if (unitVal === 'minutes' && value > 60) {
        err = 'Minutes cannot be more than 60.';
        isValid = false;
      }
      if (unitVal === 'hours' && value > 24) {
        err = 'Hours cannot be more than 24.';
        isValid = false;
      }
      if (unitVal === 'days' && value > 365) {
        err = 'Days cannot be more than 365.';
        isValid = false;
      }
      if (unitVal === 'weeks' && value > 52) {
        err = 'Weeks cannot be more than 52.';
        isValid = false;
      }
    }

    setError(err);
    onChange(
      null,
      isValid ? { value, unit: unitVal } : null,
      isValid
    );
  };

  const handlePresetPress = (value: string) => {
    setSelectedPreset(value);
    setCustomValue('');
    validate('', unit, value);
  };

  const handleCustomChange = (value: string) => {
    setSelectedPreset(null);
    setCustomValue(value);
    validate(value, unit, null);
  };

  const handleUnitChange = (unitVal: Unit) => {
    setSelectedPreset(null);
    setUnit(unitVal);
    validate(customValue, unitVal, null);
  };

  return (
    <View>
      <Text style={{ color: theme.text, fontSize: 14, marginBottom: 8, fontWeight: '600' }}>
        Access Duration
      </Text>
      <View style={styles.presetRow}>
        {presetOptions.map(opt => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => handlePresetPress(opt.value)}
            style={[
              styles.presetButton,
              {
                backgroundColor:
                  selectedPreset === opt.value ? theme.primarySoft : theme.background,
                borderColor:
                  selectedPreset === opt.value ? theme.primary : theme.border
              }
            ]}
          >
            <Text
              style={{
                color: selectedPreset === opt.value ? theme.primary : theme.muted,
                fontSize: 12,
                fontWeight: '500'
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ color: theme.muted, fontSize: 12, marginTop: 8, marginBottom: 4 }}>
        Or set a custom duration
      </Text>
      <View style={styles.customRow}>
        <TextInput
          value={customValue}
          onChangeText={handleCustomChange}
          keyboardType="numeric"
          placeholder="Value"
          placeholderTextColor={theme.muted}
          style={[
            styles.valueInput,
            {
              borderColor: theme.border,
              color: theme.text
            }
          ]}
        />
        <View style={styles.unitRow}>
          {(['minutes', 'hours', 'days', 'weeks'] as Unit[]).map(u => (
            <TouchableOpacity
              key={u}
              onPress={() => handleUnitChange(u)}
              style={[
                styles.unitButton,
                {
                  backgroundColor:
                    unit === u ? theme.primarySoft : theme.background,
                  borderColor: unit === u ? theme.primary : theme.border
                }
              ]}
            >
              <Text
                style={{
                  color: unit === u ? theme.primary : theme.muted,
                  fontSize: 11
                }}
              >
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {error && (
        <Text style={{ color: theme.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  presetButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6
  },
  customRow: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center'
  },
  valueInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 70,
    marginRight: 8,
    fontSize: 13
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 4
  },
  unitButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 4,
    marginBottom: 4
  }
});

export default DurationSelector;
