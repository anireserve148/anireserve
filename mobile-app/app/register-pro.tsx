import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import { Colors, Spacing, FontSizes } from '../constants';

interface City {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    parentId?: string | null;
}

export default function RegisterProScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [cities, setCities] = useState<City[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [idPhotoUri, setIdPhotoUri] = useState<string | null>(null);
    const [idPhotoUrl, setIdPhotoUrl] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const citiesResult = await api.getCities();
        if (citiesResult.success && citiesResult.data) {
            setCities(citiesResult.data);
        }

        const categoriesResult = await api.getCategories();
        if (categoriesResult.success && categoriesResult.data) {
            setCategories(categoriesResult.data);
        }
    };

    const toggleCity = (cityId: string) => {
        setSelectedCities(prev =>
            prev.includes(cityId)
                ? prev.filter(id => id !== cityId)
                : [...prev, cityId]
        );
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à vos photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setIdPhotoUri(result.assets[0].uri);
            await uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                type: 'image/jpeg',
                name: 'id_photo.jpg',
            } as any);

            const response = await fetch(`${api.baseUrl}/api/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIdPhotoUrl(data.url);
                Alert.alert('Succès', 'Photo téléchargée');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de télécharger la photo');
            setIdPhotoUri(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRegister = async () => {
        // Validation
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (selectedCities.length === 0) {
            Alert.alert('Erreur', 'Sélectionnez au moins une ville');
            return;
        }

        if (selectedCategories.length === 0) {
            Alert.alert('Erreur', 'Sélectionnez au moins une catégorie');
            return;
        }

        if (!idPhotoUrl) {
            Alert.alert('Erreur', 'La photo de Teoudat Zehut est requise');
            return;
        }

        setIsLoading(true);

        const result = await api.submitProApplication({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password,
            cityIds: selectedCities,
            categoryIds: selectedCategories,
            idPhotoUrl,
        });

        setIsLoading(false);

        if (result.success) {
            Alert.alert(
                'Demande envoyée ! ✅',
                'Votre candidature a été enregistrée. Un administrateur la validera sous 24-48h. Vous recevrez un email de confirmation.',
                [{ text: 'OK', onPress: () => router.replace('/login') }]
            );
        } else {
            Alert.alert('Erreur', result.error || 'Impossible de soumettre la candidature');
        }
    };

    const parentCategories = categories.filter(c => !c.parentId);

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
                <Text style={styles.headerTitle}>Devenir Pro</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="briefcase" size={24} color={Colors.primary} />
                    <Text style={styles.infoBannerText}>
                        Rejoignez AniReserve et développez votre activité ! 🚀
                    </Text>
                </View>

                {/* Section 1: Personal Info */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionNumber}>
                            <Text style={styles.sectionNumberText}>1</Text>
                        </View>
                        <Text style={styles.sectionTitle}>Informations Personnelles</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Prénom *</Text>
                            <TextInput
                                style={styles.input}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Votre prénom"
                                placeholderTextColor={Colors.gray.medium}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Nom *</Text>
                            <TextInput
                                style={styles.input}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Votre nom"
                                placeholderTextColor={Colors.gray.medium}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="votre@email.com"
                            placeholderTextColor={Colors.gray.medium}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Téléphone *</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="05X-XXX-XXXX"
                            placeholderTextColor={Colors.gray.medium}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Mot de passe *</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Min. 6 caractères"
                                    placeholderTextColor={Colors.gray.medium}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={Colors.gray.medium}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Confirmer *</Text>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Répétez"
                                placeholderTextColor={Colors.gray.medium}
                                secureTextEntry={!showPassword}
                            />
                        </View>
                    </View>
                </View>

                {/* Section 2: Cities & Services */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionNumber}>
                            <Text style={styles.sectionNumberText}>2</Text>
                        </View>
                        <Text style={styles.sectionTitle}>Villes & Services</Text>
                    </View>

                    <Text style={styles.label}>Villes de travail *</Text>
                    <View style={styles.checkboxGrid}>
                        {cities.map(city => (
                            <TouchableOpacity
                                key={city.id}
                                style={[
                                    styles.checkboxItem,
                                    selectedCities.includes(city.id) && styles.checkboxItemSelected
                                ]}
                                onPress={() => toggleCity(city.id)}
                            >
                                <Ionicons
                                    name={selectedCities.includes(city.id) ? 'checkbox' : 'square-outline'}
                                    size={20}
                                    color={selectedCities.includes(city.id) ? Colors.primary : Colors.gray.medium}
                                />
                                <Text style={[
                                    styles.checkboxLabel,
                                    selectedCities.includes(city.id) && styles.checkboxLabelSelected
                                ]}>
                                    {city.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { marginTop: Spacing.lg }]}>Catégories de service *</Text>
                    <View style={styles.checkboxGrid}>
                        {parentCategories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.checkboxItem,
                                    selectedCategories.includes(cat.id) && styles.checkboxItemSelected
                                ]}
                                onPress={() => toggleCategory(cat.id)}
                            >
                                <Ionicons
                                    name={selectedCategories.includes(cat.id) ? 'checkbox' : 'square-outline'}
                                    size={20}
                                    color={selectedCategories.includes(cat.id) ? Colors.primary : Colors.gray.medium}
                                />
                                <Text style={[
                                    styles.checkboxLabel,
                                    selectedCategories.includes(cat.id) && styles.checkboxLabelSelected
                                ]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section 3: ID Document */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionNumber}>
                            <Text style={styles.sectionNumberText}>3</Text>
                        </View>
                        <Text style={styles.sectionTitle}>Document d'Identité</Text>
                    </View>

                    <Text style={styles.label}>Photo de votre Teoudat Zehut *</Text>
                    <TouchableOpacity style={styles.uploadArea} onPress={pickImage} disabled={isUploading}>
                        {isUploading ? (
                            <View style={styles.uploadPlaceholder}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                                <Text style={styles.uploadText}>Téléchargement...</Text>
                            </View>
                        ) : idPhotoUri ? (
                            <View style={styles.imagePreview}>
                                <Image source={{ uri: idPhotoUri }} style={styles.previewImage} resizeMode="cover" />
                                <TouchableOpacity
                                    style={styles.changeButton}
                                    onPress={() => {
                                        setIdPhotoUri(null);
                                        setIdPhotoUrl('');
                                    }}
                                >
                                    <Text style={styles.changeButtonText}>Changer la photo</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <Ionicons name="cloud-upload-outline" size={48} color={Colors.gray.medium} />
                                <Text style={styles.uploadText}>Appuyez pour sélectionner une photo</Text>
                                <Text style={styles.uploadSubtext}>Format accepté : JPG, PNG (max 5MB)</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                            <Text style={styles.submitButtonText}>Soumettre ma candidature</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.termsText}>
                    En soumettant ce formulaire, vous acceptez nos conditions générales d'utilisation pour les professionnels.
                </Text>

                {/* Login Link */}
                <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
                    <Text style={styles.loginLinkText}>
                        Déjà un compte ? <Text style={styles.loginLinkBold}>Se connecter</Text>
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
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
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '15',
        padding: Spacing.md,
        margin: Spacing.md,
        borderRadius: 12,
        gap: Spacing.sm,
    },
    infoBannerText: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.primary,
        fontWeight: '600',
    },
    section: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        borderRadius: 16,
        padding: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    sectionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionNumberText: {
        color: Colors.white,
        fontSize: FontSizes.sm,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfInput: {
        flex: 1,
        marginBottom: Spacing.md,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.gray.light,
        borderRadius: 10,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        color: Colors.secondary,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray.light,
        borderRadius: 10,
        paddingHorizontal: Spacing.md,
    },
    passwordInput: {
        flex: 1,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        color: Colors.secondary,
    },
    checkboxGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray.light,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: 8,
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    checkboxItemSelected: {
        backgroundColor: Colors.primary + '15',
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    checkboxLabel: {
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
    },
    checkboxLabelSelected: {
        color: Colors.primary,
        fontWeight: '600',
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: Colors.gray.light,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: Spacing.lg,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    uploadPlaceholder: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    uploadText: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
    },
    uploadSubtext: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    imagePreview: {
        width: '100%',
        alignItems: 'center',
        gap: Spacing.md,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    changeButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.gray.light,
        borderRadius: 8,
    },
    changeButtonText: {
        fontSize: FontSizes.sm,
        color: Colors.secondary,
        fontWeight: '600',
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: Colors.secondary,
        marginHorizontal: Spacing.md,
        padding: Spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    submitButtonDisabled: {
        backgroundColor: Colors.gray.medium,
    },
    submitButtonText: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
    },
    termsText: {
        fontSize: FontSizes.xs,
        color: Colors.gray.medium,
        textAlign: 'center',
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        lineHeight: 18,
    },
    loginLink: {
        alignItems: 'center',
        padding: Spacing.lg,
    },
    loginLinkText: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
    },
    loginLinkBold: {
        fontWeight: 'bold',
        color: Colors.primary,
    },
});
