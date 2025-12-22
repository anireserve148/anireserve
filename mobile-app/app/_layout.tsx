import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Colors } from '../constants';
import { notificationService } from '../services/notifications';
import { api } from '../services/api';
import { storage } from '../services/storage';

export default function RootLayout() {
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        // RESTORE TOKEN ON APP START
        restoreToken();

        // Register for push notifications
        registerForPushNotifications();

        // Listen to notification events (only on native, not web)
        if (typeof Notifications.addNotificationReceivedListener === 'function') {
            notificationListener.current = notificationService.addNotificationReceivedListener((notification) => {
                console.log('Notification received:', notification);
            });

            responseListener.current = notificationService.addNotificationResponseReceivedListener((response) => {
                console.log('Notification tapped:', response);
            });
        }

        return () => {
            // Use .remove() method on the subscription object (new expo-notifications API)
            if (notificationListener.current?.remove) {
                notificationListener.current.remove();
            }
            if (responseListener.current?.remove) {
                responseListener.current.remove();
            }
        };
    }, []);

    // RESTORE TOKEN FROM STORAGE
    const restoreToken = async () => {
        const token = await storage.getToken();
        if (token) {
            api.setToken(token);
            console.log('Token restored to API service');
        }
    };

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
                headerShown: false, // Hide all headers by default
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
            <Stack.Screen
                name="(pro-tabs)"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="register"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="register-pro"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="forgot-password"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="pro/[id]"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
