import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api, Colors, Spacing, BorderRadius, Shadows, type User } from '../src/shared/src';

export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await api.getProfile();
            if (response.data) {
                setUser(response.data);
                setName(response.data.name);
                setPhone(response.data.phone || '');
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.updateProfile({ name, phone });
            Alert.alert('Succès', 'Profil mis à jour');
            setEditing(false);
            loadProfile();
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: () => {
                        api.setToken(null);
                        router.replace('/');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil</Text>
                <TouchableOpacity onPress={() => setEditing(!editing)}>
                    <Text style={styles.editButton}>{editing ? 'Annuler' : 'Modifier'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color={Colors.white} />
                    </View>
                    {user && (
                        <Text style={styles.email}>{user.email}</Text>
                    )}
                </View>

                {/* Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nom</Text>
                        <TextInput
                            style={[styles.input, !editing && styles.inputDisabled]}
                            value={name}
                            onChangeText={setName}
                            editable={editing}
                            placeholder="Votre nom"
                            placeholderTextColor={Colors.textTertiary}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Téléphone</Text>
                        <TextInput
                            style={[styles.input, !editing && styles.inputDisabled]}
                            value={phone}
                            onChangeText={setPhone}
                            editable={editing}
                            placeholder="Votre numéro"
                            placeholderTextColor={Colors.textTertiary}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {editing && (
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.saveButtonText}>
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="star-outline" size={22} color={Colors.text} />
                        <Text style={styles.menuText}>Mes favoris</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="card-outline" size={22} color={Colors.text} />
                        <Text style={styles.menuText}>Moyens de paiement</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="settings-outline" size={22} color={Colors.text} />
                        <Text style={styles.menuText}>Paramètres</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
    },
    editButton: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.accent,
    },
    content: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        backgroundColor: Colors.white,
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    email: {
        fontSize: 15,
        color: Colors.textSecondary,
    },
    section: {
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: Colors.gray[300],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        color: Colors.text,
        backgroundColor: Colors.white,
    },
    inputDisabled: {
        backgroundColor: Colors.backgroundSecondary,
        borderColor: Colors.gray[200],
    },
    saveButton: {
        backgroundColor: Colors.accent,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        gap: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    logoutButton: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.lg,
        marginVertical: Spacing.lg,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.error,
    },
});
