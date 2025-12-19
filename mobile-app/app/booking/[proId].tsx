import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { ProProfile } from '../../types';
import { Colors, Spacing, FontSizes } from '../../constants';

export default function BookingScreen() {
    const router = useRouter();
    const { proId } = useLocalSearchParams();
    const [pro, setPro] = useState<ProProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [serviceType, setServiceType] = useState('');

    useEffect(() => {
        loadPro();
    }, []);

    const loadPro = async () => {
        setIsLoading(true);
        const result = await api.getProById(proId as string);
        if (result.success && result.data) {
            setPro(result.data);
        }
        setIsLoading(false);
    };

    const handleSubmit = async () => {
        if (!startDate || !endDate || !serviceType) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs');
            return;
        }

        setIsBooking(true);
        const result = await api.createReservation({
            proId: proId as string,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            serviceType,
        });

        setIsBooking(false);

        if (result.success) {
            Alert.alert(
                'Réservation créée !',
                'Votre demande a été envoyée au professionnel',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/reservations') }]
            );
        } else {
            Alert.alert('Erreur', result.error || 'Impossible de créer la réservation');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!pro) {
        return null;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouvelle réservation</Text>
            </View>

            <View style={styles.proCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{pro.user.name?.[0] || 'P'}</Text>
                </View>
                <View>
                    <Text style={styles.proName}>{pro.user.name}</Text>
                    <Text style={styles.proCity}>{pro.city.name}</Text>
                </View>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Service *</Text>
                <View style={styles.servicesContainer}>
                    {pro.services && pro.services.length > 0 ? (
                        pro.services.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                style={[
                                    styles.serviceChip,
                                    serviceType === service.name && styles.serviceChipSelected,
                                ]}
                                onPress={() => setServiceType(service.name)}
                            >
                                <Text
                                    style={[
                                        styles.serviceChipText,
                                        serviceType === service.name && styles.serviceChipTextSelected,
                                    ]}
                                >
                                    {service.name}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.noServices}>Aucun service défini</Text>
                    )}
                </View>

                <Text style={styles.label}>Date de début *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={startDate}
                    onChangeText={setStartDate}
                />

                <Text style={styles.label}>Date de fin *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={endDate}
                    onChangeText={setEndDate}
                />

                <View style={styles.summary}>
                    <Text style={styles.summaryTitle}>Résumé</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tarif horaire :</Text>
                        <Text style={styles.summaryValue}>{pro.hourlyRate}₪/h</Text>
                    </View>
                    {pro.user.phoneNumber && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Contact :</Text>
                            <Text style={styles.summaryValue}>{pro.user.phoneNumber}</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isBooking && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isBooking}
                >
                    {isBooking ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                            <Text style={styles.submitButtonText}>Confirmer la réservation</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: Colors.primary,
        padding: Spacing.xl,
        paddingTop: 60,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: Spacing.md,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.white,
    },
    proCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.gray.light,
        marginHorizontal: Spacing.lg,
        marginTop: -30,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
    },
    proName: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    proCity: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
    },
    form: {
        padding: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.secondary,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.gray.medium,
        borderRadius: 10,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        backgroundColor: Colors.white,
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    serviceChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: Colors.white,
    },
    serviceChipSelected: {
        backgroundColor: Colors.primary,
    },
    serviceChipText: {
        fontSize: FontSizes.md,
        color: Colors.primary,
        fontWeight: '600',
    },
    serviceChipTextSelected: {
        color: Colors.white,
    },
    noServices: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        fontStyle: 'italic',
    },
    summary: {
        marginTop: Spacing.xl,
        padding: Spacing.lg,
        backgroundColor: Colors.gray.light,
        borderRadius: 12,
    },
    summaryTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.md,
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
        fontWeight: '600',
        color: Colors.secondary,
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        marginTop: Spacing.xl,
        padding: Spacing.lg,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
        marginLeft: Spacing.sm,
    },
});
