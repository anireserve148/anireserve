import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api, Colors, Spacing, BorderRadius, Shadows } from '@anireserve/shared';

interface Client {
    id: string;
    name: string;
    email: string;
    totalReservations: number;
    totalSpent: number;
    lastVisit?: string;
}

export default function ClientsScreen() {
    const [clients, setClients] = useState<Client[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadClients = async () => {
        try {
            // Mock data - API endpoint would be /api/mobile/pro/clients
            const mockClients: Client[] = [
                {
                    id: '1',
                    name: 'Marie Dupont',
                    email: 'marie@example.com',
                    totalReservations: 12,
                    totalSpent: 600,
                    lastVisit: new Date().toISOString(),
                },
                {
                    id: '2',
                    name: 'Jean Martin',
                    email: 'jean@example.com',
                    totalReservations: 8,
                    totalSpent: 400,
                    lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
            ];
            setClients(mockClients);
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderClient = ({ item }: { item: Client }) => (
        <TouchableOpacity style={styles.clientCard}>
            <View style={styles.clientHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{item.name}</Text>
                    <Text style={styles.clientEmail}>{item.email}</Text>
                </View>
            </View>

            <View style={styles.clientStats}>
                <View style={styles.statItem}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.statText}>{item.totalReservations} réservations</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.statText}>{item.totalSpent}€ dépensés</Text>
                </View>
            </View>

            {item.lastVisit && (
                <Text style={styles.lastVisit}>
                    Dernière visite:{' '}
                    {new Date(item.lastVisit).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                    })}
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Clients</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Rechercher un client..."
                    placeholderTextColor={Colors.textTertiary}
                />
            </View>

            <FlatList
                data={filteredClients}
                renderItem={renderClient}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => {
                        setRefreshing(true);
                        loadClients();
                    }} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={64} color={Colors.gray[300]} />
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'Aucun client trouvé' : 'Aucun client'}
                            </Text>
                        </View>
                    ) : null
                }
            />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.lg,
        marginVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        height: 48,
        ...Shadows.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: 16,
        color: Colors.text,
    },
    list: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    clientCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.sm,
    },
    clientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.proPrimary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.white,
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    clientEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    clientStats: {
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    statText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    lastVisit: {
        fontSize: 12,
        color: Colors.textTertiary,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: Spacing.xxl * 2,
        gap: Spacing.md,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
});
