import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export default function BookingsScreen() {
    const bookings = [
        { id: 1, pro: 'Jean Dupont', service: 'Toilettage', date: '15 Dec 2024', status: 'PENDING' },
        { id: 2, pro: 'Marie Martin', service: 'Promenade', date: '10 Dec 2024', status: 'CONFIRMED' },
        { id: 3, pro: 'Paul Bernard', service: 'Dressage', date: '5 Dec 2024', status: 'COMPLETED' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return COLORS.warning;
            case 'CONFIRMED': return COLORS.success;
            case 'COMPLETED': return COLORS.textLight;
            default: return COLORS.error;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'CONFIRMED': return 'Confirmée';
            case 'COMPLETED': return 'Terminée';
            default: return 'Annulée';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes Réservations</Text>
            </View>

            <ScrollView style={styles.content}>
                {bookings.map((booking) => (
                    <TouchableOpacity key={booking.id} style={styles.bookingCard}>
                        <View style={styles.bookingHeader}>
                            <Text style={styles.bookingPro}>{booking.pro}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                                    {getStatusText(booking.status)}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.bookingService}>{booking.service}</Text>

                        <View style={styles.bookingFooter}>
                            <View style={styles.bookingDate}>
                                <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
                                <Text style={styles.bookingDateText}>{booking.date}</Text>
                            </View>

                            <TouchableOpacity style={styles.detailsButton}>
                                <Text style={styles.detailsButtonText}>Détails</Text>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.white,
        paddingTop: 60,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    bookingCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    bookingPro: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
    },
    bookingService: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
        marginBottom: SPACING.md,
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookingDate: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bookingDateText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailsButtonText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
