import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../../services/storage';
import { api } from '../../services/api';
import { User } from '../../types';
import { Colors, Spacing, FontSizes } from '../../constants';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await storage.getUser();
        setUser(userData);
        setIsLoading(false);
    };

    const handleChangePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setIsUploading(true);
            const imageBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
            const uploadResult = await api.uploadPhoto(imageBase64);

            if (uploadResult.success && uploadResult.data) {
                const updatedUser = uploadResult.data.user;
                setUser(updatedUser);
                await storage.saveUser(updatedUser);
                Alert.alert('Succès', 'Photo mise à jour !');
            } else {
                Alert.alert('Erreur', uploadResult.error || 'Impossible de changer la photo');
            }
            setIsUploading(false);
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
                    onPress: async () => {
                        await storage.clearAll();
                        api.clearToken();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Utilisateur non trouvé</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
                    <Text style={styles.buttonText}>Retour à la connexion</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} bounces={false}>
            {/* Styled Header */}
            <View style={styles.headerBackground}>
                <View style={styles.headerContent}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarBorder}>
                            {user.image ? (
                                <Image source={{ uri: user.image }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarLetter}>{user.name?.[0] || 'U'}</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.editPhotoButton}
                            onPress={handleChangePhoto}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Ionicons name="camera" size={18} color={Colors.white} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>

                    <View style={styles.badgeRow}>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>Client Premium</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Compte</Text>
                <View style={styles.menuGroup}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
                        <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                            <Ionicons name="person" size={20} color="#4F46E5" />
                        </View>
                        <Text style={styles.menuLabel}>Modifier mon profil</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                            <Ionicons name="notifications" size={20} color="#16A34A" />
                        </View>
                        <Text style={styles.menuLabel}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                            <Ionicons name="shield-checkmark" size={20} color="#EA580C" />
                        </View>
                        <Text style={styles.menuLabel}>Sécurité & Confidentialité</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Support & Infos</Text>
                <View style={styles.menuGroup}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                            <Ionicons name="help-circle" size={20} color="#7C3AED" />
                        </View>
                        <Text style={styles.menuLabel}>Centre d'aide</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#FDF2F8' }]}>
                            <Ionicons name="star" size={20} color="#DB2777" />
                        </View>
                        <Text style={styles.menuLabel}>Noter l'application</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#F8FAFC' }]}>
                            <Ionicons name="information-circle" size={20} color="#475569" />
                        </View>
                        <Text style={styles.menuLabel}>À propos</Text>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <View style={styles.logoutIconBox}>
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    </View>
                    <Text style={styles.logoutBtnText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>AniReserve v1.2.0 • Made with ❤️</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerBackground: {
        paddingTop: 80,
        paddingBottom: 40,
        backgroundColor: '#F9FAFB',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 20,
    },
    avatarBorder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: Colors.white,
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        color: Colors.white,
        fontSize: 44,
        fontWeight: 'bold',
    },
    editPhotoButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.gray.medium,
        marginBottom: 15,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    roleBadge: {
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    contentSection: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 50,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.gray.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
        marginLeft: 5,
    },
    menuGroup: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.secondary,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF1F1',
        borderRadius: 18,
        padding: 16,
        marginTop: 10,
        gap: 12,
    },
    logoutIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#FFE4E4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutBtnText: {
        fontSize: 16,
        color: '#EF4444',
        fontWeight: 'bold',
    },
    footerText: {
        textAlign: 'center',
        fontSize: 12,
        color: Colors.gray.light,
        marginTop: 40,
    },
    errorText: {
        fontSize: 16,
        color: Colors.error,
        marginBottom: 20,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
