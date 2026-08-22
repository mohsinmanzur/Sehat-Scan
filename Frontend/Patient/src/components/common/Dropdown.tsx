import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScalePressable } from 'src/components/ScalePressable';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';

interface DropdownProps {
    label?: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: boolean;
    remainingStyles?: any;
}

export function Dropdown({ label, options, value, onChange, placeholder = 'Select...', error, remainingStyles }: DropdownProps) {
    const { theme } = useTheme();
    const [open, setOpen] = useState(false);
    const s = styles(theme);


    return (
        <View>
            {label && <Text style={s.label}>{label}</Text>}

            <ScalePressable
                style={[s.trigger, { borderColor: error ? theme.danger : theme.card }, remainingStyles]}
                onPress={() => setOpen(o => !o)}
            >
                <Text style={[s.triggerText, !value && { color: theme.textLight }]}>
                    {value || placeholder}
                </Text>
                <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.textGray}
                />
            </ScalePressable>

            {open && (
                <View style={s.list}>
                    {options.map(opt => (
                        <ScalePressable
                            key={opt}
                            style={[s.item, opt === value && s.itemActive]}
                            onPress={() => { onChange(opt); setOpen(false); }}
                        >
                            <Text style={[s.itemText, opt === value && { color: theme.primary }]}>
                                {opt}
                            </Text>
                        </ScalePressable>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    label: {
        fontSize: 11,
        fontFamily: 'Lexend_700Bold',
        color: theme.textLight,
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: 18,
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.card,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1
    },
    triggerText: {
        fontSize: 15,
        fontFamily: 'Lexend_600SemiBold',
        color: theme.text,
    },
    list: {
        backgroundColor: theme.card,
        borderRadius: 14,
        marginTop: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.primarySoft,
    },
    item: {
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.backgroundDark,
    },
    itemActive: {
        backgroundColor: theme.primarySoft,
    },
    itemText: {
        fontSize: 14,
        fontFamily: 'Lexend_600SemiBold',
        color: theme.text,
    },
});
