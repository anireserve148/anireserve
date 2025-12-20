import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Colors, Spacing, FontSizes } from '../../constants';

interface Conversation {
    id: string;
    otherUser: {
        id: string;
        name: string;
        image: string | null;
    };
    lastMessage: {
        content: string;
        createdAt: string;
        isRead: boolean;
        senderId: string;
    } | null;
    updatedAt: string;
}

export default function MessagesScreen() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setIsLoading(true);
        const result = await api.getConversations();
        if (result.success && result.data) {
            setConversations(result.data);
        }
        setIsLoading(false);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadConversations();
        setIsRefreshing(false);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'À l\'instant';
        if (hours < 24) return `Il y a ${hours}h`;
        if (hours < 48) return 'Hier';
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => router.push(`/chat/${item.id}`)}
        >
            <View style={styles.avatarContainer}>
                {item.otherUser.image ? (
                    <Image source={{ uri: item.otherUser.image }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.otherUser.name[0]}</Text>
                    </View>
                )}
                <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.userName}>{item.otherUser.name}</Text>
                    {item.lastMessage && (
                        <Text style={styles.timestamp}>
                            {formatTime(item.lastMessage.createdAt)}
                        </Text>
                    )}
                </View>
                {item.lastMessage && (
                    <Text
                        style={[
                            styles.lastMessage,
                            !item.lastMessage.isRead && styles.unreadMessage,
                        ]}
                        numberOfLines={1}
                    >
                        {item.lastMessage.content}
                    </Text>
                )}
            </View>

            {item.lastMessage && !item.lastMessage.isRead && <View style={styles.unreadBadge} />}
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity style={styles.newMessageButton}>
                    <Ionicons name="create-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Conversations List */}
            <FlatList
                data={conversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={80} color={Colors.gray.medium} />
                        <Text style={styles.emptyTitle}>Aucun message</Text>
                        <Text style={styles.emptyText}>
                            Commencez une conversation avec un professionnel
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
        backgroundColor: Colors.white,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    headerTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    newMessageButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        flexGrow: 1,
    },
    conversationItem: {
        flexDirection: 'row',
        padding: Spacing.md,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: Spacing.md,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.white,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: Colors.success,
        borderWidth: 2,
        borderColor: Colors.white,
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    userName: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    timestamp: {
        fontSize: FontSizes.xs,
        color: Colors.gray.medium,
    },
    lastMessage: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    unreadMessage: {
        color: Colors.secondary,
        fontWeight: '600',
    },
    unreadBadge: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
        marginLeft: Spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        textAlign: 'center',
    },
});
