import { Stack } from 'expo-router';
import { AuthProvider, ErrorBoundary } from '../src/shared/src';

export default function RootLayout() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="auth/login" />
                    <Stack.Screen name="auth/register" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="pro/[id]" />
                    <Stack.Screen name="booking/[proId]" />
                    <Stack.Screen name="messages/[conversationId]" />
                </Stack>
            </AuthProvider>
        </ErrorBoundary>
    );
}
