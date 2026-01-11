import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants';
import LottieView from 'lottie-react-native';

export default function BookingSuccessScreen() {
    const { proName, date, time, duration, price } = useLocalSearchParams();
    const router = useRouter();
    const animationRef = useRef<LottieView>(null);

    useEffect(() => {
        animationRef.current?.play();
    }, []);

    return (
        <View style={styles.container}>
            {/* Success Animation */}
            <View style={styles.animationContainer}>
                <LottieView
                    ref={animationRef}
                    source={require('../assets/animations/success.json')}
                    style={styles.animation}
                    loop={false}
                    autoPlay
                />
            </View>

            {/* Title */}
            <Text style={styles.title}>Réservation confirmée !</Text>
            <Text style={styles.subtitle}>Votre rendez-vous a été enregistré</Text>

            {/* Details Card */}
            <View style={styles.card}>
                <View style={styles.row}>
                    <Ionicons name="person-outline" size={24} color={Colors.primary} />
                    <View style={styles.rowContent}>
                        <Text style={styles.label}>Professionnel</Text>
                        <Text style={styles.value}>{proName}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
                    <View style={styles.rowContent}>
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>{date}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Ionicons name="time-outline" size={24} color={Colors.primary} />
                    <View style={styles.rowContent}>
                        <Text style={styles.label}>Heure</Text>
                        <Text style={styles.value}>{time} ({duration}h)</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Ionicons name="wallet-outline" size={24} color={Colors.accent} />
                    <View style={styles.rowContent}>
                        <Text style={styles.label}>Montant</Text>
                        <Text style={styles.priceValue}>{price}₪</Text>
                    </View>
                </View>
            </View>

            {/* Status */}
            <View style={styles.statusBadge}>
                <Ionicons name="hourglass-outline" size={18} color={Colors.warning} />
                <Text style={styles.statusText}>En attente de confirmation du pro</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                        console.log('Navigating to reservations');
                        router.push('/reservations');
                    }}
                >
                    <Text style={styles.primaryButtonText}>Voir mes réservations</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                        console.log('Navigating to home');
                        router.push('/');
                    }}
                >
                    <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: Spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animationContainer: {
        width: 200,
        height: 200,
        marginBottom: Spacing.lg,
    },
    animation: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        marginBottom: Spacing.xl,
        textAlign: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: Colors.gray.lightest,
        borderRadius: 16,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    rowContent: {
        flex: 1,
    },
    label: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    value: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.primary,
    },
    priceValue: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.accent,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray.light,
        marginVertical: Spacing.md,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.warning + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        marginBottom: Spacing.xl,
    },
    statusText: {
        fontSize: FontSizes.sm,
        color: Colors.warning,
        fontWeight: '600',
    },
    buttons: {
        width: '100%',
        gap: Spacing.md,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: Spacing.md,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: Colors.gray.medium,
        fontSize: FontSizes.md,
        fontWeight: '500',
    },
});
