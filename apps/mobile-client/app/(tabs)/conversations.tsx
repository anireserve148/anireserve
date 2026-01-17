import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api, Colors, Spacing, BorderRadius, Shadows, type Conversation } from '../src/shared/src';

export default function ConversationsScreen() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadConversations = async () => {
        try {
            const response = await api.getConversations();
            setConversations(response.data || []);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.conversationCard}
            onPress={() => router.push(`/messages/${item.id}`)}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.participants?.[0]?.name?.charAt(0) || 'U'}
                </Text>
            </View>
            <View style={styles.conversationInfo}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.name}>{item.participants?.[0]?.name || 'User'}</Text>
                    <Text style={styles.time}>
                        {item.lastMessage?.createdAt
                            ? new Date(item.lastMessage.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                            })
                            : ''}
                    </Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage?.content || 'Commencer une conversation'}
                </Text>
            </View>
            {item.unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => {
                        setRefreshing(true);
                        loadConversations();
                    }} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={64} color={Colors.gray[300]} />
                            <Text style={styles.emptyText}>Aucun message</Text>
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
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
    },
    list: {
        padding: Spacing.lg,
        gap: Spacing.sm,
    },
    conversationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        gap: Spacing.md,
        ...Shadows.sm,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.white,
    },
    conversationInfo: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    time: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    badge: {
        backgroundColor: Colors.accent,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.white,
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
