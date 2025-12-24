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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { calendarService } from '../../services/calendar';
import { Reservation } from '../../types';
import { Colors, Spacing, FontSizes } from '../../constants';

const STATUS_CONFIG = {
    PENDING: { label: 'En attente', color: '#F59E0B', icon: 'time-outline' as const },
    CONFIRMED: { label: 'Confirmé', color: '#10B981', icon: 'checkmark-circle-outline' as const },
    COMPLETED: { label: 'Terminé', color: '#6B7280', icon: 'checkbox-outline' as const },
    CANCELLED: { label: 'Annulé', color: '#EF4444', icon: 'close-circle-outline' as const },
};

export default function ReservationsScreen() {
    const router = useRouter();
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
                        const result = await api.cancelReservation(reservationId);
                        if (result.success) {
                            Alert.alert('Succès', 'Réservation annulée');
                            loadReservations();
                        } else {
                            Alert.alert('Erreur', result.error || 'Impossible d\'annuler');
                        }
                    },
                },
            ]
        );
    };

    const handleContact = (proUserId: string | null, proName: string) => {
        if (!proUserId) {
            Alert.alert('Erreur', 'Professionnel non trouvé');
            return;
        }
        router.push(`/chat/${proUserId}?name=${encodeURIComponent(proName)}`);
    };

    const handleAddToCalendar = async (reservation: any) => {
        await calendarService.addToCalendar({
            proName: reservation.pro?.user?.name || 'Professionnel',
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            location: reservation.pro?.city?.name,
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderReservation = ({ item }: { item: Reservation }) => {
        const config = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.proInfo}>
                        <View style={styles.proAvatar}>
                            <Text style={styles.proAvatarText}>{item.pro.user.name?.[0]}</Text>
                        </View>
                        <View>
                            <Text style={styles.proName}>{item.pro.user.name}</Text>
                            <Text style={styles.serviceName}>{(item as any).serviceName || 'Service personnalisé'}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                        <Text style={[styles.statusText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardContent}>
                    <View style={styles.dateTimeRow}>
                        <View style={styles.infoBlock}>
                            <Ionicons name="calendar-outline" size={16} color={Colors.gray.medium} />
                            <Text style={styles.infoValue}>{formatDate(item.startDate)}</Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Ionicons name="time-outline" size={16} color={Colors.gray.medium} />
                            <Text style={styles.infoValue}>{formatTime(item.startDate)}</Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Ionicons name="cash-outline" size={16} color={Colors.gray.medium} />
                            <Text style={styles.infoValue}>{(item as any).totalPrice}₪</Text>
                        </View>
                    </View>

                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={16} color={Colors.primary} />
                        <Text style={styles.locationText}>{item.pro.city.name}, Israël</Text>
                    </View>
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.contactBtn]}
                        onPress={() => handleContact((item.pro.user as any).id || '', item.pro.user.name)}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
                        <Text style={styles.contactBtnText}>Message</Text>
                    </TouchableOpacity>

                    {item.status === 'PENDING' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn]}
                            onPress={() => handleCancel(item.id)}
                        >
                            <Text style={styles.cancelBtnText}>Annuler</Text>
                        </TouchableOpacity>
                    )}

                    {(item.status === 'CONFIRMED' || item.status === 'PENDING') && (
                        <TouchableOpacity
                            style={styles.calendarBtn}
                            onPress={() => handleAddToCalendar(item)}
                        >
                            <Ionicons name="calendar-outline" size={20} color={Colors.gray.medium} />
                        </TouchableOpacity>
                    )}
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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes Réservations</Text>
                <Text style={styles.headerSub}>Gérez vos rendez-vous à venir</Text>
            </View>

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
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="calendar-outline" size={40} color={Colors.gray.light} />
                        </View>
                        <Text style={styles.emptyText}>Aucun rendez-vous</Text>
                        <Text style={styles.emptySubtext}>
                            Commencez par explorer nos professionnels passionnés.
                        </Text>
                        <TouchableOpacity
                            style={styles.exploreBtn}
                            onPress={() => router.push('/')}
                        >
                            <Text style={styles.exploreBtnText}>Explorer</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: Colors.white,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    headerSub: {
        fontSize: 14,
        color: Colors.gray.medium,
        marginTop: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 15,
    },
    proInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    proAvatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    proAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    proName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    serviceName: {
        fontSize: 12,
        color: Colors.gray.medium,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginHorizontal: 15,
    },
    cardContent: {
        padding: 15,
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.secondary,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 13,
        color: Colors.gray.medium,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FCFCFC',
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    contactBtn: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    contactBtnText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    cancelBtn: {
        backgroundColor: '#FFF1F1',
    },
    cancelBtnText: {
        color: '#EF4444',
        fontWeight: 'bold',
        fontSize: 14,
    },
    calendarBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.gray.medium,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    exploreBtn: {
        marginTop: 25,
        backgroundColor: Colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 12,
    },
    exploreBtnText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
