import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Colors, Spacing, FontSizes } from '../constants';

export default function LeaveReviewScreen() {
    const { reservationId, proName } = useLocalSearchParams();
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Erreur', 'Veuillez sélectionner une note');
            return;
        }

        setIsLoading(true);
        try {
            const result = await api.createReview({
                reservationId: reservationId as string,
                rating,
                comment,
            });

            if (result.success) {
                Alert.alert('Merci !', 'Votre avis a été publié avec succès.', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Erreur', result.error || 'Impossible de publier l\'avis');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Donner mon avis</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.proInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{proName ? (proName as string)[0] : 'P'}</Text>
                    </View>
                    <Text style={styles.proName}>{proName}</Text>
                    <Text style={styles.subText}>Comment s'est passé votre rendez-vous ?</Text>
                </View>

                <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={44}
                                color={star <= rating ? "#F59E0B" : Colors.gray.light}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Votre commentaire (facultatif)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Racontez-nous votre expérience..."
                        placeholderTextColor={Colors.gray.medium}
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Publier mon avis</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
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
        paddingTop: 50,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.primary,
    },
    content: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    proInfo: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.gray.lightest,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    proName: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.xs,
    },
    subText: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xxl,
    },
    inputContainer: {
        width: '100%',
        marginBottom: Spacing.xxl,
    },
    label: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.gray.dark,
        marginBottom: Spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.gray.light,
        borderRadius: 12,
        padding: Spacing.md,
        minHeight: 120,
        fontSize: FontSizes.md,
        color: Colors.secondary,
        backgroundColor: Colors.gray.lightest,
    },
    submitButton: {
        width: '100%',
        backgroundColor: Colors.accent,
        borderRadius: 12,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.white,
    },
});
