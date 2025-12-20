import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants';

interface DaySchedule {
    day: string;
    dayName: string;
    isOpen: boolean;
    start: string;
    end: string;
    break?: { start: string; end: string };
}

const DAYS: DaySchedule[] = [
    { day: 'SUN', dayName: 'Dimanche', isOpen: true, start: '09:00', end: '18:00' },
    { day: 'MON', dayName: 'Lundi', isOpen: true, start: '09:00', end: '18:00' },
    { day: 'TUE', dayName: 'Mardi', isOpen: true, start: '09:00', end: '18:00' },
    { day: 'WED', dayName: 'Mercredi', isOpen: true, start: '09:00', end: '18:00' },
    { day: 'THU', dayName: 'Jeudi', isOpen: true, start: '09:00', end: '18:00' },
    { day: 'FRI', dayName: 'Vendredi', isOpen: false, start: '09:00', end: '14:00' },
    { day: 'SAT', dayName: 'Samedi', isOpen: false, start: '', end: '' },
];

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default function ProScheduleScreen() {
    const router = useRouter();
    const [schedule, setSchedule] = useState<DaySchedule[]>(DAYS);
    const [editingDay, setEditingDay] = useState<string | null>(null);

    const toggleDay = (day: string) => {
        setSchedule(prev => prev.map(d =>
            d.day === day ? { ...d, isOpen: !d.isOpen } : d
        ));
    };

    const updateTime = (day: string, field: 'start' | 'end', value: string) => {
        setSchedule(prev => prev.map(d =>
            d.day === day ? { ...d, [field]: value } : d
        ));
    };

    const handleSave = () => {
        if (typeof window !== 'undefined') {
            window.alert('✅ Horaires sauvegardés !');
        }
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Mes Horaires</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Sauver</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Info */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={24} color={Colors.accent} />
                    <Text style={styles.infoText}>
                        Définissez vos horaires d'ouverture. Les clients ne pourront réserver que pendant ces créneaux.
                    </Text>
                </View>

                {/* Schedule */}
                {schedule.map((day) => (
                    <View key={day.day} style={[styles.dayCard, !day.isOpen && styles.dayCardClosed]}>
                        <View style={styles.dayHeader}>
                            <View style={styles.dayInfo}>
                                <Text style={[styles.dayName, !day.isOpen && styles.textClosed]}>
                                    {day.dayName}
                                </Text>
                                {day.isOpen && (
                                    <Text style={styles.dayHours}>{day.start} - {day.end}</Text>
                                )}
                                {!day.isOpen && (
                                    <Text style={styles.closedText}>Fermé</Text>
                                )}
                            </View>
                            <Switch
                                value={day.isOpen}
                                onValueChange={() => toggleDay(day.day)}
                                trackColor={{ false: Colors.gray.light, true: Colors.success }}
                            />
                        </View>

                        {day.isOpen && (
                            <View style={styles.timeSelection}>
                                <View style={styles.timeGroup}>
                                    <Text style={styles.timeLabel}>Début</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.timeOptions}>
                                            {HOURS.slice(0, 8).map((hour) => (
                                                <TouchableOpacity
                                                    key={hour}
                                                    style={[
                                                        styles.timeBtn,
                                                        day.start === hour && styles.timeBtnActive
                                                    ]}
                                                    onPress={() => updateTime(day.day, 'start', hour)}
                                                >
                                                    <Text style={[
                                                        styles.timeBtnText,
                                                        day.start === hour && styles.timeBtnTextActive
                                                    ]}>
                                                        {hour}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>

                                <View style={styles.timeGroup}>
                                    <Text style={styles.timeLabel}>Fin</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.timeOptions}>
                                            {HOURS.slice(5).map((hour) => (
                                                <TouchableOpacity
                                                    key={hour}
                                                    style={[
                                                        styles.timeBtn,
                                                        day.end === hour && styles.timeBtnActive
                                                    ]}
                                                    onPress={() => updateTime(day.day, 'end', hour)}
                                                >
                                                    <Text style={[
                                                        styles.timeBtnText,
                                                        day.end === hour && styles.timeBtnTextActive
                                                    ]}>
                                                        {hour}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        )}
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
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
    saveBtn: {
        backgroundColor: Colors.success,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
    },
    saveBtnText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accent + '10',
        margin: Spacing.md,
        padding: Spacing.md,
        borderRadius: 12,
    },
    infoText: {
        flex: 1,
        fontSize: FontSizes.sm,
        color: Colors.accent,
    },
    dayCard: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        borderRadius: 16,
        padding: Spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: Colors.success,
    },
    dayCardClosed: {
        borderLeftColor: Colors.gray.light,
        opacity: 0.7,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dayInfo: {
        flex: 1,
    },
    dayName: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
    },
    textClosed: {
        color: Colors.gray.medium,
    },
    dayHours: {
        fontSize: FontSizes.sm,
        color: Colors.success,
        marginTop: Spacing.xs,
    },
    closedText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
    timeSelection: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.gray.light,
    },
    timeGroup: {
        marginBottom: Spacing.md,
    },
    timeLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.gray.dark,
        marginBottom: Spacing.sm,
    },
    timeOptions: {
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
        backgroundColor: Colors.primary,
    },
    timeBtnText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
    },
    timeBtnTextActive: {
        color: Colors.white,
        fontWeight: '600',
    },
});
