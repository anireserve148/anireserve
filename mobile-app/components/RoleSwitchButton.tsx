import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface RoleSwitchButtonProps {
    currentRole: 'CLIENT' | 'PRO';
    hasProProfile: boolean;
}

export function RoleSwitchButton({ currentRole, hasProProfile }: RoleSwitchButtonProps) {
    const router = useRouter();

    if (!hasProProfile) {
        return null; // Only show if user has both profiles
    }

    const isClient = currentRole === 'CLIENT';
    const targetRole = isClient ? 'PRO' : 'CLIENT';

    const handleSwitch = () => {
        if (isClient) {
            router.replace('/(pro-tabs)');
        } else {
            router.replace('/(tabs)');
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isClient ? styles.switchToProContainer : styles.switchToClientContainer
            ]}
            onPress={handleSwitch}
            activeOpacity={0.8}
        >
            <View style={[
                styles.iconCircle,
                isClient ? styles.proIconCircle : styles.clientIconCircle
            ]}>
                <Ionicons
                    name={isClient ? "briefcase" : "person"}
                    size={20}
                    color={isClient ? "#F97316" : "#001F3F"}
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={[
                    styles.mainText,
                    isClient ? styles.proMainText : styles.clientMainText
                ]}>
                    Passer en Mode {targetRole === 'PRO' ? 'Professionnel' : 'Client'}
                </Text>
                <Text style={styles.subText}>
                    {isClient ? 'Gérez votre activité' : 'Recherchez des professionnels'}
                </Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color={isClient ? "#F97316" : "#001F3F"}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 2,
    },
    switchToProContainer: {
        backgroundColor: '#FFF7ED',
        borderColor: '#F97316',
    },
    switchToClientContainer: {
        backgroundColor: '#E0F2FE',
        borderColor: '#0891B2',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    proIconCircle: {
        backgroundColor: '#FFEDD5',
    },
    clientIconCircle: {
        backgroundColor: '#DBEAFE',
    },
    textContainer: {
        flex: 1,
    },
    mainText: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    proMainText: {
        color: '#C2410C',
    },
    clientMainText: {
        color: '#0C4A6E',
    },
    subText: {
        fontSize: 12,
        color: '#6B7280',
    },
});
