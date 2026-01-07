import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { View, Text, StyleSheet } from 'react-native';
import { RoleIndicator } from '../../components/RoleIndicator';

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
        <View style={{ flex: 1 }}>
            <RoleIndicator role="CLIENT" />
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors.secondary,
                    tabBarInactiveTintColor: Colors.gray.medium,
                    tabBarStyle: {
                        backgroundColor: '#fff',
                        borderTopColor: '#DBDBDB',
                        borderTopWidth: 0.5,
                        height: 85,
                        paddingBottom: 28,
                        paddingTop: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '500',
                    },
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Accueil',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "home" : "home-outline"}
                                size={26}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="reservations"
                    options={{
                        title: 'Réservations',
                        tabBarIcon: ({ color, focused }) => (
                            <View>
                                <Ionicons
                                    name={focused ? "calendar" : "calendar-outline"}
                                    size={26}
                                    color={color}
                                />
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
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "heart" : "heart-outline"}
                                size={26}
                                color={focused ? "#FF3B5C" : color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="messages"
                    options={{
                        title: 'Messages',
                        tabBarIcon: ({ color, focused }) => (
                            <View>
                                <Ionicons
                                    name={focused ? "paper-plane" : "paper-plane-outline"}
                                    size={24}
                                    color={color}
                                />
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
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "person-circle" : "person-circle-outline"}
                                size={28}
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </View>
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
