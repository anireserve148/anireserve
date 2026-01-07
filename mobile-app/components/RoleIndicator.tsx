import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RoleIndicatorProps {
    role: 'CLIENT' | 'PRO';
}

export function RoleIndicator({ role }: RoleIndicatorProps) {
    const isClient = role === 'CLIENT';

    return (
        <View style={[styles.container, isClient ? styles.clientContainer : styles.proContainer]}>
            <View style={[styles.iconBox, isClient ? styles.clientIconBox : styles.proIconBox]}>
                <Ionicons
                    name={isClient ? "person" : "briefcase"}
                    size={14}
                    color={isClient ? "#001F3F" : "#F97316"}
                />
            </View>
            <Text style={[styles.text, isClient ? styles.clientText : styles.proText]}>
                {isClient ? "Mode Client" : "Mode Pro"}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'center',
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    clientContainer: {
        backgroundColor: '#E0F2FE',
        borderWidth: 1,
        borderColor: '#0891B2',
    },
    proContainer: {
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#F97316',
    },
    iconBox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    clientIconBox: {
        backgroundColor: '#FFFFFF',
    },
    proIconBox: {
        backgroundColor: '#FFFFFF',
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    clientText: {
        color: '#0C4A6E',
    },
    proText: {
        color: '#C2410C',
    },
});
