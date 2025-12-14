import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/auth';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export default function ProfileScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: async () => {
                        await authService.logout();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mon Profil</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>👤</Text>
                    </View>
                    <Text style={styles.name}>Utilisateur</Text>
                    <Text style={styles.email}>user@example.com</Text>
                </View>

                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="person-outline" size={24} color={COLORS.text} />
                        <Text style={styles.menuText}>Informations personnelles</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
                        <Text style={styles.menuText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="help-circle-outline" size={24} color={COLORS.text} />
                        <Text style={styles.menuText}>Aide & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="document-text-outline" size={24} color={COLORS.text} />
                        <Text style={styles.menuText}>Conditions d'utilisation</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.white,
        paddingTop: 60,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    avatarText: {
        fontSize: 40,
    },
    name: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    email: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
    },
    menuSection: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuText: {
        flex: 1,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        marginLeft: SPACING.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.error,
        gap: SPACING.sm,
    },
    logoutText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.error,
        fontWeight: '600',
    },
});
