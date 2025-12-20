import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { ProProfile } from '../../types';
import { Colors, Spacing, FontSizes } from '../../constants';

export default function ProDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [pro, setPro] = useState<ProProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (id) {
            loadPro();
            checkFavorite();
        }
    }, [id]);

    const loadPro = async () => {
        setIsLoading(true);
        const result = await api.getProById(id as string);
        if (result.success && result.data) {
            setPro(result.data);
        } else {
            Alert.alert('Erreur', result.error || 'Professionnel non trouvé');
            router.back();
        }
        setIsLoading(false);
    };

    const checkFavorite = async () => {
        const result = await api.getFavorites();
        if (result.success && result.data) {
            setIsFavorite(result.data.some(f => f.id === id));
        }
    };

    const toggleFavorite = async () => {
        if (isFavorite) {
            const result = await api.removeFavorite(id as string);
            if (result.success) {
                setIsFavorite(false);
                Alert.alert('Supprimé', 'Retiré des favoris');
            }
        } else {
            const result = await api.addFavorite(id as string);
            if (result.success) {
                setIsFavorite(true);
                Alert.alert('Ajouté', 'Ajouté aux favoris');
            }
        }
    };

    const handleBook = () => {
        router.push({
            pathname: '/quick-book',
            params: {
                id: id as string,
                name: pro?.user?.name || 'Pro',
                rate: String(pro?.hourlyRate || 100),
            },
        });
    };

    const handleQuickBook = () => {
        router.push({
            pathname: '/quick-book',
            params: {
                id: id as string,
                name: pro?.user?.name || 'Pro',
                rate: String(pro?.hourlyRate || 100),
            },
        });
    };

    const handleContact = async () => {
        if (!pro?.user?.id) {
            Alert.alert('Erreur', 'Professionnel non trouvé');
            return;
        }
        // Create or get existing conversation
        const result = await api.createConversation(pro.user.id);
        if (result.success && result.data?.id) {
            router.push(`/chat/${result.data.id}`);
        } else {
            Alert.alert('Erreur', 'Impossible de démarrer la conversation');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!pro) {
        return null;
    }

    const avgRating = pro.reviews.length > 0
        ? pro.reviews.reduce((sum, r) => sum + r.rating, 0) / pro.reviews.length
        : 0;

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite ? Colors.error : Colors.white}
                    />
                </TouchableOpacity>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{pro.user.name?.[0] || 'P'}</Text>
                </View>
                <Text style={styles.proName}>{pro.user.name}</Text>
                <View style={styles.location}>
                    <Ionicons name="location" size={16} color={Colors.white} />
                    <Text style={styles.locationText}>{pro.city.name}</Text>
                </View>
                {avgRating > 0 && (
                    <View style={styles.rating}>
                        <Ionicons name="star" size={20} color={Colors.accent} />
                        <Text style={styles.ratingText}>
                            {avgRating.toFixed(1)} ({pro.reviews.length} avis)
                        </Text>
                    </View>
                )}
            </View>

            {/* Info Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>À propos</Text>
                <Text style={styles.bio}>{pro.bio || 'Aucune description disponible'}</Text>

                <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={20} color={Colors.primary} />
                    <Text style={styles.infoText}>{pro.hourlyRate}₪/heure</Text>
                </View>

                {pro.user.phoneNumber && (
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color={Colors.primary} />
                        <Text style={styles.infoText}>{pro.user.phoneNumber}</Text>
                    </View>
                )}
            </View>

            {/* Categories */}
            {pro.serviceCategories.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Catégories</Text>
                    <View style={styles.categories}>
                        {pro.serviceCategories.map((cat) => (
                            <View key={cat.id} style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{cat.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Reviews */}
            {pro.reviews.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Avis ({pro.reviews.length})</Text>
                    {pro.reviews.slice(0, 3).map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewAuthor}>{review.client.name}</Text>
                                <View style={styles.reviewRating}>
                                    <Ionicons name="star" size={16} color={Colors.accent} />
                                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                                </View>
                            </View>
                            {review.comment && (
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            )}
                            <Text style={styles.reviewDate}>
                                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                    <Ionicons name="chatbubble" size={24} color={Colors.primary} />
                    <Text style={styles.contactButtonText}>Contacter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
                    <Ionicons name="calendar" size={24} color={Colors.white} />
                    <Text style={styles.bookButtonText}>Réserver</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
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
    },
    header: {
        backgroundColor: Colors.primary,
        padding: Spacing.xl,
        paddingTop: 60,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: Spacing.md,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        position: 'absolute',
        top: 50,
        right: Spacing.md,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    proName: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: Spacing.sm,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    locationText: {
        fontSize: FontSizes.md,
        color: Colors.white,
        marginLeft: Spacing.xs,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
    },
    ratingText: {
        fontSize: FontSizes.md,
        color: Colors.white,
        marginLeft: Spacing.sm,
        fontWeight: 'bold',
    },
    section: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.light,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: Spacing.md,
    },
    bio: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
        lineHeight: 24,
        marginBottom: Spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    infoText: {
        fontSize: FontSizes.md,
        color: Colors.gray.dark,
        marginLeft: Spacing.sm,
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    categoryBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
    },
    categoryText: {
        fontSize: FontSizes.md,
        color: Colors.primary,
        fontWeight: '600',
    },
    reviewCard: {
        backgroundColor: Colors.gray.light,
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.md,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    reviewAuthor: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewRatingText: {
        fontSize: FontSizes.md,
        color: Colors.accent,
        marginLeft: Spacing.xs,
        fontWeight: 'bold',
    },
    reviewComment: {
        fontSize: FontSizes.sm,
        color: Colors.gray.dark,
        lineHeight: 20,
        marginBottom: Spacing.sm,
    },
    reviewDate: {
        fontSize: FontSizes.xs,
        color: Colors.gray.medium,
    },
    actionButtons: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.lg,
        gap: Spacing.md,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.primary,
        padding: Spacing.lg,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactButtonText: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        color: Colors.primary,
        marginLeft: Spacing.sm,
    },
    bookButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    bookButtonText: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        color: Colors.white,
        marginLeft: Spacing.sm,
    },
});
