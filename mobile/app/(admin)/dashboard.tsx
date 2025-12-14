import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export default function AdminDashboard() {
    const { user } = useAuth();

    const stats = {
        revenue: 12450,
        users: 156,
        pros: 24,
        reservations: 89,
    };

    const recentActivity = [
        { id: 1, type: 'user', text: 'Nouvel utilisateur inscrit', time: '5 min' },
        { id: 2, type: 'reservation', text: 'Nouvelle réservation', time: '12 min' },
        { id: 3, type: 'pro', text: 'Nouveau professionnel', time: '1h' },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Welcome */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Tableau de Bord</Text>
                    <Text style={styles.welcomeName}>Administration</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, styles.primaryCard]}>
                        <Ionicons name="cash-outline" size={32} color={COLORS.white} />
                        <Text style={styles.statValue}>{stats.revenue}€</Text>
                        <Text style={styles.statLabel}>Revenu Total</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="people-outline" size={28} color={COLORS.primary} />
                        <Text style={[styles.statValue, styles.statValueDark]}>{stats.users}</Text>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Utilisateurs</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="briefcase-outline" size={28} color={COLORS.secondary} />
                        <Text style={[styles.statValue, styles.statValueSecondary]}>{stats.pros}</Text>
                        <Text style={[styles.statLabel, styles.statLabelSecondary]}>Professionnels</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="calendar-outline" size={28} color={COLORS.primary} />
                        <Text style={[styles.statValue, styles.statValueDark]}>{stats.reservations}</Text>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Réservations</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gestion</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="people" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Utilisateurs</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="briefcase" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Professionnels</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="calendar" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Réservations</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="pricetag" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Catégories</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Analytics</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="settings" size={24} color={COLORS.primary} />
                            <Text style={styles.actionText}>Paramètres</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Activité Récente</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Tout voir</Text>
                        </TouchableOpacity>
                    </View>

                    {recentActivity.map((activity) => (
                        <View key={activity.id} style={styles.activityCard}>
                            <View style={styles.activityIcon}>
                                <Ionicons
                                    name={
                                        activity.type === 'user' ? 'person-add' :
                                            activity.type === 'reservation' ? 'calendar' :
                                                'briefcase'
                                    }
                                    size={20}
                                    color={COLORS.primary}
                                />
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityText}>{activity.text}</Text>
                                <Text style={styles.activityTime}>Il y a {activity.time}</Text>
                            </View>
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
    statValue: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: SPACING.sm,
    },
    statValueDark: {
        color: COLORS.primary,
    },
    statValueSecondary: {
        color: COLORS.secondary,
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
    statLabelSecondary: {
        color: COLORS.secondary,
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
        width: '30%',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text,
        marginTop: SPACING.sm,
        fontWeight: '500',
        textAlign: 'center',
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    activityInfo: {
        flex: 1,
    },
    activityText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        marginBottom: 2,
    },
    activityTime: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
    },
});
