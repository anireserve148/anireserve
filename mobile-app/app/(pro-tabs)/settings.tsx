import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProColors, Spacing, FontSizes, Shadows } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { LinearGradient } from 'expo-linear-gradient';

interface MenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    route?: string;
    badge?: string;
    onPress?: () => void;
}

export default function ProSettingsScreen() {
    const router = useRouter();
    const [isAvailable, setIsAvailable] = useState(true);
    const [instantBooking, setInstantBooking] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await storage.getUser();
        setUser(userData);
        setLoading(false);
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
                    onPress: async () => {
                        await AsyncStorage.multiRemove(['token', 'user']);
                        api.setToken(null);
                        router.replace('/');
                    },
                },
            ]
        );
    };

    const renderMenuItem = (item: MenuItem, isLast: boolean = false) => (
        <TouchableOpacity
            key={item.title}
            style={[styles.menuItem, !isLast && styles.menuItemBorder]}
            onPress={item.onPress || (() => item.route && router.push(item.route as any))}
        >
            <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={22} color={ProColors.primary} />
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
            </View>
            {item.badge && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={ProColors.textMuted} />
        </TouchableOpacity>
    );

    const renderToggle = (
        icon: keyof typeof Ionicons.glyphMap,
        title: string,
        subtitle: string,
        value: boolean,
        onValueChange: (val: boolean) => void,
        isLast: boolean = false
    ) => (
        <View style={[styles.toggleRow, !isLast && styles.menuItemBorder]}>
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={22} color={ProColors.primary} />
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: ProColors.border, true: ProColors.primary }}
                thumbColor={value ? '#fff' : '#f4f3f4'}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ProColors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header with Profile */}
            <LinearGradient
                colors={[ProColors.primary, ProColors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => router.push('/edit-pro-profile')}
                    >
                        {user?.image ? (
                            <Image source={{ uri: user.image }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={40} color="#fff" />
                            </View>
                        )}
                        <View style={styles.editBadge}>
                            <Ionicons name="pencil" size={12} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>{user?.name || 'Professionnel'}</Text>
                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                    <View style={styles.proTag}>
                        <Ionicons name="star" size={14} color={ProColors.accent} />
                        <Text style={styles.proTagText}>Compte Pro</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>--</Text>
                    <Text style={styles.statLabel}>Réservations</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>--</Text>
                    <Text style={styles.statLabel}>Ce mois</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>⭐ --</Text>
                    <Text style={styles.statLabel}>Note</Text>
                </View>
            </View>

            {/* Profile Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Mon Profil</Text>
                <View style={styles.card}>
                    {renderMenuItem({ icon: 'person-outline', title: 'Modifier mon profil', subtitle: 'Nom, photo, informations', route: '/edit-pro-profile' })}
                    {renderMenuItem({ icon: 'images-outline', title: 'Mon Portfolio', subtitle: 'Photos de mes réalisations', route: '/pro-portfolio' })}
                    {renderMenuItem({ icon: 'document-text-outline', title: 'Ma bio', subtitle: 'Description de mon activité', route: '/edit-pro-profile' }, true)}
                </View>
            </View>

            {/* Services Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💼 Services & Tarifs</Text>
                <View style={styles.card}>
                    {renderMenuItem({ icon: 'pricetags-outline', title: 'Gérer mes prestations', subtitle: 'Ajouter, modifier prix et durées', route: '/pro-services' }, true)}
                </View>
            </View>

            {/* Availability Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 Disponibilité</Text>
                <View style={styles.card}>
                    {renderToggle('checkmark-circle-outline', 'Disponible', 'Visible dans les recherches', isAvailable, setIsAvailable)}
                    {renderToggle('flash-outline', 'Réservation instantanée', 'Accepter les RDV automatiquement', instantBooking, setInstantBooking)}
                    {renderMenuItem({ icon: 'time-outline', title: 'Gérer mes horaires', subtitle: 'Définir mes plages horaires', route: '/pro-schedule' })}
                    {renderMenuItem({ icon: 'calendar-outline', title: 'Mon agenda', subtitle: 'Voir tous mes RDV', route: '/pro-agenda' }, true)}
                </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔔 Notifications</Text>
                <View style={styles.card}>
                    {renderToggle('notifications-outline', 'Notifications push', 'Nouvelles réservations, messages', notifications, setNotifications, true)}
                </View>
            </View>

            {/* Support Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ℹ️ Aide & Support</Text>
                <View style={styles.card}>
                    {renderMenuItem({ icon: 'help-circle-outline', title: 'Centre d\'aide', subtitle: 'FAQ et guides' })}
                    {renderMenuItem({ icon: 'chatbubble-ellipses-outline', title: 'Nous contacter', subtitle: 'Support par email' })}
                    {renderMenuItem({ icon: 'document-outline', title: 'Conditions d\'utilisation' })}
                    {renderMenuItem({ icon: 'shield-outline', title: 'Politique de confidentialité' }, true)}
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#FF4757" />
                <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.version}>AniReserve Pro v1.0.0</Text>

            <View style={{ height: 100 }} />
        </ScrollView>
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
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: ProColors.accent,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: ProColors.primary,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: FontSizes.sm,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: Spacing.sm,
    },
    proTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 20,
        gap: 6,
    },
    proTagText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: ProColors.card,
        marginHorizontal: Spacing.lg,
        marginTop: -20,
        borderRadius: 16,
        padding: Spacing.lg,
        ...Shadows.medium,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: ProColors.text,
    },
    statLabel: {
        fontSize: FontSizes.xs,
        color: ProColors.textMuted,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: ProColors.border,
        marginVertical: 4,
    },
    section: {
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: ProColors.textSecondary,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    card: {
        backgroundColor: ProColors.card,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: ProColors.border,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: ProColors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: ProColors.text,
    },
    menuSubtitle: {
        fontSize: FontSizes.sm,
        color: ProColors.textMuted,
        marginTop: 2,
    },
    badge: {
        backgroundColor: ProColors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: Spacing.sm,
    },
    badgeText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: '#fff',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.xl,
        padding: Spacing.lg,
        backgroundColor: 'rgba(255, 71, 87, 0.1)',
        borderRadius: 16,
        gap: Spacing.sm,
    },
    logoutText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: '#FF4757',
    },
    version: {
        textAlign: 'center',
        marginTop: Spacing.lg,
        fontSize: FontSizes.sm,
        color: ProColors.textMuted,
    },
});
