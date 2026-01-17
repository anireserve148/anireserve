import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../src/shared/src';

export default function WelcomeScreen() {
    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Hero Section */}
            <View style={styles.hero}>
                <Text style={styles.emoji}>✨</Text>
                <Text style={styles.title}>Trouvez votre{'\n'}professionnel</Text>
                <Text style={styles.subtitle}>
                    Coiffure, massage, coaching...{'\n'}
                    Réservez en quelques secondes
                </Text>
            </View>

            {/* CTA Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={styles.primaryButtonText}>Continuer</Text>
                </TouchableOpacity>

                <View style={styles.termsContainer}>
                    <Text style={styles.terms}>
                        En continuant, vous acceptez nos{' '}
                        <Text style={styles.termsLink}>Conditions d'utilisation</Text>
                        {' '}et notre{' '}
                        <Text style={styles.termsLink}>Politique de confidentialité</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    hero: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emoji: {
        fontSize: 80,
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.md,
        lineHeight: 48,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    primaryButton: {
        backgroundColor: Colors.accent,
        borderRadius: BorderRadius.md,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.white,
    },
    termsContainer: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.sm,
    },
    terms: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: Colors.text,
        fontWeight: '500',
    },
});
