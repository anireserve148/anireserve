import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { Colors, Spacing, FontSizes } from '../constants';

export default function RegisterScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);
        const result = await api.register({ name, email, password });
        setIsLoading(false);

        if (result.success && result.data) {
            const { user, token } = result.data;
            api.setToken(token);
            await storage.saveToken(token);
            await storage.saveUser(user);
            router.replace('/(tabs)');
        } else {
            Alert.alert('Erreur', result.error || 'Inscription échouée');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>A</Text>
                </View>
                <Text style={styles.brandName}>AniReserve</Text>
                <Text style={styles.title}>Créer un compte</Text>
                <Text style={styles.subtitle}>Rejoignez AniReserve</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={Colors.gray.medium} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Nom complet"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={Colors.gray.medium} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={Colors.gray.medium} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Mot de passe (min. 6 caractères)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={Colors.gray.medium} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirmer le mot de passe"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>S'inscrire</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.linkText}>
                        Déjà un compte ? <Text style={styles.linkTextBold}>Se connecter</Text>
                    </Text>
                </TouchableOpacity>

                {/* Pro Registration Link */}
                <View style={styles.proSection}>
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>ou</Text>
                        <View style={styles.dividerLine} />
                    </View>
                    <TouchableOpacity
                        style={styles.proButton}
                        onPress={() => router.push('/register-pro')}
                    >
                        <Ionicons name="briefcase" size={20} color={Colors.primary} />
                        <Text style={styles.proButtonText}>Devenir Professionnel</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        padding: Spacing.xl,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    logoText: {
        fontSize: 48,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    brandName: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray.light,
        borderRadius: 12,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        color: Colors.secondary,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: Colors.white,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    linkText: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
    },
    linkTextBold: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    proSection: {
        marginTop: Spacing.xl,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
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
    proButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary + '10',
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 12,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    proButtonText: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});
