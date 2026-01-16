import { Stack } from 'expo-router';
import { AuthProvider, ErrorBoundary } from '@anireserve/shared';

export default function ProRootLayout() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="auth/login" />
                    <Stack.Screen name="(pro-tabs)" />
                </Stack>
            </AuthProvider>
        </ErrorBoundary>
    );
}
