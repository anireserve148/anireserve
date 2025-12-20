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
            {/* Background decoration */}
            <View style={styles.decorTop} />
            <View style={styles.decorBottom} />

            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="paw" size={50} color={Colors.white} />
                    </View>
                    <Text style={styles.logo}>AniReserve</Text>
                    <Text style={styles.tagline}>Votre pro animalier en Israël 🐾</Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.welcomeText}>Bienvenue ! 👋</Text>
                    <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={Colors.gray.medium} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.gray.medium}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.gray.medium} />
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            placeholderTextColor={Colors.gray.medium}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Se connecter</Text>
                                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                            </>
                        )}
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
                                <Ionicons name="logo-google" size={22} color="#DB4437" />
                                <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Register Link */}
                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.push('/register')}
                        disabled={isLoading}
                    >
                        <Text style={styles.linkText}>
                            Nouveau ici ? <Text style={styles.linkTextBold}>Créer un compte</Text>
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
        backgroundColor: Colors.background || '#FFF9F5',
    },
    decorTop: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: Colors.primary + '20',
    },
    decorBottom: {
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: Colors.accent + '30',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    logo: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.secondary,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
        marginTop: Spacing.xs,
    },
    formCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: Spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    welcomeText: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.secondary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
        marginBottom: Spacing.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray.light,
        borderRadius: 14,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    input: {
        flex: 1,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        color: Colors.secondary,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        borderRadius: 14,
        padding: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.md,
        gap: Spacing.sm,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    linkButton: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    linkText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
        textAlign: 'center',
    },
    linkTextBold: {
        color: Colors.primary,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.gray.light,
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
        borderWidth: 2,
        borderColor: Colors.gray.light,
        borderRadius: 14,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    googleButtonText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.secondary,
    },
});
