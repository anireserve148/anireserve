import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../constants';

interface EarningPeriod {
    label: string;
    amount: number;
    bookings: number;
}

const MOCK_DATA = {
    today: { amount: 360, bookings: 3 },
    thisWeek: { amount: 1450, bookings: 12 },
    thisMonth: { amount: 4800, bookings: 38 },
    total: { amount: 24500, bookings: 186 },
    recentPayments: [
        { id: '1', client: 'David Cohen', amount: 240, date: '2025-12-20', status: 'completed' },
        { id: '2', client: 'Marie Levy', amount: 120, date: '2025-12-19', status: 'completed' },
        { id: '3', client: 'Sarah Ben', amount: 360, date: '2025-12-18', status: 'pending' },
    ],
};

export default function ProEarningsScreen() {
    const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

    return (
        <ScrollView style={styles.container}>
            {/* Total Earnings Card */}
            <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Revenus ce mois</Text>
                <Text style={styles.totalAmount}>{MOCK_DATA.thisMonth.amount}₪</Text>
                <Text style={styles.totalSub}>{MOCK_DATA.thisMonth.bookings} réservations</Text>
            </View>

            {/* Period Stats */}
            <View style={styles.periodGrid}>
                {[
                    { key: 'today', label: "Aujourd'hui", data: MOCK_DATA.today },
                    { key: 'thisWeek', label: 'Cette semaine', data: MOCK_DATA.thisWeek },
                    { key: 'thisMonth', label: 'Ce mois', data: MOCK_DATA.thisMonth },
                    { key: 'total', label: 'Total', data: MOCK_DATA.total },
                ].map((period) => (
                    <TouchableOpacity
                        key={period.key}
                        style={[
                            styles.periodCard,
                            selectedPeriod === period.key && styles.periodCardActive
                        ]}
                        onPress={() => setSelectedPeriod(period.key)}
                    >
                        <Text style={[
                            styles.periodAmount,
                            selectedPeriod === period.key && styles.periodAmountActive
                        ]}>
                            {period.data.amount}₪
                        </Text>
                        <Text style={styles.periodLabel}>{period.label}</Text>
                        <Text style={styles.periodBookings}>{period.data.bookings} RDV</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Recent Payments */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💰 Derniers paiements</Text>

                {MOCK_DATA.recentPayments.map((payment) => (
                    <View key={payment.id} style={styles.paymentRow}>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentClient}>{payment.client}</Text>
                            <Text style={styles.paymentDate}>{payment.date}</Text>
                        </View>
                        <View style={styles.paymentRight}>
                            <Text style={styles.paymentAmount}>+{payment.amount}₪</Text>
                            <View style={[
                                styles.paymentStatus,
                                { backgroundColor: payment.status === 'completed' ? Colors.success + '20' : Colors.warning + '20' }
                            ]}>
                                <Text style={[
                                    styles.paymentStatusText,
                                    { color: payment.status === 'completed' ? Colors.success : Colors.warning }
                                ]}>
                                    {payment.status === 'completed' ? 'Reçu' : 'En attente'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Withdrawal Button */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.withdrawButton}>
                    <Ionicons name="wallet-outline" size={24} color={Colors.white} />
                    <Text style={styles.withdrawText}>Retirer mes gains</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.lightest,
    },
    totalCard: {
        backgroundColor: Colors.success,
        margin: Spacing.md,
        padding: Spacing.xl,
        borderRadius: 24,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: FontSizes.md,
        color: Colors.white,
        opacity: 0.8,
    },
    totalAmount: {
        fontSize: 48,
        fontWeight: '700',
        color: Colors.white,
        marginVertical: Spacing.sm,
    },
    totalSub: {
        fontSize: FontSizes.sm,
        color: Colors.white,
        opacity: 0.8,
    },
    periodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    periodCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.md,
        alignItems: 'center',
    },
    periodCardActive: {
        backgroundColor: Colors.primary,
    },
    periodAmount: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    periodAmountActive: {
        color: Colors.white,
    },
    periodLabel: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
    periodBookings: {
        fontSize: FontSizes.xs,
        color: Colors.gray.light,
    },
    section: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentClient: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    paymentDate: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    paymentRight: {
        alignItems: 'flex-end',
    },
    paymentAmount: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.success,
    },
    paymentStatus: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: Spacing.xs,
    },
    paymentStatusText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
    withdrawButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accent,
        borderRadius: 16,
        padding: Spacing.lg,
    },
    withdrawText: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.white,
    },
});
