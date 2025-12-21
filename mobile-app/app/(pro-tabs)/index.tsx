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
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface TopPro {
    id: string;
    name: string;
    image?: string;
    rating: number;
    bookings: number;
    revenue: string;
}

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

const MOCK_TOP_PROS: TopPro[] = [
    { id: '2', name: 'Marie L.', rating: 4.9, bookings: 156, revenue: '45,200₪' },
    { id: '1', name: 'David C.', rating: 5.0, bookings: 203, revenue: '62,800₪' }, // 1st
    { id: '3', name: 'Sarah B.', rating: 4.8, bookings: 134, revenue: '38,400₪' },
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

    const renderPodium = () => {
        const [second, first, third] = MOCK_TOP_PROS;

        return (
            <View style={styles.podiumContainer}>
                <Text style={styles.sectionTitle}>🏆 Top Pros du mois</Text>
                <View style={styles.podium}>
                    {/* 2nd Place */}
                    <View style={styles.podiumItem}>
                        <View style={[styles.podiumAvatar, styles.silverBorder]}>
                            <Text style={styles.avatarText}>{second.name[0]}</Text>
                        </View>
                        <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>2</Text>
                        </View>
                        <Text style={styles.podiumName}>{second.name}</Text>
                        <Text style={styles.podiumStat}>⭐ {second.rating}</Text>
                        <View style={[styles.podiumBar, styles.silverBar]}>
                            <Text style={styles.podiumRevenue}>{second.revenue}</Text>
                        </View>
                    </View>

                    {/* 1st Place */}
                    <View style={[styles.podiumItem, styles.firstPlace]}>
                        <View style={styles.crownContainer}>
                            <Text style={styles.crown}>👑</Text>
                        </View>
                        <View style={[styles.podiumAvatar, styles.podiumAvatarLarge, styles.goldBorder]}>
                            <Text style={[styles.avatarText, styles.avatarTextLarge]}>{first.name[0]}</Text>
                        </View>
                        <View style={[styles.rankBadge, styles.goldBadge]}>
                            <Text style={styles.rankText}>1</Text>
                        </View>
                        <Text style={[styles.podiumName, styles.firstName]}>{first.name}</Text>
                        <Text style={styles.podiumStat}>⭐ {first.rating}</Text>
                        <View style={[styles.podiumBar, styles.goldBar]}>
                            <Text style={styles.podiumRevenue}>{first.revenue}</Text>
                        </View>
                    </View>

                    {/* 3rd Place */}
                    <View style={styles.podiumItem}>
                        <View style={[styles.podiumAvatar, styles.bronzeBorder]}>
                            <Text style={styles.avatarText}>{third.name[0]}</Text>
                        </View>
                        <View style={[styles.rankBadge, styles.bronzeBadge]}>
                            <Text style={styles.rankText}>3</Text>
                        </View>
                        <Text style={styles.podiumName}>{third.name}</Text>
                        <Text style={styles.podiumStat}>⭐ {third.rating}</Text>
                        <View style={[styles.podiumBar, styles.bronzeBar]}>
                            <Text style={styles.podiumRevenue}>{third.revenue}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
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

            {/* Leaderboard Podium */}
            {renderPodium()}

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
    podiumStat: {
        fontSize: FontSizes.xs,
        color: ProColors.textSecondary,
        marginTop: 2,
    },
    podiumBar: {
        width: '80%',
        marginTop: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
        alignItems: 'center',
    },
    goldBar: {
        backgroundColor: ProColors.gold + '30',
        height: 80,
        justifyContent: 'flex-end',
        paddingBottom: Spacing.sm,
    },
    silverBar: {
        backgroundColor: ProColors.silver + '30',
        height: 60,
    },
    bronzeBar: {
        backgroundColor: ProColors.bronze + '30',
        height: 50,
    },
    podiumRevenue: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: ProColors.text,
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
