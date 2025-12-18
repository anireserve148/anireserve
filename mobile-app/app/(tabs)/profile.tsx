import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../../services/storage';
import { api } from '../../services/api';
import { User } from '../../types';
import { Colors, Spacing, FontSizes } from '../../constants';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await storage.getUser();
        setUser(userData);
        setIsLoading(false);
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: async () => {
                        await storage.clearAll();
                        api.clearToken();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Utilisateur non trouvé</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
                    <Text style={styles.buttonText}>Retour à la connexion</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* User Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.name?.[0] || 'U'}</Text>
                </View>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
                {user.role && (
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user.role}</Text>
                    </View>
                )}
            </View>

            {/* Menu Items */}
            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="person-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Modifier le profil</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Notifications</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="lock-closed-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Confidentialité</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Aide & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>À propos</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color={Colors.error} />
                <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.light,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    header: {
        backgroundColor: Colors.white,
        alignItems: 'center',
        padding: Spacing.xl,
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 42,
        fontWeight: 'bold',
    },
    name: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.xs,
    },
    email: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        marginBottom: Spacing.sm,
    },
    roleBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 8,
    },
    roleText: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    menu: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    menuText: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.secondary,
        marginLeft: Spacing.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    logoutText: {
        fontSize: FontSizes.md,
        color: Colors.error,
        fontWeight: 'bold',
        marginLeft: Spacing.sm,
    },
    version: {
        textAlign: 'center',
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        padding: Spacing.lg,
    },
    errorText: {
        fontSize: FontSizes.md,
        color: Colors.error,
        marginBottom: Spacing.md,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: 12,
    },
    buttonText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: 'bold',
    },
});
