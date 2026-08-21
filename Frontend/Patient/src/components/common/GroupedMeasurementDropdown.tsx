import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@context/ThemeContext';
import type { MeasurementUnit } from '../../types/types';
import { Colors } from 'src/constants/colors';
import { ScalePressable } from '../ScalePressable';

interface GroupedMeasurementDropdownProps {
    label?: string;
    emptyText?: string;
    units: MeasurementUnit[];
    value: MeasurementUnit | null;
    onChange: (unit: MeasurementUnit) => void;
    error?: boolean;
    remainingStyles?: any;
    onRemove?: () => void;
}

type Section = {
    title: string;
    data: MeasurementUnit[];
};

const MAX_LIST_HEIGHT = 320;

function buildSections(units: MeasurementUnit[]): Section[] {
    const general: MeasurementUnit[] = [];
    const grouped: Record<string, MeasurementUnit[]> = {};

    for (const unit of units) {
        if (unit.unit_name === unit.measurement_group) {
            general.push(unit);
        } else {
            if (!grouped[unit.measurement_group]) {
                grouped[unit.measurement_group] = [];
            }
            grouped[unit.measurement_group].push(unit);
        }
    }

    const sections: Section[] = [];

    if (general.length > 0) {
        sections.push({ title: 'General', data: general });
    }

    for (const [group, items] of Object.entries(grouped)) {
        sections.push({ title: group, data: items });
    }

    return sections;
}

export function GroupedMeasurementDropdown({
    emptyText,
    label,
    units,
    value,
    onChange,
    error,
    remainingStyles,
    onRemove,
}: GroupedMeasurementDropdownProps) {
    const { theme } = useTheme();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const filteredUnits = useMemo(() => {
        if (!searchQuery.trim()) return units;
        const query = searchQuery.toLowerCase();
        return units.filter(
            unit =>
                unit.unit_name.toLowerCase().includes(query) ||
                unit.measurement_group.toLowerCase().includes(query)
        );
    }, [units, searchQuery]);

    const sections = useMemo(() => buildSections(filteredUnits), [filteredUnits]);

    const s = styles(theme);

    const toggleOpen = () => {
        const toValue = open ? 0 : 1;
        Animated.spring(rotateAnim, {
            toValue,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
        }).start();
        setOpen(o => {
            if (o) setSearchQuery('');
            return !o;
        });
    };

    const handleSelect = (unit: MeasurementUnit) => {
        onChange(unit);
        Animated.spring(rotateAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
        }).start();
        setOpen(false);
        setSearchQuery('');
    };

    const chevronRotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const trigger = (
        <TouchableOpacity
            style={[s.trigger, { borderColor: error ? theme.danger : theme.card }]}
            onPress={() => {
                if (!open) toggleOpen();
            }}
            activeOpacity={open ? 1 : 0.8}
        >
            {open ? (
                <View style={s.triggerSearchContainer}>
                    <Ionicons name="search" size={16} color={theme.textGray} />
                    <TextInput
                        style={s.triggerSearchInput}
                        placeholder="Search..."
                        placeholderTextColor={theme.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <ScalePressable onPress={() => setSearchQuery('')} style={s.clearIcon}>
                            <Ionicons name="close-circle" size={16} color={theme.textGray} />
                        </ScalePressable>
                    )}
                </View>
            ) : (
                <View style={s.triggerTextContainer}>
                    <Text style={[s.triggerText, !value && { color: theme.textLight }]} numberOfLines={1}>
                        {value?.unit_name ?? emptyText ?? 'Select...'}
                    </Text>
                </View>
            )}
            <ScalePressable onPress={toggleOpen} style={s.chevronContainer}>
                <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
                    <Ionicons name="chevron-down" size={18} color={theme.textGray} />
                </Animated.View>
            </ScalePressable>
        </TouchableOpacity>
    );

    return (
        <Animated.View style={remainingStyles}>
            {label && <Text style={s.label}>{label}</Text>}

            {onRemove ? (
                <View style={s.triggerRow}>
                    <View style={{ flex: 1 }}>{trigger}</View>
                    <TouchableOpacity style={s.removeBtn} onPress={onRemove} hitSlop={8}>
                        <Ionicons name="close" size={26} color={theme.danger} />
                    </TouchableOpacity>
                </View>
            ) : trigger}

            {open && (
                <View style={s.listContainer}>
                    <ScrollView
                        style={{ maxHeight: MAX_LIST_HEIGHT }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                    >
                        {sections.length === 0 ? (
                            <View style={s.emptyContainer}>
                                <Text style={s.emptyText}>No results found</Text>
                            </View>
                        ) : (
                            sections.map((section, sIdx) => (
                                <View key={section.title}>
                                    {/* Section header */}
                                    <View style={[s.sectionHeader, sIdx > 0 && s.sectionHeaderBorder]}>
                                        <Text style={s.sectionTitle}>{section.title.toUpperCase()}</Text>
                                    </View>

                                    {/* Section items */}
                                    {section.data.map((unit, idx) => {
                                        const isSelected = value?.id
                                            ? value.id === unit.id
                                            : value?.unit_name === unit.unit_name;
                                        const isLast = idx === section.data.length - 1;

                                        return (
                                            <TouchableOpacity
                                                key={unit.id ?? unit.unit_name}
                                                style={[
                                                    s.item,
                                                    isSelected && s.itemActive,
                                                    isLast && s.itemLast,
                                                ]}
                                                onPress={() => handleSelect(unit)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        s.itemText,
                                                        isSelected && { color: theme.primary },
                                                    ]}
                                                >
                                                    {unit.unit_name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )))}
                    </ScrollView>
                </View>
            )}
        </Animated.View>
    );
}

const styles = (theme: typeof Colors.dark) =>
    StyleSheet.create({
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
            borderWidth: 1,
        },
        triggerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        removeBtn: {
            width: 40,
            height: 40,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        triggerText: {
            fontSize: 15,
            fontFamily: 'Lexend_600SemiBold',
            color: theme.text,
        },
        listContainer: {
            backgroundColor: theme.card,
            borderRadius: 14,
            marginTop: 4,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.primarySoft,
        },
        /* ── Search (Trigger) ── */
        triggerSearchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        triggerSearchInput: {
            flex: 1,
            marginLeft: 8,
            fontSize: 14,
            fontFamily: 'Lexend_600SemiBold',
            color: theme.text,
            padding: 0,
        },
        triggerTextContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        clearIcon: {
            padding: 4,
            marginLeft: 4,
        },
        chevronContainer: {
            paddingLeft: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyContainer: {
            padding: 30,
            alignItems: 'center',
        },
        emptyText: {
            fontSize: 14,
            fontFamily: 'Lexend_600SemiBold',
            color: theme.textLight,
        },
        /* ── Section header ── */
        sectionHeader: {
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 6,
        },
        sectionHeaderBorder: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.backgroundDark,
        },
        sectionTitle: {
            fontSize: 10,
            fontFamily: 'Lexend_700Bold',
            color: theme.primaryDark,
            letterSpacing: 1,
        },
        /* ── Items ── */
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 13,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.backgroundDark,
        },
        itemLast: {
            borderBottomWidth: 0,
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
