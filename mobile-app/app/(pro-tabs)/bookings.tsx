import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../constants';

interface Booking {
    id: string;
    clientName: string;
    clientImage?: string;
    date: string;
    time: string;
    duration: number;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    price: number;
    notes?: string;
}

const MOCK_BOOKINGS: Booking[] = [
    { id: '1', clientName: 'David Cohen', date: '2025-12-24', time: '10:00', duration: 2, status: 'PENDING', price: 240 },
    { id: '2', clientName: 'Marie Levy', date: '2025-12-24', time: '14:00', duration: 1, status: 'PENDING', price: 120 },
    { id: '3', clientName: 'Sarah Ben', date: '2025-12-23', time: '09:00', duration: 2, status: 'CONFIRMED', price: 240 },
    { id: '4', clientName: 'Michel Azoulay', date: '2025-12-22', time: '15:00', duration: 3, status: 'COMPLETED', price: 360 },
    { id: '5', clientName: 'Rachel Cohen', date: '2025-12-21', time: '11:00', duration: 1, status: 'CANCELLED', price: 120 },
];

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
    const [filter, setFilter] = useState<string>('all');
    const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const handleAccept = (id: string) => {
        console.log('Accept:', id);
    };

    const handleReject = (id: string) => {
        console.log('Reject:', id);
    };

    const handleComplete = (id: string) => {
        console.log('Complete:', id);
    };

    const renderBooking = ({ item }: { item: Booking }) => (
        <View style={[
            styles.bookingCard,
            { borderLeftColor: STATUS_COLORS[item.status] }
        ]}>
            <View style={styles.bookingHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.clientName[0]}</Text>
                </View>
                <View style={styles.bookingInfo}>
                    <Text style={styles.clientName}>{item.clientName}</Text>
                    <View style={styles.dateLine}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.gray.medium} />
                        <Text style={styles.dateText}>{item.date}</Text>
                        <Ionicons name="time-outline" size={14} color={Colors.gray.medium} />
                        <Text style={styles.dateText}>{item.time} ({item.duration}h)</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                        {STATUS_LABELS[item.status]}
                    </Text>
                </View>
            </View>

            <View style={styles.bookingFooter}>
                <Text style={styles.price}>{item.price}₪</Text>

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

    return (
        <View style={styles.container}>
            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
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

            {/* Bookings List */}
            <FlatList
                data={filteredBookings}
                renderItem={renderBooking}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color={Colors.gray.light} />
                        <Text style={styles.emptyText}>Aucune réservation</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.lightest,
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
});
