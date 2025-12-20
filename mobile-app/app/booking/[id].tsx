import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Colors, Spacing, FontSizes } from '../../constants';

export default function BookingScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [pro, setPro] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        loadPro();
    }, [id]);

    const loadPro = async () => {
        const result = await api.getProById(id as string);
        if (result.success && result.data) {
            setPro(result.data);
            setTotalPrice(result.data.hourlyRate || 50);
        }
        setIsLoading(false);
    };

    const handleBook = async () => {
        if (!startDate || !endDate) {
            Alert.alert('Erreur', 'Veuillez sélectionner des dates');
            return;
        }

        setIsBooking(true);
        const result = await api.createReservation({
            proId: id as string,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            totalPrice,
        });

        setIsBooking(false);

        if (result.success) {
            Alert.alert(
                'Succès !',
                'Votre réservation a été envoyée. Le professionnel va la confirmer.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/(tabs)/reservations'),
                    },
                ]
            );
        } else {
            Alert.alert('Erreur', result.error || 'Impossible de créer la réservation');
        }
    };

    // Date helpers
    const getToday = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    useEffect(() => {
        // Set default dates
        setStartDate(getToday());
        setEndDate(getTomorrow());
    }, []);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!pro) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Professionnel non trouvé</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Réserver</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Pro Info */}
                <View style={styles.proCard}>
                    <Text style={styles.proName}>{pro.user?.name}</Text>
                    <Text style={styles.proCity}>{pro.city?.name}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Tarif horaire :</Text>
                        <Text style={styles.priceValue}>{pro.hourlyRate}₪/h</Text>
                    </View>
                </View>

                {/* Date Selection (Simplified) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dates</Text>

                    <View style={styles.dateCard}>
                        <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                        <Text style={styles.dateText}>
                            Du {new Date(startDate).toLocaleDateString('fr-FR')} au{' '}
                            {new Date(endDate).toLocaleDateString('fr-FR')}
                        </Text>
                    </View>

                    <Text style={styles.helpText}>
                        💡 Les dates seront confirmées avec le professionnel
                    </Text>
                </View>

                {/* Price Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Résumé</Text>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Professionnel</Text>
                            <Text style={styles.summaryValue}>{pro.user?.name}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tarif estimé</Text>
                            <Text style={styles.summaryValue}>{totalPrice}₪</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{totalPrice}₪</Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.noteCard}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                    <Text style={styles.noteText}>
                        Votre demande sera envoyée au professionnel qui la confirmera dans les 24h.
                    </Text>
                </View>
            </ScrollView>

            {/* Book Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.bookButton, isBooking && styles.bookButtonDisabled]}
                    onPress={handleBook}
                    disabled={isBooking}
                >
                    {isBooking ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                            <Text style={styles.bookButtonText}>Confirmer la réservation</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        paddingTop: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    proCard: {
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderRadius: 12,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    proName: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.xs,
    },
    proCity: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        marginBottom: Spacing.md,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary + '10',
        padding: Spacing.sm,
        borderRadius: 8,
    },
    priceLabel: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
    },
    priceValue: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.md,
    },
    dateCard: {
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    dateText: {
        fontSize: FontSizes.md,
        color: Colors.secondary,
        flex: 1,
    },
    helpText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        fontStyle: 'italic',
    },
    summaryCard: {
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderRadius: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    summaryLabel: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
    },
    summaryValue: {
        fontSize: FontSizes.md,
        color: Colors.secondary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray.light,
        marginVertical: Spacing.md,
    },
    totalLabel: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    totalValue: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    noteCard: {
        backgroundColor: Colors.primary + '10',
        padding: Spacing.md,
        borderRadius: 12,
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    noteText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
        flex: 1,
    },
    footer: {
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray.light,
    },
    bookButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    bookButtonDisabled: {
        backgroundColor: Colors.gray.medium,
    },
    bookButtonText: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
    },
    errorText: {
        fontSize: FontSizes.lg,
        color: Colors.error,
    },
});
