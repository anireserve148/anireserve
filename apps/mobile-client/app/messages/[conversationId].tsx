import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api, Colors, Spacing, BorderRadius, type Message } from '@anireserve/shared';

export default function MessagesScreen() {
    const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const loadMessages = async () => {
        if (!conversationId) return;
        try {
            const response = await api.getMessages(conversationId);
            setMessages(response.data || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [conversationId]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await api.sendMessage(conversationId!, newMessage.trim());
            setNewMessage('');
            await loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = true; // TODO: Compare with current user ID
        return (
            <View style={[styles.messageBubble, isMe && styles.myMessage]}>
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.messageTime}>
                    {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90}
        >
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                inverted
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Votre message..."
                    placeholderTextColor={Colors.textTertiary}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!newMessage.trim() || sending}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color={newMessage.trim() ? Colors.white : Colors.textTertiary}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    messagesList: {
        padding: Spacing.lg,
        gap: Spacing.sm,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.white,
        alignSelf: 'flex-start',
    },
    myMessage: {
        backgroundColor: Colors.accent,
        alignSelf: 'flex-end',
    },
    messageText: {
        fontSize: 15,
        color: Colors.text,
        marginBottom: 4,
    },
    messageTime: {
        fontSize: 11,
        color: Colors.textTertiary,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
        gap: Spacing.sm,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        padding: Spacing.sm,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.md,
        fontSize: 15,
        color: Colors.text,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.gray[200],
    },
});
