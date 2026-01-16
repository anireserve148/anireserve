import { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api, Colors, Spacing, BorderRadius, Shadows } from '@anireserve/shared';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function CalendarScreen() {
    const [availability, setAvailability] = useState<any>({
        monday: [{ start: '09:00', end: '18:00' }],
        tuesday: [{ start: '09:00', end: '18:00' }],
        wednesday: [{ start: '09:00', end: '18:00' }],
        thursday: [{ start: '09:00', end: '18:00' }],
        friday: [{ start: '09:00', end: '18:00' }],
    });

    const handleSave = async () => {
        try {
            await api.updateAvailability(availability);
            Alert.alert('Succès', 'Disponibilités mises à jour');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de mettre à jour');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Disponibilités</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveButton}>Enregistrer</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.description}>
                    Définissez vos horaires de travail pour chaque jour de la semaine
                </Text>

                {DAYS.map((day, index) => {
                    const dayKey = day.toLowerCase();
                    const isActive = availability[dayKey];

                    return (
                        <View key={day} style={styles.dayCard}>
                            <View style={styles.dayHeader}>
                                <Text style={styles.dayName}>{day}</Text>
                                <TouchableOpacity
                                    style={[styles.toggle, isActive && styles.toggleActive]}
                                    onPress={() => {
                                        setAvailability((prev: any) => ({
                                            ...prev,
                                            [dayKey]: isActive ? null : [{ start: '09:00', end: '18:00' }],
                                        }));
                                    }}
                                >
                                    <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>
                                        {isActive ? 'Actif' : 'Fermé'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {isActive && (
                                <View style={styles.timeSlots}>
                                    {availability[dayKey]?.map((slot: any, idx: number) => (
                                        <View key={idx} style={styles.timeSlot}>
                                            <Text style={styles.timeLabel}>De</Text>
                                            <Text style={styles.timeValue}>{slot.start}</Text>
                                            <Text style={styles.timeLabel}>à</Text>
                                            <Text style={styles.timeValue}>{slot.end}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        backgroundColor: Colors.proPrimary,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.white,
    },
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.proAccent,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
        lineHeight: 20,
    },
    dayCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    toggle: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray[200],
    },
    toggleActive: {
        backgroundColor: Colors.success,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    toggleTextActive: {
        color: Colors.white,
    },
    timeSlots: {
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    timeSlot: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    timeLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    time Value: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.proPrimary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.sm,
    },
});
