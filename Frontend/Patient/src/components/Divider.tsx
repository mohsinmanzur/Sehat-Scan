import { View, DimensionValue, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/colors';

interface DividerProps {
    width?: DimensionValue;
    height?: DimensionValue;
    color?: string;
}

export const Divider = ({width = "100%", height = 2, color}: DividerProps) => {

    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
  return (
    <View style = {{width, height, backgroundColor: color || theme.card, borderRadius: 20}}/>
  )
}