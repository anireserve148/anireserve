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
                {/* Logo Section - Tesla/Apple Style */}
                <View style={styles.logoSection}>
                    <Text style={styles.logo}>AniReserve</Text>
                    <Text style={styles.tagline}>Trouvez votre professionnel</Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.welcomeText}>Connexion</Text>
                    <Text style={styles.subtitle}>Entrez vos identifiants pour continuer</Text>

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
                            <Text style={styles.buttonText}>Se connecter</Text>
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
        backgroundColor: Colors.white,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logo: {
        fontSize: 42,
        fontWeight: '700',
        color: Colors.black,
        letterSpacing: -1.5,
    },
    tagline: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        marginTop: Spacing.sm,
        letterSpacing: 0.3,
    },
    formCard: {
        backgroundColor: Colors.white,
    },
    welcomeText: {
        fontSize: FontSizes.xxl,
        fontWeight: '600',
        color: Colors.black,
        marginBottom: Spacing.xs,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginBottom: Spacing.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray.lightest,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray.light,
    },
    input: {
        flex: 1,
        padding: Spacing.md,
        fontSize: FontSizes.lg,
        color: Colors.black,
    },
    button: {
        backgroundColor: Colors.black,
        borderRadius: 12,
        padding: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.lg,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: Colors.white,
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    linkText: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        textAlign: 'center',
    },
    linkTextBold: {
        color: Colors.black,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xl,
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
        borderWidth: 1,
        borderColor: Colors.gray.light,
        borderRadius: 12,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    googleButtonText: {
        fontSize: FontSizes.md,
        fontWeight: '500',
        color: Colors.black,
    },
});
