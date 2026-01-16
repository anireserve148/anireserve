import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api, Colors, Spacing, BorderRadius, Shadows, type Reservation } from '@anireserve/shared';

export default function ProReservationsScreen() {
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

    const handleAccept = async (id: string) => {
        try {
            await api.updateReservation(id, { status: 'CONFIRMED' });
            Alert.alert('Succès', 'Réservation confirmée');
            loadReservations();
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de confirmer');
        }
    };

    const handleReject = async (id: string) => {
        Alert.alert(
            'Refuser la réservation',
            'Êtes-vous sûr de vouloir refuser cette réservation ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Refuser',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.updateReservation(id, { status: 'CANCELLED' });
                            loadReservations();
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de refuser');
                        }
                    },
                },
            ]
        );
    };

    const renderReservation = ({ item }: { item: Reservation }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.clientName}>{item.client?.name || 'Client'}</Text>
                    <Text style={styles.date}>
                        {new Date(item.startDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </Text>
                </View>
                <Text style={styles.price}>{item.totalPrice}€</Text>
            </View>

            <View style={styles.timeInfo}>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.timeText}>
                    {new Date(item.startDate).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(item.endDate).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>

            {item.status === 'PENDING' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAccept(item.id)}
                    >
                        <Ionicons name="checkmark" size={20} color={Colors.white} />
                        <Text style={styles.acceptText}>Accepter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(item.id)}
                    >
                        <Ionicons name="close" size={20} color={Colors.error} />
                        <Text style={styles.rejectText}>Refuser</Text>
                    </TouchableOpacity>
                </View>
            )}

            {item.status !== 'PENDING' && (
                <View style={[styles.statusBadge, { alignSelf: 'flex-start' }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Réservations</Text>
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
        backgroundColor: Colors.proPrimary,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.white,
    },
    list: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    clientName: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: Colors.textSecondary,
        textTransform: 'capitalize',
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.proPrimary,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    timeText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    acceptButton: {
        backgroundColor: Colors.success,
    },
    acceptText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.white,
    },
    rejectButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.error,
    },
    rejectText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.error,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        backgroundColor: Colors.gray[200],
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
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
