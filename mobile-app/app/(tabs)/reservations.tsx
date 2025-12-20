import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Reservation } from '../../types';
import { Colors, Spacing, FontSizes } from '../../constants';

const STATUS_CONFIG = {
    PENDING: { label: 'En attente', color: Colors.warning, icon: 'time' as const },
    CONFIRMED: { label: 'Confirmé', color: Colors.success, icon: 'checkmark-circle' as const },
    COMPLETED: { label: 'Terminé', color: Colors.gray.medium, icon: 'checkbox' as const },
    CANCELLED: { label: 'Annulé', color: Colors.error, icon: 'close-circle' as const },
};

export default function ReservationsScreen() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        setIsLoading(true);
        const result = await api.getMyReservations();
        if (result.success && result.data) {
            setReservations(result.data);
        }
        setIsLoading(false);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadReservations();
        setIsRefreshing(false);
    };

    const handleCancel = (reservationId: string) => {
        Alert.alert(
            'Annuler la réservation',
            'Êtes-vous sûr de vouloir annuler cette réservation ?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui, annuler',
                    style: 'destructive',
                    onPress: async () => {
                        // TODO: API call to cancel
                        Alert.alert('Info', 'Fonctionnalité bientôt disponible');
                    },
                },
            ]
        );
    };

    const handleContact = (proName: string) => {
        Alert.alert('Contacter', `Contacter ${proName}`, [
            { text: 'Appeler', onPress: () => Alert.alert('Info', 'Fonctionnalité bientôt disponible') },
            { text: 'Message', onPress: () => Alert.alert('Info', 'Fonctionnalité bientôt disponible') },
            { text: 'Annuler', style: 'cancel' },
        ]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderReservation = ({ item }: { item: Reservation }) => {
        const config = STATUS_CONFIG[item.status];

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.proName}>{item.pro.user.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
                        <Ionicons name={config.icon} size={14} color={config.color} />
                        <Text style={[styles.statusText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={16} color={Colors.gray.medium} />
                        <Text style={styles.infoText}>{item.pro.city.name}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={16} color={Colors.gray.medium} />
                        <Text style={styles.infoText}>
                            {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="cash" size={16} color={Colors.gray.medium} />
                        <Text style={styles.infoText}>{item.totalPrice}€</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    {item.status === 'PENDING' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => handleCancel(item.id)}
                        >
                            <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                                Annuler
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.contactButton]}
                        onPress={() => handleContact(item.pro.user.name)}
                    >
                        <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
                        <Text style={[styles.actionButtonText, styles.contactButtonText]}>
                            Contacter
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={reservations}
                renderItem={renderReservation}
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
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color={Colors.gray.medium} />
                        <Text style={styles.emptyText}>Aucune réservation</Text>
                        <Text style={styles.emptySubtext}>
                            Parcourez les professionnels et réservez vos services
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.light,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: Spacing.md,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    proName: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.secondary,
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 8,
    },
    statusText: {
        fontSize: FontSizes.xs,
        fontWeight: 'bold',
        marginLeft: Spacing.xs,
    },
    cardContent: {
        gap: Spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
        marginLeft: Spacing.sm,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.sm,
        borderRadius: 8,
        gap: Spacing.xs,
    },
    cancelButton: {
        backgroundColor: Colors.error + '20',
    },
    contactButton: {
        backgroundColor: Colors.primary + '20',
    },
    actionButtonText: {
        fontWeight: 'bold',
        fontSize: FontSizes.sm,
    },
    cancelButtonText: {
        color: Colors.error,
    },
    contactButtonText: {
        color: Colors.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: Spacing.xxl,
        marginTop: Spacing.xxl,
    },
    emptyText: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.gray.dark,
        marginTop: Spacing.md,
    },
    emptySubtext: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
});
