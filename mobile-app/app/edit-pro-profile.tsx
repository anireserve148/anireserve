import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { ProColors, Spacing, FontSizes } from '../constants';

export default function EditProProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        phoneNumber: '',
        bio: '',
        hourlyRate: 0,
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await api.getProProfile();
            if (response) {
                setProfile({
                    name: response.name || '',
                    phoneNumber: response.phoneNumber || '',
                    bio: response.proProfile?.bio || '',
                    hourlyRate: response.proProfile?.hourlyRate || 0,
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Erreur', 'Impossible de charger le profil');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await api.updateProProfile({
                name: profile.name,
                phoneNumber: profile.phoneNumber,
                bio: profile.bio,
                hourlyRate: profile.hourlyRate,
            });

            if (result.success) {
                Alert.alert('Succès', 'Profil mis à jour avec succès', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Erreur', result.error || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ProColors.accent} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={ProColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Modifier mon profil</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nom complet</Text>
                        <TextInput
                            style={styles.input}
                            value={profile.name}
                            onChangeText={(text) => setProfile({ ...profile, name: text })}
                            placeholder="Votre nom"
                            placeholderTextColor={ProColors.textMuted}
                        />
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Téléphone</Text>
                        <TextInput
                            style={styles.input}
                            value={profile.phoneNumber}
                            onChangeText={(text) => setProfile({ ...profile, phoneNumber: text })}
                            placeholder="Votre téléphone"
                            placeholderTextColor={ProColors.textMuted}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Hourly Rate */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tarif horaire (₪)</Text>
                        <TextInput
                            style={styles.input}
                            value={profile.hourlyRate.toString()}
                            onChangeText={(text) => setProfile({ ...profile, hourlyRate: parseInt(text) || 0 })}
                            placeholder="0"
                            placeholderTextColor={ProColors.textMuted}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Bio */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio / Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={profile.bio}
                            onChangeText={(text) => setProfile({ ...profile, bio: text })}
                            placeholder="Décrivez votre activité, votre expérience..."
                            placeholderTextColor={ProColors.textMuted}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Sauvegarder</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ProColors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ProColors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        backgroundColor: ProColors.card,
        borderBottomWidth: 1,
        borderBottomColor: ProColors.border,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: ProColors.text,
    },
    form: {
        padding: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: ProColors.textMuted,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: ProColors.card,
        borderRadius: 12,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        color: ProColors.text,
        borderWidth: 1,
        borderColor: ProColors.border,
    },
    textArea: {
        height: 120,
        paddingTop: Spacing.md,
    },
    saveButton: {
        backgroundColor: ProColors.accent,
        marginHorizontal: Spacing.lg,
        borderRadius: 12,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
});
