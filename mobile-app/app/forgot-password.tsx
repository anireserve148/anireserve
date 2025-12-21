import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants';
import { api } from '../services/api';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
            return;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${api.baseUrl}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            if (response.ok) {
                setIsSent(true);
            } else {
                const data = await response.json();
                Alert.alert('Erreur', data.error || 'Une erreur est survenue');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de contacter le serveur');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Ionicons name="mail-outline" size={60} color={Colors.primary} />
                    </View>
                    <Text style={styles.successTitle}>Email envoyé !</Text>
                    <Text style={styles.successText}>
                        Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Retour à la connexion</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
                    <Ionicons name="arrow-back" size={24} color={Colors.secondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed-outline" size={60} color={Colors.primary} />
                </View>

                <Text style={styles.title}>Mot de passe oublié ?</Text>
                <Text style={styles.subtitle}>
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={Colors.gray.medium} />
                    <TextInput
                        style={styles.input}
                        placeholder="Votre adresse email"
                        placeholderTextColor={Colors.gray.medium}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Envoyer le lien</Text>
                    )}
                </TouchableOpacity>

                {/* Back to login */}
                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => router.back()}
                >
                    <Text style={styles.loginLinkText}>
                        <Ionicons name="arrow-back" size={14} color={Colors.primary} /> Retour à la connexion
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: Spacing.md,
    },
    backIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        justifyContent: 'center',
        marginTop: -60,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.secondary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.gray.light,
    },
    input: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: FontSizes.md,
        color: Colors.secondary,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: Colors.gray.medium,
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    loginLink: {
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    loginLinkText: {
        fontSize: FontSizes.md,
        color: Colors.primary,
        fontWeight: '600',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    successTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.secondary,
        marginBottom: Spacing.md,
    },
    successText: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    backButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: 12,
    },
    backButtonText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
});
