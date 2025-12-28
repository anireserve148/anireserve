import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ProColors, Spacing, FontSizes } from '../constants';
import { storage } from '../services/storage';

interface Notification {
    id: string;
    type: 'message' | 'booking' | 'reminder' | 'system';
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        loadUserAndNotifications();
    }, []);

    const loadUserAndNotifications = async () => {
        const user = await storage.getUser();
        setIsPro(user?.role === 'PRO');
        // For now, show placeholder notifications
        // In a real app, you'd fetch from API
        setNotifications([
            {
                id: '1',
                type: 'system',
                title: 'Bienvenue sur AniReserve !',
                body: 'Votre compte a été créé avec succès.',
                createdAt: new Date().toISOString(),
                read: false,
            },
        ]);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserAndNotifications();
        setRefreshing(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return 'chatbubble';
            case 'booking': return 'calendar';
            case 'reminder': return 'alarm';
            default: return 'notifications';
        }
    };

    const colors = isPro ? ProColors : Colors;
    const bgColor = isPro ? ProColors.background : Colors.background;
    const cardColor = isPro ? ProColors.card : Colors.card;
    const textColor = isPro ? ProColors.text : Colors.gray.darker;

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: cardColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off" size={64} color={Colors.gray.medium} />
                    <Text style={styles.emptyText}>Aucune notification</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: Spacing.md }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.notificationCard, { backgroundColor: cardColor }]}>
                            <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                                <Ionicons name={getIcon(item.type)} size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.notificationContent}>
                                <Text style={[styles.notificationTitle, { color: textColor }]}>{item.title}</Text>
                                <Text style={styles.notificationBody}>{item.body}</Text>
                                <Text style={styles.notificationTime}>
                                    {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                                </Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: Spacing.md,
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        marginBottom: 4,
    },
    notificationBody: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: FontSizes.xs,
        color: Colors.gray.medium,
    },
});
