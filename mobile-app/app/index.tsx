import React, { useState, useEffect } from 'react';
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
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { Colors, Spacing, FontSizes } from '../constants';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Google OAuth - Replace with your actual Google Client IDs from Google Console
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
        // For native builds, you'll need to configure these in app.json
    });

    useEffect(() => {
        if (response?.type === 'success') {
            handleGoogleSuccess(response.authentication?.accessToken);
        }
    }, [response]);

    const handleGoogleSuccess = async (accessToken: string | undefined) => {
        if (!accessToken) return;

        setIsGoogleLoading(true);
        try {
            // Get user info from Google
            const userInfoResponse = await fetch(
                'https://www.googleapis.com/userinfo/v2/me',
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const userInfo = await userInfoResponse.json();

            // Send to our backend for login/register
            const result = await api.googleLogin({
                email: userInfo.email,
                name: userInfo.name,
                image: userInfo.picture,
                googleId: userInfo.id,
            });

            if (result.success && result.data) {
                await storage.saveToken(result.data.token);
                await storage.saveUser(result.data.user);
                api.setToken(result.data.token);
                router.replace('/(tabs)');
            } else {
                Alert.alert('Erreur', result.error || 'Connexion Google échouée');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Connexion Google échouée');
        } finally {
            setIsGoogleLoading(false);
        }
    };

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
                        onPress={() => router.push('/register')}
                        disabled={isLoading}
                    >
                        <Text style={styles.linkText}>
                            Pas encore de compte ? <Text style={styles.linkTextBold}>S'inscrire</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>ou</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Google Sign In */}
                    <TouchableOpacity
                        style={[styles.googleButton, (isGoogleLoading || !request) && styles.buttonDisabled]}
                        onPress={() => promptAsync()}
                        disabled={isGoogleLoading || !request}
                    >
                        {isGoogleLoading ? (
                            <ActivityIndicator color={Colors.secondary} />
                        ) : (
                            <>
                                <Ionicons name="logo-google" size={24} color="#DB4437" />
                                <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                            </>
                        )}
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
    linkTextBold: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.gray.medium,
    },
    dividerText: {
        marginHorizontal: Spacing.md,
        color: Colors.gray.medium,
        fontSize: FontSizes.sm,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray.medium,
        borderRadius: 12,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    googleButtonText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.secondary,
    },
});
