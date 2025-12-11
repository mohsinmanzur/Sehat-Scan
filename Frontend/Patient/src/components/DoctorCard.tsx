import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Doctor } from '@types/models';
import { useAppTheme } from '@theme/ThemeContext';

interface Props {
  doctor: Doctor;
  selected: boolean;
  onPress: () => void;
}

const DoctorCard: React.FC<Props> = ({ doctor, selected, onPress }) => {
  const { theme } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1
        }
      ]}
    >
      <Text style={[styles.name, { color: theme.colors.text }]}>{doctor.name}</Text>
      <Text style={[styles.specialty, { color: theme.colors.muted }]}>{doctor.specialty}</Text>
      <Text style={[styles.hospital, { color: theme.colors.muted }]}>{doctor.hospital}</Text>
      <Text style={[styles.location, { color: theme.colors.muted }]}>{doctor.location}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 10
  },
  name: {
    fontSize: 15,
    fontWeight: '600'
  },
  specialty: {
    fontSize: 13
  },
  hospital: {
    fontSize: 12,
    marginTop: 2
  },
  location: {
    fontSize: 12,
    marginTop: 2
  }
});

export default DoctorCard;
