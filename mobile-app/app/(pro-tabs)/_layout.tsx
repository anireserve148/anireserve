import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProColors } from '../../constants';
import { View, Text, StyleSheet } from 'react-native';

export default function ProTabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: ProColors.accent,
                tabBarInactiveTintColor: ProColors.textMuted,
                tabBarStyle: {
                    backgroundColor: ProColors.card,
                    borderTopColor: ProColors.border,
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
                    backgroundColor: ProColors.background,
                },
                headerTintColor: ProColors.text,
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Réservations',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubbles" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="clients"
                options={{
                    title: 'Clients',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="earnings"
                options={{
                    title: 'Revenus',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Paramètres',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
