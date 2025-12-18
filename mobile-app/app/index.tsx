import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from './services/api';
import { storage } from './services/storage';
import { Colors, Spacing, FontSizes } from './constants';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setIsLoading(true);
        try {
            const result = await api.login({ email, password });

            if (result.success && result.data) {
                // Save token and user
                await storage.saveToken(result.data.token);
                await storage.saveUser(result.data.user);
                api.setToken(result.data.token);

                // Navigate to tabs
                router.replace('/(tabs)');
            } else {
                Alert.alert('Erreur', result.error || 'Connexion échouée');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>AniReserve</Text>
                    <Text style={styles.tagline}>Trouvez votre pro en Israël 🇮🇱</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.title}>Connexion</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isLoading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>Se connecter</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        disabled={isLoading}
                    >
                        <Text style={styles.linkText}>
                            Mode développement • Pas de backend connecté
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logo: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: Spacing.sm,
    },
    tagline: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
    },
    form: {
        width: '100%',
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.lg,
    },
    input: {
        backgroundColor: Colors.gray.light,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        fontSize: FontSizes.md,
    },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    linkText: {
        fontSize: FontSizes.xs,
        color: Colors.gray.medium,
        textAlign: 'center',
    },
});
