import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, BorderRadius } from '@anireserve/shared';

export default function WelcomeProScreen() {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.hero}>
                <Text style={styles.emoji}>💼</Text>
                <Text style={styles.title}>AniReserve{'\n'}Pro</Text>
                <Text style={styles.subtitle}>
                    Gérez votre activité{'\n'}
                    en toute simplicité
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={styles.primaryButtonText}>Commencer</Text>
                </TouchableOpacity>

                <View style={styles.features}>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>📅</Text>
                        <Text style={styles.featureText}>Calendrier intelligent</Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>📊</Text>
                        <Text style={styles.featureText}>Analytics en temps réel</Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>💰</Text>
                        <Text style={styles.featureText}>Gestion des paiements</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.proPrimary,
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
        fontSize: 48,
        fontWeight: '700',
        color: Colors.white,
        textAlign: 'center',
        marginBottom: Spacing.md,
        lineHeight: 56,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    primaryButton: {
        backgroundColor: Colors.proAccent,
        borderRadius: BorderRadius.md,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.white,
    },
    features: {
        gap: Spacing.md,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    featureIcon: {
        fontSize: 24,
    },
    featureText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
});
