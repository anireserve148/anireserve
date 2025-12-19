import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Colors } from '../constants';
import { notificationService } from '../services/notifications';
import { api } from '../services/api';
import { storage } from '../services/storage';

export default function RootLayout() {
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();

    useEffect(() => {
        // Register for push notifications
        registerForPushNotifications();

        // Listen to notification events
        notificationListener.current = notificationService.addNotificationReceivedListener((notification) => {
            console.log('Notification received:', notification);
        });

        responseListener.current = notificationService.addNotificationResponseReceivedListener((response) => {
            console.log('Notification tapped:', response);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    const registerForPushNotifications = async () => {
        const token = await storage.getToken();
        if (!token) return; // User not logged in

        const pushToken = await notificationService.registerForPushNotifications();
        if (pushToken) {
            // Save to backend
            await api.savePushToken(pushToken);
            console.log('Push token saved:', pushToken);
        }
    };

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: Colors.primary,
                },
                headerTintColor: Colors.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
