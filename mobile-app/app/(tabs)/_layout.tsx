import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { View, Text, StyleSheet } from 'react-native';

export default function TabsLayout() {
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [pendingReservations, setPendingReservations] = useState(0);

    useEffect(() => {
        loadBadges();
        const interval = setInterval(loadBadges, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const loadBadges = async () => {
        // Count unread messages
        const convResult = await api.getConversations();
        if (convResult.success && convResult.data) {
            const unread = convResult.data.filter(
                c => c.lastMessage && !c.lastMessage.isRead && c.lastMessage.senderId !== 'current'
            ).length;
            setUnreadMessages(unread);
        }

        // Count pending reservations
        const resResult = await api.getMyReservations();
        if (resResult.success && resResult.data) {
            const pending = resResult.data.filter(r => r.status === 'PENDING').length;
            setPendingReservations(pending);
        }
    };

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.accent,
                tabBarInactiveTintColor: Colors.gray.medium,
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopColor: Colors.gray.light,
                    borderTopWidth: 1,
                    height: 70,
                    paddingBottom: 12,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: Colors.white,
                },
                headerTintColor: Colors.primary,
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Accueil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reservations"
                options={{
                    title: 'Réservations',
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <Ionicons name="calendar" size={size} color={color} />
                            {pendingReservations > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {pendingReservations > 9 ? '9+' : pendingReservations}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favoris',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <Ionicons name="chatbubbles" size={size} color={color} />
                            {unreadMessages > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -5,
        right: -10,
        backgroundColor: Colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
