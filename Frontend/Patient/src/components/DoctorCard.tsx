import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Doctor } from '../types/models';
import { useTheme } from '@context/ThemeContext';

interface Props {
  doctor: Doctor;
  selected: boolean;
  onPress: () => void;
}

const DoctorCard: React.FC<Props> = ({ doctor, selected, onPress }) => {

  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: selected ? 2 : 1
        }
      ]}
    >
      <Text style={[styles.name, { color: theme.text }]}>{doctor.name}</Text>
      <Text style={[styles.specialty, { color: theme.muted }]}>{doctor.specialty}</Text>
      <Text style={[styles.hospital, { color: theme.muted }]}>{doctor.hospital}</Text>
      <Text style={[styles.location, { color: theme.muted }]}>{doctor.location}</Text>
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
