import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api, Colors, Spacing, BorderRadius, Shadows } from '@anireserve/shared';

export default function DashboardScreen() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboard = async () => {
        try {
            const response = await api.getProDashboard();
            setStats(response.data || {
                todayReservations: 0,
                monthRevenue: 0,
                totalClients: 0,
                averageRating: 0,
            });
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadDashboard();
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Bonjour 👋</Text>
                    <Text style={styles.title}>Tableau de bord</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/settings')}>
                    <Ionicons name="settings-outline" size={28} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Stats Cards */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, styles.statCardPrimary]}>
                        <Ionicons name="calendar-outline" size={24} color={Colors.white} />
                        <Text style={styles.statValue}>{stats?.todayReservations || 0}</Text>
                        <Text style={styles.statLabel}>RDV aujourd'hui</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="cash-outline" size={24} color={Colors.proPrimary} />
                        <Text style={styles.statValueDark}>{stats?.monthRevenue || 0}€</Text>
                        <Text style={styles.statLabelDark}>Revenu mensuel</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="people-outline" size={24} color={Colors.proPrimary} />
                        <Text style={styles.statValueDark}>{stats?.totalClients || 0}</Text>
                        <Text style={styles.statLabelDark}>Clients totaux</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="star-outline" size={24} color={Colors.proPrimary} />
                        <Text style={styles.statValueDark}>
                            {(stats?.averageRating || 0).toFixed(1)}
                        </Text>
                        <Text style={styles.statLabelDark}>Note moyenne</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions rapides</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/calendar')}
                        >
                            <Ionicons name="calendar" size={32} color={Colors.proPrimary} />
                            <Text style={styles.actionText}>Calendrier</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/reservations')}
                        >
                            <Ionicons name="list" size={32} color={Colors.proPrimary} />
                            <Text style={styles.actionText}>Réservations</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/clients')}
                        >
                            <Ionicons name="people" size={32} color={Colors.proPrimary} />
                            <Text style={styles.actionText}>Clients</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/analytics')}
                        >
                            <Ionicons name="stats-chart" size={32} color={Colors.proPrimary} />
                            <Text style={styles.actionText}>Analytics</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        backgroundColor: Colors.proPrimary,
        paddingTop: 60,
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: Spacing.xs,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.white,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        ...Shadows.md,
    },
    statCardPrimary: {
        backgroundColor: Colors.proAccent,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.white,
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    statLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
    statValueDark: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.proPrimary,
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    statLabelDark: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    actionButton: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        gap: Spacing.sm,
        ...Shadows.sm,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
});
