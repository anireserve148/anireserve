import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../services/api';
import { Colors } from '../constants';

interface NotificationBellProps {
    color?: string;
    size?: number;
}

export function NotificationBell({ color = Colors.primary, size = 24 }: NotificationBellProps) {
    const router = useRouter();
    const [count, setCount] = useState(0);

    const loadNotifications = async () => {
        const result = await api.getNotificationCount();
        if (result.success && result.data) {
            setCount(result.data.total);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Reload when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    const handlePress = () => {
        // Navigate to messages or notifications screen
        router.push('/messages');
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <Ionicons name="notifications-outline" size={size} color={color} />
            {count > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {count > 99 ? '99+' : count}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: 8,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
});
