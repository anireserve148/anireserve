import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export default function Index() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.logo}>🐾</Text>
                <Text style={styles.title}>AniReserve</Text>
                <Text style={styles.subtitle}>
                    Trouvez et réservez les meilleurs services pour vos animaux
                </Text>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text style={styles.primaryButtonText}>Se connecter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push('/(auth)/register')}
                >
                    <Text style={styles.secondaryButtonText}>Créer un compte</Text>
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    logo: {
        fontSize: 80,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.xxxl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: SPACING.xxl,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: 12,
        width: '100%',
        marginBottom: SPACING.md,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: 12,
        width: '100%',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        textAlign: 'center',
    },
});
