import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontSizes } from '../constants';

interface ClientTagBadgeProps {
    tag: string;
    small?: boolean;
}

const TAG_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string; text: string }> = {
    'VIP': {
        label: 'VIP',
        icon: 'star',
        bg: '#FEF3C7',
        text: '#D97706'
    },
    'NOUVEAU': {
        label: 'Nouveau',
        icon: 'sparkles',
        bg: '#DBEAFE',
        text: '#2563EB'
    },
    'INACTIF': {
        label: 'Inactif',
        icon: 'moon',
        bg: '#F3F4F6',
        text: '#6B7280'
    },
    'FIDELE': {
        label: 'Fidèle',
        icon: 'heart',
        bg: '#FEE2E2',
        text: '#DC2626'
    },
    'A_RELANCER': {
        label: 'À relancer',
        icon: 'notifications',
        bg: '#FFEDD5',
        text: '#EA580C'
    }
};

export function ClientTagBadge({ tag, small = false }: ClientTagBadgeProps) {
    const config = TAG_CONFIG[tag];

    if (!config) return null;

    return (
        <View style={[
            styles.badge,
            { backgroundColor: config.bg },
            small && styles.badgeSmall
        ]}>
            <Ionicons
                name={config.icon}
                size={small ? 10 : 12}
                color={config.text}
            />
            <Text style={[
                styles.badgeText,
                { color: config.text },
                small && styles.badgeTextSmall
            ]}>
                {config.label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeSmall: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        gap: 3,
    },
    badgeText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
    badgeTextSmall: {
        fontSize: 10,
    },
});
