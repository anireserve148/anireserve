import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { User } from '../types';
import { Colors, Spacing, FontSizes } from '../constants';

export default function EditProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await storage.getUser();
        if (userData) {
            setUser(userData);
            setName(userData.name || '');
            setEmail(userData.email || '');
            setPhone((userData as any).phoneNumber || '');
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Le nom est requis');
            return;
        }

        setIsSaving(true);

        const result = await api.updateProfile({
            name: name.trim(),
            phoneNumber: phone.trim() || undefined,
        });

        setIsSaving(false);

        if (result.success && result.data) {
            // Update local storage
            const updatedUser = { ...user, ...result.data };
            await storage.saveUser(updatedUser as User);
            setUser(updatedUser as User);

            Alert.alert('Succès', 'Profil mis à jour !', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } else {
            Alert.alert('Erreur', result.error || 'Impossible de mettre à jour');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier le profil</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{name?.[0] || 'U'}</Text>
                    </View>
                    <Text style={styles.avatarHint}>La photo peut être changée depuis l'onglet Profil</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nom complet *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={Colors.gray.medium} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Votre nom"
                                placeholderTextColor={Colors.gray.medium}
                            />
                        </View>
                    </View>

                    {/* Email (read-only) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputContainer, styles.inputDisabled]}>
                            <Ionicons name="mail-outline" size={20} color={Colors.gray.medium} />
                            <TextInput
                                style={[styles.input, styles.inputTextDisabled]}
                                value={email}
                                editable={false}
                                placeholder="votre@email.com"
                                placeholderTextColor={Colors.gray.medium}
                            />
                            <Ionicons name="lock-closed" size={16} color={Colors.gray.medium} />
                        </View>
                        <Text style={styles.hint}>L'email ne peut pas être modifié</Text>
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Téléphone</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color={Colors.gray.medium} />
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+972 XXX XXX XXXX"
                                placeholderTextColor={Colors.gray.medium}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.infoText}>
                        Les informations de votre profil sont visibles uniquement par les professionnels avec qui vous interagissez.
                    </Text>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                            <Text style={styles.saveButtonText}>Enregistrer</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.light,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        paddingTop: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.white,
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.white,
    },
    avatarHint: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        textAlign: 'center',
    },
    form: {
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray.light,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    inputDisabled: {
        backgroundColor: Colors.gray.light + '80',
    },
    input: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.secondary,
        paddingVertical: Spacing.sm,
    },
    inputTextDisabled: {
        color: Colors.gray.medium,
    },
    hint: {
        fontSize: FontSizes.xs,
        color: Colors.gray.medium,
        marginTop: Spacing.xs,
        fontStyle: 'italic',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: Colors.primary + '10',
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        borderRadius: 12,
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    infoText: {
        flex: 1,
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
        lineHeight: 20,
    },
    footer: {
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray.light,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    saveButtonDisabled: {
        backgroundColor: Colors.gray.medium,
    },
    saveButtonText: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
    },
});
