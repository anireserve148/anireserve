import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants';
import { api } from '../services/api';
import { storage } from '../services/storage';

export default function DeleteAccountScreen() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        if (!password) {
            Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
            return;
        }

        if (confirmText.toLowerCase() !== 'supprimer') {
            Alert.alert('Erreur', 'Veuillez taper SUPPRIMER pour confirmer');
            return;
        }

        Alert.alert(
            '⚠️ Attention',
            'Cette action est IRRÉVERSIBLE. Toutes vos données seront définitivement supprimées : réservations, messages, photos, etc.\n\nÊtes-vous absolument certain ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer définitivement',
                    style: 'destructive',
                    onPress: performDeletion,
                },
            ]
        );
    };

    const performDeletion = async () => {
        setLoading(true);
        try {
            const result = await api.deleteAccount(password);

            if (result.success) {
                // Clear all local data
                await storage.clearAll();
                api.setToken(null);

                Alert.alert(
                    'Compte supprimé',
                    'Votre compte a été définitivement supprimé.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/'),
                        },
                    ]
                );
            } else {
                Alert.alert('Erreur', result.error || 'La suppression a échoué');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Supprimer mon compte</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Warning Card */}
                <View style={styles.warningCard}>
                    <Ionicons name="warning" size={48} color="#FF4757" />
                    <Text style={styles.warningTitle}>Action irréversible</Text>
                    <Text style={styles.warningText}>
                        La suppression de votre compte entraînera la perte définitive de :
                    </Text>
                </View>

                {/* Data List */}
                <View style={styles.dataList}>
                    <View style={styles.dataItem}>
                        <Ionicons name="person-outline" size={20} color="#FF4757" />
                        <Text style={styles.dataText}>Informations personnelles</Text>
                    </View>
                    <View style={styles.dataItem}>
                        <Ionicons name="calendar-outline" size={20} color="#FF4757" />
                        <Text style={styles.dataText}>Toutes vos réservations</Text>
                    </View>
                    <View style={styles.dataItem}>
                        <Ionicons name="chatbubble-outline" size={20} color="#FF4757" />
                        <Text style={styles.dataText}>Historique des messages</Text>
                    </View>
                    <View style={styles.dataItem}>
                        <Ionicons name="images-outline" size={20} color="#FF4757" />
                        <Text style={styles.dataText}>Photos de profil et galerie</Text>
                    </View>
                    <View style={styles.dataItem}>
                        <Ionicons name="star-outline" size={20} color="#FF4757" />
                        <Text style={styles.dataText}>Avis et évaluations</Text>
                    </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Confirmez votre mot de passe</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.gray.medium} />
                        <TextInput
                            style={styles.input}
                            placeholder="Votre mot de passe"
                            placeholderTextColor={Colors.gray.medium}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Confirmation Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Tapez "SUPPRIMER" pour confirmer</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="text-outline" size={20} color={Colors.gray.medium} />
                        <TextInput
                            style={styles.input}
                            placeholder="SUPPRIMER"
                            placeholderTextColor={Colors.gray.medium}
                            value={confirmText}
                            onChangeText={setConfirmText}
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                    style={[styles.deleteButton, loading && styles.buttonDisabled]}
                    onPress={handleDeleteAccount}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="trash-outline" size={24} color="#fff" />
                            <Text style={styles.deleteButtonText}>Supprimer définitivement</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.black,
    },
    content: {
        padding: Spacing.xl,
    },
    warningCard: {
        backgroundColor: '#FFF5F5',
        borderRadius: 16,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF4757',
        marginBottom: Spacing.xl,
    },
    warningTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: '#FF4757',
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    warningText: {
        fontSize: FontSizes.md,
        color: Colors.gray.darker,
        textAlign: 'center',
        lineHeight: 22,
    },
    dataList: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.xl,
    },
    dataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    dataText: {
        fontSize: FontSizes.md,
        color: Colors.black,
        marginLeft: Spacing.md,
    },
    inputSection: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.black,
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray.light,
    },
    input: {
        flex: 1,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        color: Colors.black,
    },
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: '#FF4757',
        borderRadius: 12,
        padding: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.lg,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    cancelButton: {
        padding: Spacing.lg,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    cancelButtonText: {
        color: Colors.gray.darker,
        fontSize: FontSizes.md,
        fontWeight: '500',
    },
});
