import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Colors, Spacing, FontSizes } from '../constants';

interface Service {
    id: string;
    name: string;
    customPrice: number;
    duration: number;
}

export default function AddReservationScreen() {
    const router = useRouter();
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        const result = await api.getProServicesList();
        if (result.success && result.data) {
            setServices(result.data);
        }
        setIsLoadingServices(false);
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour <= 20; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
    };

    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const formatDate = (date: Date) => {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return `${days[date.getDay()]} ${date.getDate()}`;
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const handleSubmit = async () => {
        if (!clientName.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer le nom du client');
            return;
        }
        if (!clientEmail.trim() || !clientEmail.includes('@')) {
            Alert.alert('Erreur', 'Veuillez entrer un email valide');
            return;
        }

        setIsLoading(true);

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const startDate = new Date(selectedDate);
        startDate.setHours(hours, minutes, 0, 0);

        const duration = selectedService?.duration || 60;
        const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

        const result = await api.createManualReservation({
            clientName: clientName.trim(),
            clientEmail: clientEmail.trim(),
            clientPhone: clientPhone.trim() || undefined,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            serviceId: selectedService?.id,
            totalPrice: selectedService?.customPrice || 0,
        });

        setIsLoading(false);

        if (result.success) {
            Alert.alert('Succès', 'Réservation créée avec succès !', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Erreur', result.error || 'Impossible de créer la réservation');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Nouvelle Réservation</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Client Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👤 Informations Client</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nom du client"
                        value={clientName}
                        onChangeText={setClientName}
                        placeholderTextColor={Colors.gray.medium}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email du client"
                        value={clientEmail}
                        onChangeText={setClientEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={Colors.gray.medium}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Téléphone (optionnel)"
                        value={clientPhone}
                        onChangeText={setClientPhone}
                        keyboardType="phone-pad"
                        placeholderTextColor={Colors.gray.medium}
                    />
                </View>

                {/* Date Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.dateRow}>
                            {generateDates().map((date, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dateBtn,
                                        isSameDay(date, selectedDate) && styles.dateBtnActive
                                    ]}
                                    onPress={() => setSelectedDate(date)}
                                >
                                    <Text style={[
                                        styles.dateBtnText,
                                        isSameDay(date, selectedDate) && styles.dateBtnTextActive
                                    ]}>
                                        {formatDate(date)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Time Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🕐 Heure</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.timeRow}>
                            {generateTimeSlots().map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.timeBtn,
                                        time === selectedTime && styles.timeBtnActive
                                    ]}
                                    onPress={() => setSelectedTime(time)}
                                >
                                    <Text style={[
                                        styles.timeBtnText,
                                        time === selectedTime && styles.timeBtnTextActive
                                    ]}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Service Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💼 Service</Text>
                    {isLoadingServices ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    ) : services.length === 0 ? (
                        <Text style={styles.noServices}>Aucun service configuré</Text>
                    ) : (
                        <View style={styles.servicesGrid}>
                            {services.map((service) => (
                                <TouchableOpacity
                                    key={service.id}
                                    style={[
                                        styles.serviceBtn,
                                        selectedService?.id === service.id && styles.serviceBtnActive
                                    ]}
                                    onPress={() => setSelectedService(
                                        selectedService?.id === service.id ? null : service
                                    )}
                                >
                                    <Text style={[
                                        styles.serviceName,
                                        selectedService?.id === service.id && styles.serviceNameActive
                                    ]}>
                                        {service.name}
                                    </Text>
                                    <Text style={[
                                        styles.servicePrice,
                                        selectedService?.id === service.id && styles.servicePriceActive
                                    ]}>
                                        {service.customPrice}₪ • {service.duration}min
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Summary */}
                {selectedService && (
                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>Récapitulatif</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Service</Text>
                            <Text style={styles.summaryValue}>{selectedService.name}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Date</Text>
                            <Text style={styles.summaryValue}>
                                {selectedDate.toLocaleDateString('fr-FR')} à {selectedTime}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Prix</Text>
                            <Text style={styles.summaryPrice}>{selectedService.customPrice}₪</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                            <Text style={styles.submitBtnText}>Créer la réservation</Text>
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
        backgroundColor: Colors.gray.lightest,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: Colors.white,
        marginTop: Spacing.md,
        marginHorizontal: Spacing.md,
        borderRadius: 16,
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    input: {
        backgroundColor: Colors.gray.lightest,
        borderRadius: 12,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        marginBottom: Spacing.sm,
        color: Colors.primary,
    },
    dateRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    dateBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 12,
        backgroundColor: Colors.gray.lightest,
    },
    dateBtnActive: {
        backgroundColor: Colors.primary,
    },
    dateBtnText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
        fontWeight: '600',
    },
    dateBtnTextActive: {
        color: Colors.white,
    },
    timeRow: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    timeBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
        backgroundColor: Colors.gray.lightest,
    },
    timeBtnActive: {
        backgroundColor: Colors.accent,
    },
    timeBtnText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
    },
    timeBtnTextActive: {
        color: Colors.white,
        fontWeight: '600',
    },
    servicesGrid: {
        gap: Spacing.sm,
    },
    serviceBtn: {
        padding: Spacing.md,
        borderRadius: 12,
        backgroundColor: Colors.gray.lightest,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    serviceBtnActive: {
        backgroundColor: Colors.primary + '10',
        borderColor: Colors.primary,
    },
    serviceName: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.gray.dark,
    },
    serviceNameActive: {
        color: Colors.primary,
    },
    servicePrice: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
    servicePriceActive: {
        color: Colors.primary,
    },
    noServices: {
        textAlign: 'center',
        color: Colors.gray.medium,
        paddingVertical: Spacing.lg,
    },
    summary: {
        backgroundColor: Colors.primary + '10',
        marginTop: Spacing.md,
        marginHorizontal: Spacing.md,
        borderRadius: 16,
        padding: Spacing.md,
    },
    summaryTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    summaryLabel: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    summaryValue: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.primary,
    },
    summaryPrice: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.accent,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        padding: Spacing.md,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: Colors.gray.light,
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.success,
        padding: Spacing.md,
        borderRadius: 16,
    },
    submitBtnDisabled: {
        backgroundColor: Colors.gray.medium,
    },
    submitBtnText: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.white,
    },
});
