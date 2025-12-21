import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProColors, Spacing, FontSizes, Colors } from '../../constants';

const { width } = Dimensions.get('window');



interface Stat {
    label: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: string;
}

interface Booking {
    id: string;
    clientName: string;
    date: string;
    time: string;
    service: string;
    price: number;
    status: string;
}

interface TopClient {
    id: string;
    name: string;
    totalBookings: number;
    totalSpent: string;
}

const MOCK_TOP_CLIENTS: TopClient[] = [
    { id: '1', name: 'David Cohen', totalBookings: 12, totalSpent: '1,800₪' },
    { id: '2', name: 'Marie Levy', totalBookings: 8, totalSpent: '1,250₪' },
    { id: '3', name: 'Sarah Ben', totalBookings: 6, totalSpent: '920₪' },
];

export default function ProDashboardScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<Stat[]>([
        { label: 'Revenus du mois', value: '4,850₪', icon: 'wallet', color: ProColors.accent, trend: '+12%' },
        { label: 'RDV cette semaine', value: 18, icon: 'calendar', color: ProColors.purple, trend: '+5' },
        { label: 'Nouveaux clients', value: 6, icon: 'people', color: ProColors.info, trend: '+2' },
        { label: 'Note moyenne', value: '4.9', icon: 'star', color: '#FFD700', trend: '⭐' },
    ]);
    const [recentBookings, setRecentBookings] = useState<Booking[]>([
        { id: '1', clientName: 'David Cohen', date: '2025-12-21', time: '10:00', service: 'Consultation', price: 150, status: 'CONFIRMED' },
        { id: '2', clientName: 'Marie Levy', date: '2025-12-21', time: '14:00', service: 'Premium', price: 250, status: 'PENDING' },
        { id: '3', clientName: 'Sarah Ben', date: '2025-12-22', time: '09:00', service: 'Standard', price: 120, status: 'CONFIRMED' },
    ]);

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(r => setTimeout(r, 1000));
        setRefreshing(false);
    };



    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={ProColors.accent}
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Bonjour Pro ! 👋</Text>
                    <Text style={styles.date}>
                        {new Date().toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </Text>
                </View>
                <TouchableOpacity style={styles.notifButton}>
                    <Ionicons name="notifications-outline" size={24} color={ProColors.text} />
                    <View style={styles.notifBadge} />
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                            </View>
                            {stat.trend && (
                                <Text style={[styles.statTrend, { color: stat.color }]}>{stat.trend}</Text>
                            )}
                        </View>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Top Clients */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⭐ Mes meilleurs clients</Text>
                <View style={styles.topClientsGrid}>
                    {MOCK_TOP_CLIENTS.map((client, index) => (
                        <View key={client.id} style={styles.topClientCard}>
                            <View style={styles.topClientRank}>
                                <Text style={styles.topClientRankText}>{index + 1}</Text>
                            </View>
                            <View style={styles.topClientAvatar}>
                                <Text style={styles.topClientAvatarText}>{client.name[0]}</Text>
                            </View>
                            <Text style={styles.topClientName}>{client.name}</Text>
                            <Text style={styles.topClientStat}>{client.totalBookings} RDV</Text>
                            <Text style={styles.topClientSpent}>{client.totalSpent}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Recent Bookings */}
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>📅 Récentes réservations</Text>
                    <TouchableOpacity onPress={() => router.push('/(pro-tabs)/bookings')}>
                        <Text style={styles.seeAll}>Voir tout</Text>
                    </TouchableOpacity>
                </View>

                {recentBookings.map((booking) => (
                    <View key={booking.id} style={styles.bookingCard}>
                        <View style={styles.bookingLeft}>
                            <View style={styles.bookingAvatar}>
                                <Text style={styles.bookingAvatarText}>{booking.clientName[0]}</Text>
                            </View>
                            <View>
                                <Text style={styles.bookingClient}>{booking.clientName}</Text>
                                <Text style={styles.bookingService}>{booking.service}</Text>
                            </View>
                        </View>
                        <View style={styles.bookingRight}>
                            <Text style={styles.bookingPrice}>{booking.price}₪</Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: booking.status === 'CONFIRMED' ? ProColors.accent + '30' : ProColors.warning + '30' }
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    { color: booking.status === 'CONFIRMED' ? ProColors.accent : ProColors.warning }
                                ]}>
                                    {booking.status === 'CONFIRMED' ? '✓ Confirmé' : '⏳ En attente'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/pro-agenda')}
                    >
                        <Ionicons name="calendar" size={28} color={ProColors.accent} />
                        <Text style={styles.actionText}>Agenda</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/pro-services')}
                    >
                        <Ionicons name="pricetag" size={28} color={ProColors.purple} />
                        <Text style={styles.actionText}>Services</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/pro-portfolio')}
                    >
                        <Ionicons name="images" size={28} color={ProColors.info} />
                        <Text style={styles.actionText}>Portfolio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(pro-tabs)/earnings')}
                    >
                        <Ionicons name="stats-chart" size={28} color={ProColors.gold} />
                        <Text style={styles.actionText}>Stats</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ProColors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingTop: 60,
    },
    greeting: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: ProColors.text,
    },
    date: {
        fontSize: FontSizes.md,
        color: ProColors.textSecondary,
        marginTop: Spacing.xs,
        textTransform: 'capitalize',
    },
    notifButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: ProColors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: ProColors.error,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: ProColors.card,
        borderRadius: 16,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: ProColors.border,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statTrend: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
    },
    statValue: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: ProColors.text,
    },
    statLabel: {
        fontSize: FontSizes.sm,
        color: ProColors.textSecondary,
        marginTop: Spacing.xs,
    },
    section: {
        padding: Spacing.md,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: ProColors.text,
        marginBottom: Spacing.md,
    },
    seeAll: {
        fontSize: FontSizes.sm,
        color: ProColors.accent,
        fontWeight: '600',
    },
    podiumContainer: {
        padding: Spacing.md,
        backgroundColor: ProColors.card,
        margin: Spacing.md,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: ProColors.border,
    },
    podium: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingTop: Spacing.xl,
    },
    podiumItem: {
        alignItems: 'center',
        flex: 1,
    },
    firstPlace: {
        marginTop: -20,
    },
    crownContainer: {
        marginBottom: Spacing.xs,
    },
    crown: {
        fontSize: 28,
    },
    podiumAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: ProColors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    podiumAvatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
    },
    goldBorder: {
        borderColor: ProColors.gold,
    },
    silverBorder: {
        borderColor: ProColors.silver,
    },
    bronzeBorder: {
        borderColor: ProColors.bronze,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '700',
        color: ProColors.text,
    },
    avatarTextLarge: {
        fontSize: 28,
    },
    rankBadge: {
        position: 'absolute',
        top: 50,
        right: '30%',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: ProColors.silver,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goldBadge: {
        backgroundColor: ProColors.gold,
        top: 70,
    },
    bronzeBadge: {
        backgroundColor: ProColors.bronze,
    },
    rankText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: '#000',
    },
    podiumName: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: ProColors.text,
        marginTop: Spacing.sm,
    },
    firstName: {
        fontSize: FontSizes.md,
    },
    // Top Clients Section
    topClientsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    topClientCard: {
        flex: 1,
        backgroundColor: ProColors.card,
        borderRadius: 16,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ProColors.border,
    },
    topClientRank: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: ProColors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topClientRankText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: ProColors.text,
    },
    topClientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: ProColors.purple + '30',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    topClientAvatarText: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: ProColors.purple,
    },
    topClientName: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: ProColors.text,
        textAlign: 'center',
        marginBottom: 2,
    },
    topClientStat: {
        fontSize: FontSizes.xs,
        color: ProColors.textSecondary,
    },
    topClientSpent: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: ProColors.accent,
        marginTop: 4,
    },
    bookingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: ProColors.card,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: ProColors.border,
    },
    bookingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    bookingAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: ProColors.purple + '30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookingAvatarText: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: ProColors.purple,
    },
    bookingClient: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: ProColors.text,
    },
    bookingService: {
        fontSize: FontSizes.sm,
        color: ProColors.textSecondary,
    },
    bookingRight: {
        alignItems: 'flex-end',
    },
    bookingPrice: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: ProColors.accent,
    },
    statusBadge: {
        borderRadius: 8,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        marginTop: Spacing.xs,
    },
    statusText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionCard: {
        flex: 1,
        backgroundColor: ProColors.card,
        borderRadius: 16,
        padding: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: ProColors.border,
    },
    actionText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: ProColors.text,
        textAlign: 'center',
    },
});
