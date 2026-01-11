import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Colors, Spacing, FontSizes } from '../../constants';
import { ConversationSkeleton } from '../../components/Skeleton';

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
    const [searchQuery, setSearchQuery] = useState('');

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
        const diffInMinutes = Math.floor(diff / (1000 * 60));
        const diffInHours = Math.floor(diff / (1000 * 60 * 60));

        if (diffInMinutes < 1) return 'Maintenant';
        if (diffInMinutes < 60) return `${diffInMinutes} min`;
        if (diffInHours < 24) return `${diffInHours}h`;
        if (diffInHours < 48) return 'Hier';
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const filteredConversations = conversations.filter(c =>
        c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => router.push({
                pathname: `/chat/${item.id}`,
                params: { name: item.otherUser.name }
            })}
        >
            <View style={styles.avatarWrapper}>
                {item.otherUser.image ? (
                    <Image source={{ uri: item.otherUser.image }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.otherUser.name[0]}</Text>
                    </View>
                )}
                <View style={styles.statusIndicator} />
            </View>

            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.userName} numberOfLines={1}>{item.otherUser.name}</Text>
                    {item.lastMessage && (
                        <Text style={[styles.timestamp, !item.lastMessage.isRead && styles.unreadTimestamp]}>
                            {formatTime(item.lastMessage.createdAt)}
                        </Text>
                    )}
                </View>
                <View style={styles.lastMessageRow}>
                    {item.lastMessage && (
                        <Text
                            style={[
                                styles.lastMessage,
                                !item.lastMessage.isRead && styles.unreadMessageText,
                            ]}
                            numberOfLines={1}
                        >
                            {item.lastMessage.content}
                        </Text>
                    )}
                    {item.lastMessage && !item.lastMessage.isRead && (
                        <View style={styles.unreadDot} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Messages</Text>
                        <Text style={styles.headerSubtitle}>Chargement...</Text>
                    </View>
                </View>
                <View style={styles.listContent}>
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <Text style={styles.headerSubtitle}>{conversations.length} conversations</Text>
                </View>
                <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="create-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color={Colors.gray.medium} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher une conversation..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={Colors.gray.medium}
                    />
                </View>
            </View>

            {/* Conversations List */}
            <FlatList
                data={filteredConversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="chatbubbles-outline" size={40} color={Colors.gray.light} />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? 'Aucun résultat' : 'Pas encore de messages'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? "Nous n'avons trouvé aucune conversation correspondant à votre recherche."
                                : "Vos conversations avec les professionnels apparaîtront ici."}
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.secondary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: Colors.gray.medium,
        fontWeight: '600',
        marginTop: 2,
    },
    headerAction: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 15,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: Colors.secondary,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 20,
    },
    conversationItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 14,
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
    },
    statusIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10B981',
        borderWidth: 3,
        borderColor: Colors.white,
    },
    conversationContent: {
        flex: 1,
        marginLeft: 15,
        height: 60,
        justifyContent: 'center',
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.secondary,
        flex: 1,
        marginRight: 10,
    },
    timestamp: {
        fontSize: 12,
        color: Colors.gray.medium,
        fontWeight: '500',
    },
    unreadTimestamp: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    lastMessageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.gray.medium,
        flex: 1,
        fontWeight: '500',
    },
    unreadMessageText: {
        color: Colors.secondary,
        fontWeight: '700',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 80,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.secondary,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.gray.medium,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
});
