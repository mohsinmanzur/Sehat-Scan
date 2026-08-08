import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

export const CurvedArrow: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Svg width="250" height="145" viewBox="0 0 260 180">
        <Path
          d="M130,10 C130,70 180,120 220,160"
          fill="none"
          stroke={theme.textGray}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <Path
          d="M195,160 L220,160 L220,135"
          fill="none"
          stroke={theme.textGray}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: -130,
    marginTop: 10,
  },
});
