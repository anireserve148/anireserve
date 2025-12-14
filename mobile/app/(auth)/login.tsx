import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.login({ email, password });

            // Redirect based on role
            if (response.user.role === 'ADMIN') {
                router.replace('/(admin)/dashboard');
            } else if (response.user.role === 'PRO') {
                router.replace('/(pro)/dashboard');
            } else {
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Connexion échouée');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.logo}>🐾</Text>
                <Text style={styles.title}>Connexion</Text>
                <Text style={styles.subtitle}>Bon retour sur AniReserve !</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.link}>
                        Pas encore de compte ? <Text style={styles.linkBold}>S'inscrire</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        padding: SPACING.xl,
    },
    logo: {
        fontSize: 60,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.xxxl,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: SPACING.xxl,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        marginBottom: SPACING.md,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: 12,
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        textAlign: 'center',
    },
    link: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.sm,
        textAlign: 'center',
    },
    linkBold: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
