import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Colors, Spacing, FontSizes } from '../../constants';
import { storage } from '../../services/storage';

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export default function ChatScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadMessages();
        loadCurrentUser();
        // Poll for new messages every 3 seconds
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [id]);

    const loadCurrentUser = async () => {
        const user = await storage.getUser();
        if (user) setCurrentUserId(user.id);
    };

    const loadMessages = async () => {
        const result = await api.getMessages(id as string);
        if (result.success && result.data) {
            setMessages(result.data);
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        const result = await api.sendMessage(id as string, newMessage.trim());

        if (result.success && result.data) {
            setMessages([...messages, result.data]);
            setNewMessage('');
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
        setIsSending(false);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMyMessage = item.senderId === currentUserId;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessage : styles.theirMessage,
                ]}
            >
                <View
                    style={[
                        styles.messageBubble,
                        isMyMessage ? styles.myBubble : styles.theirBubble,
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isMyMessage ? styles.myMessageText : styles.theirMessageText,
                        ]}
                    >
                        {item.content}
                    </Text>
                    <Text
                        style={[
                            styles.timeText,
                            isMyMessage ? styles.myTimeText : styles.theirTimeText,
                        ]}
                    >
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Conversation</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color={Colors.gray.medium} />
                        <Text style={styles.emptyText}>Aucun message</Text>
                        <Text style={styles.emptySubtext}>
                            Commencez la conversation !
                        </Text>
                    </View>
                }
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Écrivez un message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    maxLength={1000}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                        <Ionicons name="send" size={20} color={Colors.white} />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5DDD5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        paddingTop: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    messagesList: {
        padding: Spacing.md,
        flexGrow: 1,
    },
    messageContainer: {
        marginBottom: Spacing.sm,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    theirMessage: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: Spacing.sm,
        borderRadius: 12,
        maxWidth: '100%',
    },
    myBubble: {
        backgroundColor: '#DCF8C6',
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: FontSizes.md,
        marginBottom: 4,
    },
    myMessageText: {
        color: Colors.secondary,
    },
    theirMessageText: {
        color: Colors.secondary,
    },
    timeText: {
        fontSize: FontSizes.xs,
        alignSelf: 'flex-end',
    },
    myTimeText: {
        color: '#5A7A5A',
    },
    theirTimeText: {
        color: Colors.gray.medium,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: Spacing.sm,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray.light,
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: FontSizes.md,
        maxHeight: 100,
        marginRight: Spacing.sm,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.gray.medium,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.gray.dark,
        marginTop: Spacing.md,
    },
    emptySubtext: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
    },
});
