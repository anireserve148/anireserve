import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api, Colors, Spacing, BorderRadius, Shadows, type Reservation } from '../src/shared/src';

export default function ReservationsScreen() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadReservations = async () => {
        try {
            const response = await api.getReservations();
            setReservations(response.data || []);
        } catch (error) {
            console.error('Failed to load reservations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadReservations();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return Colors.success;
            case 'PENDING':
                return Colors.warning;
            case 'CANCELLED':
                return Colors.error;
            default:
                return Colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'Confirmée';
            case 'PENDING':
                return 'En attente';
            case 'CANCELLED':
                return 'Annulée';
            case 'COMPLETED':
                return 'Terminée';
            default:
                return status;
        }
    };

    const renderReservation = ({ item }: { item: Reservation }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.proName}>{item.pro?.user?.name}</Text>
                    <Text style={styles.city}>{item.pro?.city?.name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>
                        {new Date(item.startDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>
                        {new Date(item.startDate).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{item.totalPrice}€</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mes réservations</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={reservations}
                renderItem={renderReservation}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => {
                        setRefreshing(true);
                        loadReservations();
                    }} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color={Colors.gray[300]} />
                            <Text style={styles.emptyText}>Aucune réservation</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    list: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    proName: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    city: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        gap: Spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: Spacing.xxl * 2,
        gap: Spacing.md,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
});
