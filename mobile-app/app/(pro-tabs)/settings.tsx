import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProSettingsScreen() {
    const router = useRouter();
    const [isAvailable, setIsAvailable] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [instantBooking, setInstantBooking] = useState(false);

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['token', 'user']);
        router.replace('/');
    };

    const handleSave = () => {
        Alert.alert('Sauvegardé', 'Vos paramètres ont été mis à jour');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mon profil</Text>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pro-services')}>
                    <Ionicons name="briefcase-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Mes services</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="person-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Modifier mon profil</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pro-portfolio')}>
                    <Ionicons name="images-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>📸 Mon Portfolio</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Ma bio</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>
            </View>

            {/* Pricing Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mes services & tarifs</Text>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pro-services')}>
                    <Ionicons name="pricetags-outline" size={24} color={Colors.primary} />
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Gérer mes prestations</Text>
                        <Text style={styles.menuSubtext}>Ajouter/modifier vos services et tarifs</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>
            </View>

            {/* Availability Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Disponibilité</Text>

                <View style={styles.switchRow}>
                    <View>
                        <Text style={styles.switchLabel}>Disponible</Text>
                        <Text style={styles.switchDesc}>Apparaître dans les recherches</Text>
                    </View>
                    <Switch
                        value={isAvailable}
                        onValueChange={setIsAvailable}
                        trackColor={{ false: Colors.gray.light, true: Colors.success }}
                    />
                </View>

                <View style={styles.switchRow}>
                    <View>
                        <Text style={styles.switchLabel}>Réservation instantanée</Text>
                        <Text style={styles.switchDesc}>Accepter les RDV automatiquement</Text>
                    </View>
                    <Switch
                        value={instantBooking}
                        onValueChange={setInstantBooking}
                        trackColor={{ false: Colors.gray.light, true: Colors.success }}
                    />
                </View>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pro-schedule')}>
                    <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Gérer mes horaires</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pro-agenda')}>
                    <Ionicons name="today-outline" size={24} color={Colors.primary} />
                    <Text style={styles.menuText}>Mon agenda</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray.medium} />
                </TouchableOpacity>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>

                <View style={styles.switchRow}>
                    <View>
                        <Text style={styles.switchLabel}>Notifications push</Text>
                        <Text style={styles.switchDesc}>Nouvelles réservations, messages</Text>
                    </View>
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: Colors.gray.light, true: Colors.success }}
                    />
                </View>
            </View>

            {/* Save Button */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Sauvegarder les modifications</Text>
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={Colors.error} />
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.lightest,
    },
    section: {
        backgroundColor: Colors.white,
        marginTop: Spacing.md,
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        gap: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.lightest,
    },
    menuText: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.primary,
    },
    menuTextContainer: {
        flex: 1,
        marginLeft: Spacing.sm,
    },
    menuSubtext: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: 2,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputLabel: {
        fontSize: FontSizes.md,
        color: Colors.primary,
    },
    priceInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray.lightest,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
    },
    input: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.primary,
        padding: Spacing.md,
        minWidth: 80,
        textAlign: 'right',
    },
    currency: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.lightest,
    },
    switchLabel: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    switchDesc: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        marginTop: 2,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        padding: Spacing.lg,
    },
    logoutText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.error,
    },
});
