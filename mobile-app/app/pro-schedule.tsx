import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Platform,
    Image,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Colors, Spacing, FontSizes } from '../constants';

interface DaySchedule {
    day: string;
    dayName: string;
    isOpen: boolean;
    start: string;
    end: string;
    hasBreak: boolean;
    breakStart: string;
    breakEnd: string;
}

const DAYS: DaySchedule[] = [
    { day: 'SUN', dayName: 'Dimanche', isOpen: true, start: '09:00', end: '18:00', hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'MON', dayName: 'Lundi', isOpen: true, start: '09:00', end: '18:00', hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'TUE', dayName: 'Mardi', isOpen: true, start: '09:00', end: '18:00', hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'WED', dayName: 'Mercredi', isOpen: true, start: '09:00', end: '18:00', hasBreak: true, breakStart: '12:00', breakEnd: '14:00' },
    { day: 'THU', dayName: 'Jeudi', isOpen: true, start: '09:00', end: '18:00', hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'FRI', dayName: 'Vendredi', isOpen: true, start: '09:00', end: '14:00', hasBreak: false, breakStart: '', breakEnd: '' },
    { day: 'SAT', dayName: 'Samedi', isOpen: false, start: '', end: '', hasBreak: false, breakStart: '', breakEnd: '' },
];

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const BREAK_HOURS = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'];

export default function ProScheduleScreen() {
    const router = useRouter();
    const [schedule, setSchedule] = useState<DaySchedule[]>(DAYS);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        loadAvailability();
    }, []);

    const loadAvailability = async () => {
        setIsLoading(true);
        const result = await api.getProAvailability();
        if (result.success && result.data) {
            const apiSlots = result.data;
            // Map API slots back to DAYS structure
            const newSchedule = DAYS.map(d => {
                const dayIndex = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].indexOf(d.day);
                const slot = apiSlots.find((s: any) => s.dayOfWeek === dayIndex);
                if (slot) {
                    return {
                        ...d,
                        isOpen: slot.isAvailable,
                        start: slot.startTime,
                        end: slot.endTime,
                        hasBreak: false // Breaks are not stored separately in current schema
                    };
                }
                return d;
            });
            setSchedule(newSchedule);
        } else {
            Alert.alert('Erreur', 'Impossible de charger vos horaires');
        }
        setIsLoading(false);
    };

    const toggleDay = (day: string) => {
        setSchedule(prev => prev.map(d =>
            d.day === day ? { ...d, isOpen: !d.isOpen } : d
        ));
    };

    const toggleBreak = (day: string) => {
        setSchedule(prev => prev.map(d =>
            d.day === day ? { ...d, hasBreak: !d.hasBreak } : d
        ));
    };

    const updateTime = (day: string, field: 'start' | 'end' | 'breakStart' | 'breakEnd', value: string) => {
        setSchedule(prev => prev.map(d =>
            d.day === day ? { ...d, [field]: value } : d
        ));
    };

    const handleSave = async () => {
        const slots = schedule.map(d => ({
            dayOfWeek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].indexOf(d.day),
            isAvailable: d.isOpen,
            startTime: d.start || '09:00',
            endTime: d.end || '18:00'
        }));

        const result = await api.updateProAvailability(slots);
        if (result.success) {
            Alert.alert('Succès', 'Horaires sauvegardés ! ✅');
            router.back();
        } else {
            Alert.alert('Erreur', 'Impossible de sauvegarder les horaires');
        }
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
                        Définissez vos horaires et pauses. Les clients ne pourront pas réserver pendant vos pauses.
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
                                    <Text style={styles.dayHours}>
                                        {day.start} - {day.end}
                                        {day.hasBreak && ` (pause: ${day.breakStart}-${day.breakEnd})`}
                                    </Text>
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
                                {/* Working Hours */}
                                <View style={styles.timeGroup}>
                                    <Text style={styles.timeLabel}>🕐 Début de journée</Text>
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
                                    <Text style={styles.timeLabel}>🕐 Fin de journée</Text>
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

                                {/* Break Toggle */}
                                <View style={styles.breakSection}>
                                    <View style={styles.breakHeader}>
                                        <Ionicons name="cafe-outline" size={20} color={Colors.warning} />
                                        <Text style={styles.breakTitle}>Pause déjeuner</Text>
                                        <Switch
                                            value={day.hasBreak}
                                            onValueChange={() => toggleBreak(day.day)}
                                            trackColor={{ false: Colors.gray.light, true: Colors.warning }}
                                        />
                                    </View>

                                    {day.hasBreak && (
                                        <View style={styles.breakTimes}>
                                            <View style={styles.breakTimeGroup}>
                                                <Text style={styles.breakLabel}>Début pause</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                    <View style={styles.timeOptions}>
                                                        {BREAK_HOURS.map((hour) => (
                                                            <TouchableOpacity
                                                                key={hour}
                                                                style={[
                                                                    styles.breakBtn,
                                                                    day.breakStart === hour && styles.breakBtnActive
                                                                ]}
                                                                onPress={() => updateTime(day.day, 'breakStart', hour)}
                                                            >
                                                                <Text style={[
                                                                    styles.breakBtnText,
                                                                    day.breakStart === hour && styles.breakBtnTextActive
                                                                ]}>
                                                                    {hour}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                </ScrollView>
                                            </View>

                                            <View style={styles.breakTimeGroup}>
                                                <Text style={styles.breakLabel}>Fin pause</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                    <View style={styles.timeOptions}>
                                                        {BREAK_HOURS.map((hour) => (
                                                            <TouchableOpacity
                                                                key={hour}
                                                                style={[
                                                                    styles.breakBtn,
                                                                    day.breakEnd === hour && styles.breakBtnActive
                                                                ]}
                                                                onPress={() => updateTime(day.day, 'breakEnd', hour)}
                                                            >
                                                                <Text style={[
                                                                    styles.breakBtnText,
                                                                    day.breakEnd === hour && styles.breakBtnTextActive
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
    breakSection: {
        backgroundColor: Colors.warning + '10',
        borderRadius: 12,
        padding: Spacing.md,
        marginTop: Spacing.sm,
    },
    breakHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    breakTitle: {
        flex: 1,
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.warning,
    },
    breakTimes: {
        marginTop: Spacing.md,
    },
    breakTimeGroup: {
        marginBottom: Spacing.sm,
    },
    breakLabel: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginBottom: Spacing.xs,
    },
    breakBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.warning,
    },
    breakBtnActive: {
        backgroundColor: Colors.warning,
    },
    breakBtnText: {
        fontSize: FontSizes.sm,
        color: Colors.warning,
    },
    breakBtnTextActive: {
        color: Colors.white,
        fontWeight: '600',
    },
});
