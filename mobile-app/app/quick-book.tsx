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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Colors, Spacing, FontSizes } from '../constants';

// Dates disponibles pour les 7 prochains jours
const getNextDays = () => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNames = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];

    const days = [];
    for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        days.push({
            date: date.toISOString().split('T')[0],
            dayName: dayNames[date.getDay()],
            dayNum: date.getDate(),
            month: monthNames[date.getMonth()],
        });
    }
    return days;
};

// Créneaux horaires
const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
];

// Durées
const DURATIONS = [
    { value: 1, label: '1h' },
    { value: 2, label: '2h' },
    { value: 3, label: '3h' },
    { value: 4, label: '4h' },
];

export default function QuickBookScreen() {
    const { id, name, rate, serviceId, serviceName, servicePrice, serviceDuration } = useLocalSearchParams();
    const router = useRouter();

    const [step, setStep] = useState(1); // 1: Date, 2: Heure, 3: Prestation, 4: Confirmation
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedService, setSelectedService] = useState<{ id: string; name: string; price: number; duration: number } | null>(
        serviceId ? { id: serviceId as string, name: serviceName as string, price: Number(servicePrice), duration: Number(serviceDuration) } : null
    );
    const [proServices, setProServices] = useState<{ id: string; name: string; description: string | null; price: number; duration: number }[]>([]);
    const [selectedDuration, setSelectedDuration] = useState(serviceDuration ? Number(serviceDuration) / 60 : 1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingServices, setIsLoadingServices] = useState(false);

    useEffect(() => {
        if (!serviceId && id) {
            loadProServices();
        }
    }, [id, serviceId]);

    const loadProServices = async () => {
        setIsLoadingServices(true);
        try {
            const result = await api.getProById(id as string);
            if (result.success && result.data?.services) {
                setProServices(result.data.services);
            }
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setIsLoadingServices(false);
        }
    };

    const days = getNextDays();
    const hourlyRate = Number(rate) || 100;
    const finalPrice = selectedService ? selectedService.price : (hourlyRate * selectedDuration);
    // const finalDuration = selectedService ? selectedService.duration / 60 : selectedDuration;

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Erreur', 'Veuillez sélectionner une date et une heure');
            return;
        }

        if (!selectedService && !serviceId) {
            Alert.alert('Erreur', 'Veuillez sélectionner une prestation');
            return;
        }

        setIsLoading(true);

        try {
            // Create proper ISO dates
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(hours, minutes, 0, 0);

            const endDateTime = new Date(startDateTime);
            const durationInMinutes = selectedService ? selectedService.duration : (selectedDuration * 60);
            endDateTime.setMinutes(endDateTime.getMinutes() + durationInMinutes);

            const result = await api.createReservation({
                proId: id as string,
                serviceId: selectedService?.id || undefined,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                totalPrice: finalPrice,
            });

            setIsLoading(false);

            if (result.success && result.data) {
                router.replace({
                    pathname: '/booking-success',
                    params: {
                        proName: name as string,
                        serviceName: (selectedService?.name || serviceName as string) || 'Prestation',
                        date: selectedDate,
                        time: selectedTime,
                        duration: String(selectedService ? selectedService.duration : (selectedDuration * 60)),
                        price: String(finalPrice),
                    },
                });
            } else {
                Alert.alert('Erreur', result.error || 'Impossible de réserver');
            }
        } catch (error) {
            setIsLoading(false);
            Alert.alert('Erreur', 'Une erreur est survenue');
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>1. Choisissez une date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
                {days.map((day) => (
                    <TouchableOpacity
                        key={day.date}
                        activeOpacity={0.7}
                        style={[
                            styles.dateCard,
                            selectedDate === day.date && styles.dateCardSelected,
                        ]}
                        onPress={() => {
                            setSelectedDate(day.date);
                            setStep(2);
                        }}
                    >
                        <Text style={[styles.dayName, selectedDate === day.date && styles.textSelected]}>
                            {day.dayName}
                        </Text>
                        <Text style={[styles.dayNum, selectedDate === day.date && styles.textSelected]}>
                            {day.dayNum}
                        </Text>
                        <Text style={[styles.month, selectedDate === day.date && styles.textSelected]}>
                            {day.month}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>2. Choisissez l'heure</Text>
            <View style={styles.timeSlotsGrid}>
                {TIME_SLOTS.map((time) => (
                    <TouchableOpacity
                        key={time}
                        activeOpacity={0.7}
                        style={[
                            styles.timeCard,
                            selectedTime === time && styles.timeCardSelected,
                        ]}
                        onPress={() => {
                            setSelectedTime(time);
                            if (serviceId) {
                                setStep(4);
                            } else {
                                setStep(3);
                            }
                        }}
                    >
                        <Text style={[styles.timeText, selectedTime === time && styles.textSelected]}>
                            {time}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStepServices = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>3. Choisissez une prestation</Text>
            {isLoadingServices ? (
                <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <View style={styles.servicesGrid}>
                    {proServices.length > 0 ? (
                        proServices.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                activeOpacity={0.7}
                                style={[
                                    styles.serviceSelectCard,
                                    selectedService?.id === service.id && styles.serviceSelectCardActive,
                                ]}
                                onPress={() => {
                                    setSelectedService(service);
                                    setStep(4);
                                }}
                            >
                                <View style={styles.serviceInfoRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.serviceSelectTitle, selectedService?.id === service.id && styles.textSelected]}>
                                            {service.name}
                                        </Text>
                                        <Text style={[styles.serviceSelectDuration, selectedService?.id === service.id && styles.textSelected]}>
                                            {service.duration} min
                                        </Text>
                                    </View>
                                    <Text style={[styles.serviceSelectPrice, selectedService?.id === service.id && styles.textSelected]}>
                                        {service.price}₪
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={[styles.serviceSelectCard]}
                            onPress={() => setStep(4)}
                        >
                            <Text style={styles.serviceSelectTitle}>Tarif horaire de base</Text>
                            <Text style={styles.serviceSelectPrice}>{hourlyRate}₪/h</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>4. Confirmez la réservation</Text>

            {/* Durée - Only show if not a specific service */}
            {!selectedService && !serviceId && (
                <>
                    <Text style={styles.sectionLabel}>Durée de l'intervention</Text>
                    <View style={styles.durationRow}>
                        {DURATIONS.map((d) => (
                            <TouchableOpacity
                                key={d.value}
                                activeOpacity={0.7}
                                style={[
                                    styles.durationCard,
                                    selectedDuration === d.value && styles.durationCardSelected,
                                ]}
                                onPress={() => setSelectedDuration(d.value)}
                            >
                                <Text style={[styles.durationText, selectedDuration === d.value && styles.textSelected]}>
                                    {d.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* Récapitulatif */}
            <View style={[styles.summaryCard]}>
                <View style={styles.summaryRow}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                    <Text style={styles.summaryText}>{selectedDate}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Ionicons name="time-outline" size={20} color={Colors.primary} />
                    <Text style={styles.summaryText}>
                        {selectedTime} • {selectedService ? `${selectedService.duration} min` : `${selectedDuration}h`}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Ionicons name="cut-outline" size={20} color={Colors.primary} />
                    <Text style={styles.summaryText}>{selectedService?.name || serviceName || 'Prestation'}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Ionicons name="person-outline" size={20} color={Colors.primary} />
                    <Text style={styles.summaryText}>{name}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Total à régler</Text>
                    <Text style={styles.priceValue}>{finalPrice}₪</Text>
                </View>
            </View>

            {/* Bouton confirmer */}
            <TouchableOpacity
                style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
                onPress={handleConfirm}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.confirmButtonText}>✨ Confirmer la réservation</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Réservation rapide</Text>
                <View style={styles.backButton} />
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
                {[1, 2, 3, 4].map((s) => (
                    <View key={s} style={styles.progressStep}>
                        <View style={[styles.progressDot, step >= s && styles.progressDotActive]} />
                        {s < 4 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
                    </View>
                ))}
            </View>

            {/* Content */}
            <ScrollView style={styles.content}>
                {step >= 1 && renderStep1()}
                {step >= 2 && renderStep2()}
                {step >= 3 && !serviceId && renderStepServices()}
                {step >= 4 && renderStep4()}
            </ScrollView>
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
        paddingHorizontal: Spacing.md,
        paddingTop: 50,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.primary,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    progressStep: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.gray.light,
    },
    progressDotActive: {
        backgroundColor: Colors.accent,
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: Colors.gray.light,
        marginHorizontal: Spacing.xs,
    },
    progressLineActive: {
        backgroundColor: Colors.accent,
    },
    content: {
        flex: 1,
    },
    stepContainer: {
        padding: Spacing.lg,
    },
    stepTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: Spacing.lg,
    },
    datesScroll: {
        flexDirection: 'row',
    },
    dateCard: {
        width: 70,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: 12,
        backgroundColor: Colors.gray.lightest,
        marginRight: Spacing.sm,
        alignItems: 'center',
    },
    dateCardSelected: {
        backgroundColor: Colors.primary,
    },
    dayName: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        textTransform: 'capitalize',
    },
    dayNum: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.primary,
        marginVertical: Spacing.xs,
    },
    month: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    textSelected: {
        color: Colors.white,
    },
    timeSlotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    timeCard: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: 12,
        backgroundColor: Colors.gray.lightest,
    },
    timeCardSelected: {
        backgroundColor: Colors.primary,
    },
    timeText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    servicesGrid: {
        gap: Spacing.md,
    },
    serviceSelectCard: {
        backgroundColor: Colors.gray.lightest,
        padding: Spacing.lg,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    serviceSelectCardActive: {
        borderColor: Colors.accent,
        backgroundColor: Colors.accent,
    },
    serviceInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceSelectTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.primary,
    },
    serviceSelectDuration: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: 2,
    },
    serviceSelectPrice: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
    },
    sectionLabel: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.gray.dark,
        marginBottom: Spacing.sm,
    },
    durationRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    durationCard: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: 12,
        backgroundColor: Colors.gray.lightest,
        alignItems: 'center',
    },
    durationCardSelected: {
        backgroundColor: Colors.primary,
    },
    durationText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    summaryCard: {
        backgroundColor: Colors.gray.lightest,
        borderRadius: 16,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    summaryText: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray.light,
        marginVertical: Spacing.md,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: FontSizes.lg,
        color: Colors.gray.dark,
    },
    priceValue: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.primary,
    },
    confirmButton: {
        backgroundColor: Colors.accent,
        borderRadius: 12,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        opacity: 0.5,
    },
    confirmButtonText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.white,
    },
});
