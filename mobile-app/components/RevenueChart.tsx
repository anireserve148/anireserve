import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { ProColors, Spacing, FontSizes } from '../constants';
import { api } from '../services/api';

const screenWidth = Dimensions.get('window').width;

interface RevenueData {
    labels: string[];
    data: number[];
    stats: {
        totalRevenue: number;
        averageRevenue: number;
        trend: number;
        period: string;
        days: number;
    };
}

export function RevenueChart() {
    const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<'week' | 'month'>('month');

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        setIsLoading(true);
        const result = await api.getRevenueAnalytics(period);
        if (result.success && result.data) {
            setRevenueData(result.data);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ProColors.accent} />
            </View>
        );
    }

    if (!revenueData || revenueData.data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="trending-up-outline" size={48} color={ProColors.textMuted} />
                <Text style={styles.emptyText}>Aucune donnée de revenus</Text>
            </View>
        );
    }

    const { stats } = revenueData;
    const trendIcon = stats.trend > 0 ? 'trending-up' : stats.trend < 0 ? 'trending-down' : 'remove';
    const trendColor = stats.trend > 0 ? '#10B981' : stats.trend < 0 ? '#EF4444' : ProColors.textMuted;

    return (
        <View style={styles.container}>
            {/* Header with period selector */}
            <View style={styles.header}>
                <Text style={styles.title}>Revenus</Text>
                <View style={styles.periodSelector}>
                    <TouchableOpacity
                        style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
                        onPress={() => setPeriod('week')}
                    >
                        <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
                            7j
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
                        onPress={() => setPeriod('month')}
                    >
                        <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
                            30j
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalRevenue}₪</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.averageRevenue}₪</Text>
                    <Text style={styles.statLabel}>Moyenne/jour</Text>
                </View>
                <View style={styles.statBox}>
                    <View style={styles.trendRow}>
                        <Ionicons name={trendIcon} size={20} color={trendColor} />
                        <Text style={[styles.statValue, { color: trendColor }]}>
                            {stats.trend > 0 ? '+' : ''}{stats.trend}%
                        </Text>
                    </View>
                    <Text style={styles.statLabel}>Tendance</Text>
                </View>
            </View>

            {/* Line Chart */}
            <LineChart
                data={{
                    labels: revenueData.labels,
                    datasets: [{
                        data: revenueData.data
                    }]
                }}
                width={screenWidth - 40}
                height={220}
                yAxisLabel=""
                yAxisSuffix="₪"
                chartConfig={{
                    backgroundColor: ProColors.card,
                    backgroundGradientFrom: ProColors.card,
                    backgroundGradientTo: ProColors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`, // ProColors.accent
                    labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`, // ProColors.textMuted
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: ProColors.accent,
                    },
                    propsForBackgroundLines: {
                        strokeDasharray: '', // solid lines
                        stroke: ProColors.border,
                        strokeWidth: 1,
                    },
                }}
                bezier
                style={styles.chart}
                withInnerLines
                withOuterLines
                withVerticalLines={false}
                withHorizontalLines
                fromZero
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: ProColors.card,
        borderRadius: 16,
        padding: Spacing.md,
        marginVertical: Spacing.md,
        borderWidth: 1,
        borderColor: ProColors.border,
    },
    loadingContainer: {
        backgroundColor: ProColors.card,
        borderRadius: 16,
        padding: Spacing.xl,
        marginVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
    },
    emptyContainer: {
        backgroundColor: ProColors.card,
        borderRadius: 16,
        padding: Spacing.xl,
        marginVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: ProColors.textMuted,
        marginTop: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: ProColors.text,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: ProColors.backgroundLight,
        borderRadius: 8,
        padding: 2,
    },
    periodButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    periodButtonActive: {
        backgroundColor: ProColors.accent,
    },
    periodText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: ProColors.textMuted,
    },
    periodTextActive: {
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: ProColors.accent,
    },
    statLabel: {
        fontSize: FontSizes.xs,
        color: ProColors.textMuted,
        marginTop: 2,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    chart: {
        marginVertical: Spacing.sm,
        borderRadius: 16,
    },
});
