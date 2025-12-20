import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants';

interface CalendarEvent {
    id: string;
    clientName: string;
    startTime: string;
    endTime: string;
    status: 'CONFIRMED' | 'PENDING';
    price: number;
}

interface DayData {
    date: string;
    dayNum: number;
    dayName: string;
    events: CalendarEvent[];
    isToday: boolean;
}

// Generate mock data for the week
const generateWeekData = (): DayData[] => {
    const days: DayData[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const events: CalendarEvent[] = [];

        // Add some mock events
        if (i === 0) {
            events.push(
                { id: '1', clientName: 'Sarah Ben', startTime: '09:00', endTime: '10:00', status: 'CONFIRMED', price: 120 },
                { id: '2', clientName: 'Michel Azoulay', startTime: '11:00', endTime: '12:30', status: 'CONFIRMED', price: 180 },
                { id: '3', clientName: 'David Cohen', startTime: '15:00', endTime: '16:00', status: 'PENDING', price: 120 },
            );
        } else if (i === 1) {
            events.push(
                { id: '4', clientName: 'Marie Levy', startTime: '10:00', endTime: '11:30', status: 'CONFIRMED', price: 180 },
            );
        } else if (i === 3) {
            events.push(
                { id: '5', clientName: 'Rachel Cohen', startTime: '14:00', endTime: '15:00', status: 'PENDING', price: 120 },
                { id: '6', clientName: 'Pierre Martin', startTime: '16:00', endTime: '17:30', status: 'CONFIRMED', price: 180 },
            );
        }

        days.push({
            date: date.toISOString().split('T')[0],
            dayNum: date.getDate(),
            dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            events,
            isToday: i === 0,
        });
    }

    return days;
};

export default function ProAgendaScreen() {
    const router = useRouter();
    const [view, setView] = useState<'day' | 'week' | 'month'>('week');
    const [weekData] = useState<DayData[]>(generateWeekData());
    const [selectedDay, setSelectedDay] = useState<string>(weekData[0].date);

    const selectedDayData = weekData.find(d => d.date === selectedDay);

    const renderEvent = (event: CalendarEvent) => (
        <TouchableOpacity
            key={event.id}
            style={[
                styles.eventCard,
                { borderLeftColor: event.status === 'CONFIRMED' ? Colors.success : Colors.warning }
            ]}
        >
            <View style={styles.eventTime}>
                <Text style={styles.eventTimeText}>{event.startTime}</Text>
                <Text style={styles.eventTimeSep}>-</Text>
                <Text style={styles.eventTimeText}>{event.endTime}</Text>
            </View>
            <View style={styles.eventInfo}>
                <Text style={styles.eventClient}>{event.clientName}</Text>
                <View style={styles.eventMeta}>
                    <Text style={styles.eventPrice}>{event.price}₪</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: event.status === 'CONFIRMED' ? Colors.success + '20' : Colors.warning + '20' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: event.status === 'CONFIRMED' ? Colors.success : Colors.warning }
                        ]}>
                            {event.status === 'CONFIRMED' ? 'Confirmé' : 'En attente'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Agenda</Text>
                <View style={styles.viewToggle}>
                    {['day', 'week', 'month'].map((v) => (
                        <TouchableOpacity
                            key={v}
                            style={[styles.viewBtn, view === v && styles.viewBtnActive]}
                            onPress={() => setView(v as any)}
                        >
                            <Text style={[styles.viewBtnText, view === v && styles.viewBtnTextActive]}>
                                {v === 'day' ? 'J' : v === 'week' ? 'S' : 'M'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Week Days */}
            <View style={styles.weekBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekContent}>
                    {weekData.map((day) => (
                        <TouchableOpacity
                            key={day.date}
                            style={[
                                styles.dayBtn,
                                selectedDay === day.date && styles.dayBtnSelected,
                                day.isToday && styles.dayBtnToday
                            ]}
                            onPress={() => setSelectedDay(day.date)}
                        >
                            <Text style={[
                                styles.dayBtnName,
                                selectedDay === day.date && styles.dayBtnTextSelected
                            ]}>
                                {day.dayName}
                            </Text>
                            <Text style={[
                                styles.dayBtnNum,
                                selectedDay === day.date && styles.dayBtnTextSelected
                            ]}>
                                {day.dayNum}
                            </Text>
                            {day.events.length > 0 && (
                                <View style={styles.eventDot} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Day Content */}
            <ScrollView style={styles.content}>
                {/* Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{selectedDayData?.events.length || 0}</Text>
                        <Text style={styles.summaryLabel}>RDV</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                            {selectedDayData?.events.reduce((sum, e) => sum + e.price, 0) || 0}₪
                        </Text>
                        <Text style={styles.summaryLabel}>Revenus</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                            {selectedDayData?.events.filter(e => e.status === 'PENDING').length || 0}
                        </Text>
                        <Text style={styles.summaryLabel}>En attente</Text>
                    </View>
                </View>

                {/* Events */}
                <View style={styles.eventsSection}>
                    <Text style={styles.sectionTitle}>
                        {selectedDayData?.isToday ? "Aujourd'hui" : selectedDay}
                    </Text>

                    {(!selectedDayData?.events || selectedDayData.events.length === 0) ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color={Colors.gray.light} />
                            <Text style={styles.emptyText}>Aucun rendez-vous</Text>
                        </View>
                    ) : (
                        selectedDayData.events.map(renderEvent)
                    )}
                </View>

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
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        paddingTop: 50,
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
        color: Colors.white,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        padding: 2,
    },
    viewBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 6,
    },
    viewBtnActive: {
        backgroundColor: Colors.white,
    },
    viewBtnText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.white,
    },
    viewBtnTextActive: {
        color: Colors.primary,
    },
    weekBar: {
        backgroundColor: Colors.white,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    weekContent: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    dayBtn: {
        alignItems: 'center',
        padding: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: 12,
        minWidth: 56,
    },
    dayBtnSelected: {
        backgroundColor: Colors.primary,
    },
    dayBtnToday: {
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    dayBtnName: {
        fontSize: FontSizes.xs,
        color: Colors.gray.medium,
        textTransform: 'capitalize',
    },
    dayBtnNum: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
        marginTop: 2,
    },
    dayBtnTextSelected: {
        color: Colors.white,
    },
    eventDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.accent,
        marginTop: 4,
    },
    content: {
        flex: 1,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        margin: Spacing.md,
        borderRadius: 16,
        padding: Spacing.lg,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    summaryLabel: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: Colors.gray.light,
    },
    eventsSection: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderLeftWidth: 4,
    },
    eventTime: {
        alignItems: 'center',
        marginRight: Spacing.md,
        paddingRight: Spacing.md,
        borderRightWidth: 1,
        borderRightColor: Colors.gray.light,
    },
    eventTimeText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    eventTimeSep: {
        fontSize: FontSizes.sm,
        color: Colors.gray.light,
    },
    eventInfo: {
        flex: 1,
    },
    eventClient: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.primary,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    eventPrice: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.accent,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xxl,
        backgroundColor: Colors.white,
        borderRadius: 16,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        marginTop: Spacing.md,
    },
});
