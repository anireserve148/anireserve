import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../constants';
import { api } from '../../services/api';

interface Booking {
    id: string;
    client: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
    startDate: string;
    endDate: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    totalPrice: number;
    service?: {
        name: string;
        duration: number;
    };
}

const STATUS_COLORS = {
    PENDING: Colors.warning,
    CONFIRMED: Colors.accent,
    COMPLETED: Colors.success,
    CANCELLED: Colors.error,
};

const STATUS_LABELS = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé',
};

export default function ProBookingsScreen() {
    const router = useRouter();
    const [filter, setFilter] = useState<string>('all');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadBookings = async () => {
        const result = await api.getProReservations();
        if (result.success && result.data) {
            setBookings(result.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadBookings();
    }, []);

    // Reload when screen is focused (after adding a new reservation)
    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [])
    );

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadBookings();
        setIsRefreshing(false);
    };

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const handleAccept = async (id: string) => {
        const result = await api.updateReservationStatus(id, 'CONFIRMED');
        if (result.success) {
            Alert.alert('Succès', 'Réservation confirmée');
            loadBookings();
        } else {
            Alert.alert('Erreur', 'Impossible de confirmer la réservation');
        }
    };

    const handleReject = async (id: string) => {
        Alert.alert(
            'Annuler la réservation',
            'Êtes-vous sûr de vouloir annuler cette réservation ?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui, annuler',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await api.updateReservationStatus(id, 'CANCELLED');
                        if (result.success) {
                            Alert.alert('Réservation annulée');
                            loadBookings();
                        } else {
                            Alert.alert('Erreur', 'Impossible d\'annuler la réservation');
                        }
                    },
                },
            ]
        );
    };

    const handleComplete = async (id: string) => {
        const result = await api.updateReservationStatus(id, 'COMPLETED');
        if (result.success) {
            Alert.alert('Succès', 'Réservation terminée');
            loadBookings();
        } else {
            Alert.alert('Erreur', 'Impossible de terminer la réservation');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const renderBooking = ({ item }: { item: Booking }) => (
        <View style={[
            styles.bookingCard,
            { borderLeftColor: STATUS_COLORS[item.status] }
        ]}>
            <View style={styles.bookingHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.client?.name?.[0] || 'C'}
                    </Text>
                </View>
                <View style={styles.bookingInfo}>
                    <Text style={styles.clientName}>
                        {item.client?.name || 'Client'}
                    </Text>
                    <View style={styles.dateLine}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.gray.medium} />
                        <Text style={styles.dateText}>{formatDate(item.startDate)}</Text>
                        <Ionicons name="time-outline" size={14} color={Colors.gray.medium} />
                        <Text style={styles.dateText}>
                            {formatTime(item.startDate)} - {formatTime(item.endDate)}
                        </Text>
                    </View>
                    {item.service && (
                        <Text style={styles.serviceName}>{item.service.name}</Text>
                    )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                        {STATUS_LABELS[item.status]}
                    </Text>
                </View>
            </View>

            <View style={styles.bookingFooter}>
                <Text style={styles.price}>{item.totalPrice}₪</Text>

                {item.status === 'PENDING' && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.acceptBtn]}
                            onPress={() => handleAccept(item.id)}
                        >
                            <Ionicons name="checkmark" size={18} color={Colors.white} />
                            <Text style={styles.actionBtnText}>Accepter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => handleReject(item.id)}
                        >
                            <Ionicons name="close" size={18} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                )}

                {item.status === 'CONFIRMED' && (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.completeBtn]}
                        onPress={() => handleComplete(item.id)}
                    >
                        <Ionicons name="checkmark-done" size={18} color={Colors.white} />
                        <Text style={styles.actionBtnText}>Terminer</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Agenda button */}
            <View style={styles.headerBar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                    style={styles.filterScroll}
                >
                    {[
                        { key: 'all', label: 'Tout' },
                        { key: 'PENDING', label: 'En attente' },
                        { key: 'CONFIRMED', label: 'Confirmé' },
                        { key: 'COMPLETED', label: 'Terminé' },
                        { key: 'CANCELLED', label: 'Annulé' },
                    ].map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                            onPress={() => setFilter(f.key)}
                        >
                            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Agenda Button */}
                <TouchableOpacity
                    style={styles.agendaBtn}
                    onPress={() => router.push('/pro-agenda')}
                >
                    <Ionicons name="today" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Bookings List */}
            <FlatList
                data={filteredBookings}
                renderItem={renderBooking}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color={Colors.gray.light} />
                        <Text style={styles.emptyText}>Aucune réservation</Text>
                        <TouchableOpacity
                            style={styles.emptyBtn}
                            onPress={() => router.push('/add-reservation')}
                        >
                            <Text style={styles.emptyBtnText}>Créer une réservation</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* FAB - Add Reservation */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/add-reservation')}
            >
                <Ionicons name="add" size={32} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.lightest,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        backgroundColor: Colors.white,
        maxHeight: 60,
    },
    filterContent: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    filterBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        backgroundColor: Colors.gray.lightest,
        marginRight: Spacing.sm,
    },
    filterBtnActive: {
        backgroundColor: Colors.primary,
    },
    filterText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.gray.dark,
    },
    filterTextActive: {
        color: Colors.white,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    bookingCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        color: Colors.white,
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    bookingInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.xs,
    },
    dateLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    dateText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    serviceName: {
        fontSize: FontSizes.xs,
        color: Colors.accent,
        marginTop: Spacing.xs,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 12,
    },
    statusText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
    },
    bookingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: Colors.gray.light,
        paddingTop: Spacing.md,
    },
    price: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.accent,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
    },
    actionBtnText: {
        color: Colors.white,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    acceptBtn: {
        backgroundColor: Colors.success,
    },
    rejectBtn: {
        backgroundColor: Colors.error,
    },
    completeBtn: {
        backgroundColor: Colors.accent,
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        marginTop: Spacing.md,
    },
    emptyBtn: {
        marginTop: Spacing.lg,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: 12,
    },
    emptyBtnText: {
        color: Colors.white,
        fontWeight: '600',
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingRight: Spacing.md,
    },
    filterScroll: {
        flex: 1,
    },
    agendaBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
