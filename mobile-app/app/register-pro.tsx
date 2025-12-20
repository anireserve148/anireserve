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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { Colors, Spacing, FontSizes } from '../constants';

interface City {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
}

export default function RegisterProScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [cities, setCities] = useState<City[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [cityId, setCityId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [bio, setBio] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Load cities
        const citiesResult = await api.getCities();
        if (citiesResult.success && citiesResult.data) {
            setCities(citiesResult.data);
        }

        // Load categories
        const categoriesResult = await api.getCategories();
        if (categoriesResult.success && categoriesResult.data) {
            setCategories(categoriesResult.data);
        }
    };

    const handleRegister = async () => {
        // Validation
        if (!name.trim() || !email.trim() || !password || !phone.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        if (!cityId) {
            Alert.alert('Erreur', 'Veuillez sélectionner une ville');
            return;
        }

        if (!categoryId) {
            Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
            return;
        }

        setIsLoading(true);

        const result = await api.registerPro({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phoneNumber: phone.trim(),
            cityId,
            categoryId,
            bio: bio.trim(),
            hourlyRate: parseFloat(hourlyRate) || 100,
        });

        setIsLoading(false);

        if (result.success && result.data) {
            Alert.alert(
                'Inscription envoyée !',
                'Votre demande a été enregistrée. Un administrateur la validera sous 24-48h.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );
        } else {
            Alert.alert('Erreur', result.error || 'Impossible de créer le compte');
        }
    };

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

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={Colors.gray.medium} />
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
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Téléphone *</Text>
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

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mot de passe *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.gray.medium} />
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Min. 8 caractères"
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

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmer le mot de passe *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.gray.medium} />
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Répétez le mot de passe"
                                placeholderTextColor={Colors.gray.medium}
                                secureTextEntry={!showPassword}
                            />
                        </View>
                    </View>

                    {/* City Picker */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ville *</Text>
                        <View style={styles.pickerContainer}>
                            <Ionicons name="location-outline" size={20} color={Colors.gray.medium} />
                            <Picker
                                selectedValue={cityId}
                                onValueChange={setCityId}
                                style={styles.picker}
                            >
                                <Picker.Item label="Sélectionnez une ville" value="" />
                                {cities.map((city) => (
                                    <Picker.Item key={city.id} label={city.name} value={city.id} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Category Picker */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Catégorie *</Text>
                        <View style={styles.pickerContainer}>
                            <Ionicons name="grid-outline" size={20} color={Colors.gray.medium} />
                            <Picker
                                selectedValue={categoryId}
                                onValueChange={setCategoryId}
                                style={styles.picker}
                            >
                                <Picker.Item label="Sélectionnez une catégorie" value="" />
                                {categories.map((cat) => (
                                    <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Hourly Rate */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tarif horaire (₪)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="cash-outline" size={20} color={Colors.gray.medium} />
                            <TextInput
                                style={styles.input}
                                value={hourlyRate}
                                onChangeText={setHourlyRate}
                                placeholder="100"
                                placeholderTextColor={Colors.gray.medium}
                                keyboardType="numeric"
                            />
                            <Text style={styles.currency}>₪/h</Text>
                        </View>
                    </View>

                    {/* Bio */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio / Description</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Décrivez votre expérience et vos services..."
                                placeholderTextColor={Colors.gray.medium}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </View>

                {/* Terms */}
                <View style={styles.termsContainer}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.gray.medium} />
                    <Text style={styles.termsText}>
                        En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                    </Text>
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                            <Text style={styles.registerButtonText}>S'inscrire comme Pro</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Login Link */}
                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => router.push('/login')}
                >
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
        backgroundColor: Colors.gray.light,
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
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '10',
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
    form: {
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        marginHorizontal: Spacing.md,
        borderRadius: 16,
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
    input: {
        flex: 1,
        fontSize: FontSizes.md,
        color: Colors.secondary,
        paddingVertical: Spacing.sm,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray.light,
        borderRadius: 12,
        paddingLeft: Spacing.md,
    },
    picker: {
        flex: 1,
        height: 50,
    },
    currency: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        fontWeight: 'bold',
    },
    textAreaContainer: {
        alignItems: 'flex-start',
        paddingVertical: Spacing.md,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    termsText: {
        flex: 1,
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
        lineHeight: 20,
    },
    registerButton: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        marginHorizontal: Spacing.md,
        padding: Spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    registerButtonDisabled: {
        backgroundColor: Colors.gray.medium,
    },
    registerButtonText: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
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
