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
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        try {
            await authService.register({ name, email, password });
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Erreur', error.response?.data?.message || 'Inscription échouée');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.logo}>🐾</Text>
                    <Text style={styles.title}>Inscription</Text>
                    <Text style={styles.subtitle}>Rejoignez AniReserve dès maintenant !</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nom complet"
                        value={name}
                        onChangeText={setName}
                        autoComplete="name"
                    />

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
                        autoComplete="password-new"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Confirmer le mot de passe"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoComplete="password-new"
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Inscription...' : "S'inscrire"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.link}>
                            Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
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
