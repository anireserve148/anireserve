import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../constants';

interface Client {
    id: string;
    name: string;
    totalBookings: number;
    totalSpent: number;
    lastVisit: string;
}

const MOCK_CLIENTS: Client[] = [
    { id: '1', name: 'David Cohen', totalBookings: 5, totalSpent: 750, lastVisit: '2025-12-20' },
    { id: '2', name: 'Marie Levy', totalBookings: 3, totalSpent: 450, lastVisit: '2025-12-18' },
    { id: '3', name: 'Sarah Ben', totalBookings: 8, totalSpent: 1200, lastVisit: '2025-12-15' },
    { id: '4', name: 'Michel Azoulay', totalBookings: 2, totalSpent: 300, lastVisit: '2025-12-10' },
];

export default function ProClientsScreen() {
    const router = useRouter();

    const renderClient = ({ item }: { item: Client }) => (
        <TouchableOpacity
            style={styles.clientCard}
            onPress={() => router.push(`/client-profile?id=${item.id}`)}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{item.name}</Text>
                <Text style={styles.clientStats}>
                    {item.totalBookings} réservations • {item.totalSpent}₪ total
                </Text>
                <Text style={styles.lastVisit}>Dernière visite: {item.lastVisit}</Text>
            </View>
            <View style={styles.clientActions}>
                <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/chat/${item.id}`);
                    }}
                >
                    <Ionicons name="chatbubble-outline" size={20} color={Colors.accent} />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{MOCK_CLIENTS.length}</Text>
                    <Text style={styles.statLabel}>Clients</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {MOCK_CLIENTS.reduce((acc, c) => acc + c.totalSpent, 0)}₪
                    </Text>
                    <Text style={styles.statLabel}>Total revenus</Text>
                </View>
            </View>

            <FlatList
                data={MOCK_CLIENTS}
                renderItem={renderClient}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
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
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        gap: Spacing.lg,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    listContent: {
        padding: Spacing.md,
    },
    clientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        color: Colors.white,
        fontSize: FontSizes.xl,
        fontWeight: '700',
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.primary,
    },
    clientStats: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
    lastVisit: {
        fontSize: FontSizes.xs,
        color: Colors.gray.light,
        marginTop: Spacing.xs,
    },
    messageBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clientActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
});
