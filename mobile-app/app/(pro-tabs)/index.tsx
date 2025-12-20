import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../constants';
import { api } from '../../services/api';

interface Stat {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

interface Booking {
    id: string;
    clientName: string;
    date: string;
    time: string;
    status: string;
    price: number;
}

export default function ProDashboardScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<Stat[]>([
        { label: 'Réservations', value: '-', icon: 'calendar', color: Colors.accent },
        { label: 'Revenus', value: '-', icon: 'wallet', color: Colors.success },
        { label: 'Clients', value: '-', icon: 'people', color: Colors.info },
        { label: 'Note', value: '-', icon: 'star', color: '#FFD700' },
    ]);
    const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
    const [todayBookings, setTodayBookings] = useState<Booking[]>([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        // TODO: Load real data from API
        // For now, mock data
        setStats([
            { label: 'Réservations', value: 12, icon: 'calendar', color: Colors.accent },
            { label: 'Revenus', value: '2,400₪', icon: 'wallet', color: Colors.success },
            { label: 'Clients', value: 8, icon: 'people', color: Colors.info },
            { label: 'Note', value: '4.8', icon: 'star', color: '#FFD700' },
        ]);

        setPendingBookings([
            { id: '1', clientName: 'David Cohen', date: '2025-12-24', time: '10:00', status: 'PENDING', price: 150 },
            { id: '2', clientName: 'Marie Levy', date: '2025-12-24', time: '14:00', status: 'PENDING', price: 200 },
        ]);

        setTodayBookings([
            { id: '3', clientName: 'Sarah Ben', date: '2025-12-20', time: '09:00', status: 'CONFIRMED', price: 120 },
            { id: '4', clientName: 'Michel Azoulay', date: '2025-12-20', time: '15:00', status: 'CONFIRMED', price: 180 },
        ]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboard();
        setRefreshing(false);
    };

    const handleAcceptBooking = (id: string, clientName: string) => {
        // Remove the booking from pending list
        setPendingBookings(prev => prev.filter(b => b.id !== id));
        // Add to today's bookings (mock)
        if (typeof window !== 'undefined') {
            window.alert(`✅ Réservation acceptée pour ${clientName}`);
        }
    };

    const handleRejectBooking = (id: string, clientName: string) => {
        // Remove the booking from pending list
        setPendingBookings(prev => prev.filter(b => b.id !== id));
        if (typeof window !== 'undefined') {
            window.alert(`❌ Réservation refusée pour ${clientName}`);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Bonjour Pro ! 👋</Text>
                <Text style={styles.date}>
                    {new Date().toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    })}
                </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                        </View>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Pending Bookings */}
            {pendingBookings.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔔 En attente de confirmation</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{pendingBookings.length}</Text>
                        </View>
                    </View>

                    {pendingBookings.map((booking) => (
                        <View key={booking.id} style={styles.pendingCard}>
                            <View style={styles.bookingInfo}>
                                <Text style={styles.clientName}>{booking.clientName}</Text>
                                <View style={styles.bookingMeta}>
                                    <Ionicons name="calendar-outline" size={14} color={Colors.gray.medium} />
                                    <Text style={styles.bookingDate}>{booking.date} à {booking.time}</Text>
                                </View>
                                <Text style={styles.bookingPrice}>{booking.price}₪</Text>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => handleAcceptBooking(booking.id, booking.clientName)}
                                >
                                    <Ionicons name="checkmark" size={20} color={Colors.white} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={() => handleRejectBooking(booking.id, booking.clientName)}
                                >
                                    <Ionicons name="close" size={20} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Today's Schedule */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 Aujourd'hui</Text>

                {todayBookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color={Colors.gray.light} />
                        <Text style={styles.emptyText}>Aucun RDV aujourd'hui</Text>
                    </View>
                ) : (
                    todayBookings.map((booking, index) => (
                        <View key={booking.id} style={styles.scheduleItem}>
                            <View style={styles.timeBlock}>
                                <Text style={styles.timeText}>{booking.time}</Text>
                            </View>
                            <View style={styles.scheduleInfo}>
                                <Text style={styles.clientName}>{booking.clientName}</Text>
                                <Text style={styles.schedulePrice}>{booking.price}₪</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Confirmé</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(pro-tabs)/bookings')}
                    >
                        <Ionicons name="calendar-outline" size={28} color={Colors.primary} />
                        <Text style={styles.actionText}>Mes réservations</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(pro-tabs)/settings')}
                    >
                        <Ionicons name="pricetag-outline" size={28} color={Colors.primary} />
                        <Text style={styles.actionText}>Modifier tarifs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(pro-tabs)/settings')}
                    >
                        <Ionicons name="person-outline" size={28} color={Colors.primary} />
                        <Text style={styles.actionText}>Mon profil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(pro-tabs)/earnings')}
                    >
                        <Ionicons name="stats-chart-outline" size={28} color={Colors.primary} />
                        <Text style={styles.actionText}>Statistiques</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.lightest,
    },
    header: {
        backgroundColor: Colors.primary,
        padding: Spacing.xl,
        paddingTop: 60,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    greeting: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.white,
    },
    date: {
        fontSize: FontSizes.md,
        color: Colors.white,
        opacity: 0.8,
        marginTop: Spacing.xs,
        textTransform: 'capitalize',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.md,
        marginTop: -30,
        gap: Spacing.sm,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.md,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statValue: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    section: {
        padding: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    badge: {
        backgroundColor: Colors.error,
        borderRadius: 12,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },
    badgeText: {
        color: Colors.white,
        fontSize: FontSizes.xs,
        fontWeight: '700',
    },
    pendingCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: Colors.warning,
    },
    bookingInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    bookingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.xs,
    },
    bookingDate: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    bookingPrice: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.accent,
        marginTop: Spacing.xs,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    acceptButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.white,
        borderRadius: 16,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        marginTop: Spacing.md,
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    timeBlock: {
        backgroundColor: Colors.accent,
        borderRadius: 8,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginRight: Spacing.md,
    },
    timeText: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.white,
    },
    scheduleInfo: {
        flex: 1,
    },
    schedulePrice: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    statusBadge: {
        backgroundColor: Colors.success + '20',
        borderRadius: 12,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    statusText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: Colors.success,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    actionCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    actionText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.primary,
        textAlign: 'center',
    },
});
