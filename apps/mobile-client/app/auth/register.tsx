import { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { api, Colors, Spacing, BorderRadius } from '@anireserve/shared';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        try {
            const response = await api.register({ name, email, password });
            if (response.data?.token) {
                api.setToken(response.data.token);
                router.replace('/home');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de créer le compte');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Text style={styles.title}>Créer un compte</Text>
                <Text style={styles.subtitle}>Rejoignez AniReserve</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nom complet</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Jean Dupont"
                        placeholderTextColor={Colors.textTertiary}
                        autoCapitalize="words"
                        autoComplete="name"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="votre@email.com"
                        placeholderTextColor={Colors.textTertiary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Minimum 6 caractères"
                        placeholderTextColor={Colors.textTertiary}
                        secureTextEntry
                        autoComplete="password-new"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Création...' : 'Créer mon compte'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => router.back()}
                >
                    <Text style={styles.loginText}>
                        Déjà un compte ?{' '}
                        <Text style={styles.loginTextBold}>Se connecter</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    form: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
    },
    inputContainer: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        color: Colors.text,
        backgroundColor: Colors.backgroundSecondary,
    },
    button: {
        backgroundColor: Colors.accent,
        height: 52,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
    loginLink: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 15,
        color: Colors.textSecondary,
    },
    loginTextBold: {
        color: Colors.text,
        fontWeight: '600',
    },
});
