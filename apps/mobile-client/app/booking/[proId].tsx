import { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api, Colors, Spacing, BorderRadius, Shadows } from '../src/shared/src';

export default function BookingScreen() {
    const { proId, proName } = useLocalSearchParams<{ proId: string; proName: string }>();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00',
        '14:00', '15:00', '16:00', '17:00', '18:00',
    ];

    const handleBook = async () => {
        if (!selectedTime) {
            Alert.alert('Erreur', 'Veuillez sélectionner un horaire');
            return;
        }

        setLoading(true);
        try {
            await api.createReservation({
                proId,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
                duration: 60,
                price: 50,
            });

            Alert.alert(
                'Réservation confirmée !',
                `Votre rendez-vous est confirmé pour le ${selectedDate.toLocaleDateString('fr-FR')} à ${selectedTime}`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/reservations'),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de créer la réservation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Réserver</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.proName}>{proName}</Text>

                {/* Date Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date</Text>
                    <View style={styles.dateCard}>
                        <Ionicons name="calendar-outline" size={24} color={Colors.accent} />
                        <Text style={styles.dateText}>
                            {selectedDate.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            })}
                        </Text>
                    </View>
                </View>

                {/* Time Slots */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Horaire</Text>
                    <View style={styles.timeGrid}>
                        {timeSlots.map((time) => (
                            <TouchableOpacity
                                key={time}
                                style={[
                                    styles.timeSlot,
                                    selectedTime === time && styles.timeSlotSelected,
                                ]}
                                onPress={() => setSelectedTime(time)}
                            >
                                <Text
                                    style={[
                                        styles.timeText,
                                        selectedTime === time && styles.timeTextSelected,
                                    ]}
                                >
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Durée</Text>
                        <Text style={styles.summaryValue}>1 heure</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Prix</Text>
                        <Text style={styles.summaryValue}>50€</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Book Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.bookButton, (!selectedTime || loading) && styles.bookButtonDisabled]}
                    onPress={handleBook}
                    disabled={!selectedTime || loading}
                >
                    <Text style={styles.bookButtonText}>
                        {loading ? 'Réservation...' : 'Confirmer la réservation'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    proName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xl,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    dateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.lg,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.md,
    },
    dateText: {
        fontSize: 16,
        color: Colors.text,
        textTransform: 'capitalize',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    timeSlot: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.gray[300],
        minWidth: 80,
        alignItems: 'center',
    },
    timeSlotSelected: {
        backgroundColor: Colors.accent,
        borderColor: Colors.accent,
    },
    timeText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text,
    },
    timeTextSelected: {
        color: Colors.white,
    },
    summary: {
        padding: Spacing.lg,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.md,
        gap: Spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 15,
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
    },
    bookButton: {
        backgroundColor: Colors.accent,
        height: 56,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    bookButtonDisabled: {
        opacity: 0.5,
    },
    bookButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.white,
    },
});
