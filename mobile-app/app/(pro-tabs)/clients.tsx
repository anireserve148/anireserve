import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../constants';
import { api } from '../../services/api';
import { ClientTagBadge } from '../../components/ClientTagBadge';

interface Client {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phoneNumber: string | null;
    totalBookings: number;
    totalSpent: number;
    lastVisit: string;
    notesCount?: number;  // CRM: Nombre de notes
    tags?: string[];  // CRM: Tags du client
}

export default function ProClientsScreen() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        const result = await api.getProClients();
        if (result.success && result.data) {
            setClients(result.data);
        }
        setIsLoading(false);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadClients();
        setIsRefreshing(false);
    };

    const handleStartChat = async (clientId: string, clientName: string) => {
        try {
            const result = await api.startConversationWithClient(clientId);
            if (result.success && result.data?.id) {
                router.push(`/chat/${result.data.id}?name=${encodeURIComponent(clientName)}`);
            } else {
                Alert.alert('Erreur', 'Impossible de démarrer la conversation');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de démarrer la conversation');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

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
                {item.notesCount && item.notesCount > 0 ? (
                    <View style={styles.notesIndicator}>
                        <Ionicons name="document-text" size={12} color={Colors.secondary} />
                        <Text style={styles.notesText}>{item.notesCount} note{item.notesCount > 1 ? 's' : ''}</Text>
                    </View>
                ) : (
                    <Text style={styles.lastVisit}>Dernière visite: {formatDate(item.lastVisit)}</Text>
                )}
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                        {item.tags.map((tag) => (
                            <ClientTagBadge key={tag} tag={tag} small />
                        ))}
                    </View>
                )}
            </View>
            <View style={styles.clientActions}>
                <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleStartChat(item.id, item.name);
                    }}
                >
                    <Ionicons name="chatbubble-outline" size={20} color={Colors.accent} />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const totalRevenue = clients.reduce((acc, c) => acc + c.totalSpent, 0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{clients.length}</Text>
                    <Text style={styles.statLabel}>Clients</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{totalRevenue}₪</Text>
                    <Text style={styles.statLabel}>Total revenus</Text>
                </View>
            </View>

            <FlatList
                data={clients}
                renderItem={renderClient}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={Colors.gray.medium} />
                        <Text style={styles.emptyTitle}>Aucun client</Text>
                        <Text style={styles.emptyText}>
                            Vos clients apparaîtront ici après leur première réservation
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.lightest,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        flexGrow: 1,
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
    notesIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
        gap: 4,
    },
    notesText: {
        fontSize: FontSizes.xs,
        color: Colors.secondary,
        fontWeight: '600',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.xs,
        gap: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.gray.dark,
        marginTop: Spacing.lg,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        textAlign: 'center',
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.xl,
    },
});
