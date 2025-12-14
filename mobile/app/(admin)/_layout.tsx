import { Stack } from 'expo-router';
import { COLORS } from '../../constants';

export default function AdminLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: COLORS.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard Admin',
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
