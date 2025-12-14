import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export default function ProDashboard() {
    const { user } = useAuth();

    const stats = {
        revenue: 1234,
        bookings: 24,
        clients: 12,
        pending: 3,
    };

    const recentBookings = [
        { id: 1, client: 'Jean Dupont', service: 'Toilettage', date: '15 Dec', status: 'PENDING' },
        { id: 2, client: 'Marie Martin', service: 'Promenade', date: '14 Dec', status: 'CONFIRMED' },
        { id: 3, client: 'Paul Bernard', service: 'Dressage', date: '13 Dec', status: 'COMPLETED' },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Welcome */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Bonjour,</Text>
                    <Text style={styles.welcomeName}>{user?.name || 'Professionnel'}</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, styles.primaryCard]}>
                        <Ionicons name="cash-outline" size={32} color={COLORS.white} />
                        <Text style={styles.statValue}>{stats.revenue}€</Text>
                        <Text style={styles.statLabel}>Revenu Total</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="calendar-outline" size={28} color={COLORS.primary} />
                        <Text style={[styles.statValue, styles.statValueDark]}>{stats.bookings}</Text>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Réservations</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="people-outline" size={28} color={COLORS.primary} />
                        <Text style={[styles.statValue, styles.statValueDark]}>{stats.clients}</Text>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Clients</Text>
                    </View>

                    <View style={[styles.statCard, styles.warningCard]}>
                        <Ionicons name="time-outline" size={28} color={COLORS.warning} />
                        <Text style={[styles.statValue, styles.statValueWarning]}>{stats.pending}</Text>
                        <Text style={[styles.statLabel, styles.statLabelWarning]}>En Attente</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions Rapides</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="calendar" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Calendrier</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="people" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Clients</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="briefcase" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Services</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Analytics</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Bookings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Réservations Récentes</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Tout voir</Text>
                        </TouchableOpacity>
                    </View>

                    {recentBookings.map((booking) => (
                        <View key={booking.id} style={styles.bookingCard}>
                            <View style={styles.bookingInfo}>
                                <Text style={styles.bookingClient}>{booking.client}</Text>
                                <Text style={styles.bookingService}>{booking.service}</Text>
                                <Text style={styles.bookingDate}>{booking.date}</Text>
                            </View>

                            {booking.status === 'PENDING' && (
                                <View style={styles.bookingActions}>
                                    <TouchableOpacity style={styles.acceptButton}>
                                        <Ionicons name="checkmark" size={20} color={COLORS.white} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.rejectButton}>
                                        <Ionicons name="close" size={20} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {booking.status === 'CONFIRMED' && (
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>Confirmée</Text>
                                </View>
                            )}

                            {booking.status === 'COMPLETED' && (
                                <View style={[styles.statusBadge, styles.completedBadge]}>
                                    <Text style={[styles.statusText, styles.completedText]}>Terminée</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.lg,
    },
    welcomeSection: {
        marginBottom: SPACING.lg,
    },
    welcomeText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
    },
    welcomeName: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    statCard: {
        width: '47%',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    primaryCard: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    warningCard: {
        backgroundColor: COLORS.warning + '10',
        borderColor: COLORS.warning + '30',
    },
    statValue: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: SPACING.sm,
    },
    statValueDark: {
        color: COLORS.primary,
    },
    statValueWarning: {
        color: COLORS.warning,
    },
    statLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.white,
        opacity: 0.9,
        marginTop: SPACING.xs,
    },
    statLabelDark: {
        color: COLORS.textLight,
        opacity: 1,
    },
    statLabelWarning: {
        color: COLORS.warning,
        opacity: 0.8,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    seeAllText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    actionButton: {
        width: '47%',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text,
        marginTop: SPACING.sm,
        fontWeight: '500',
    },
    bookingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bookingInfo: {
        flex: 1,
    },
    bookingClient: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    bookingService: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    bookingDate: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
    },
    bookingActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    acceptButton: {
        backgroundColor: COLORS.success,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectButton: {
        backgroundColor: COLORS.error,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: COLORS.success + '20',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        borderRadius: 8,
    },
    completedBadge: {
        backgroundColor: COLORS.textLight + '20',
    },
    statusText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.success,
        fontWeight: '600',
    },
    completedText: {
        color: COLORS.textLight,
    },
});
