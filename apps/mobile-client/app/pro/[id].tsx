import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
    api,
    Colors,
    Spacing,
    BorderRadius,
    Shadows,
    type ProProfile,
    type Review,
} from '@anireserve/shared';

const { width } = Dimensions.get('window');

export default function ProDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [pro, setPro] = useState<ProProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPro();
    }, [id]);

    const loadPro = async () => {
        try {
            const [proResponse, reviewsResponse] = await Promise.all([
                api.getProById(id),
                api.getProReviews(id),
            ]);
            setPro(proResponse.data || null);
            setReviews(reviewsResponse.data || []);
        } catch (error) {
            console.error('Failed to load pro:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!pro) return null;

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <ScrollView>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: pro.photos[0] || 'https://via.placeholder.com/400' }}
                        style={styles.headerImage}
                    />
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Info */}
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.name}>{pro.businessName}</Text>
                            {pro.verified && (
                                <Ionicons name="checkmark-circle" size={24} color={Colors.info} />
                            )}
                        </View>
                        <View style={styles.rating}>
                            <Ionicons name="star" size={20} color="#FFB800" />
                            <Text style={styles.ratingText}>
                                {pro.rating.toFixed(1)} ({pro.reviewCount} avis)
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>{pro.description}</Text>

                    {/* Location */}
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{pro.city}</Text>
                    </View>

                    {/* Photos Gallery */}
                    {pro.photos.length > 1 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Galerie</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.gallery}>
                                    {pro.photos.slice(1).map((photo, index) => (
                                        <Image
                                            key={index}
                                            source={{ uri: photo }}
                                            style={styles.galleryImage}
                                        />
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {/* Reviews */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Avis clients</Text>
                        {reviews.slice(0, 3).map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewName}>
                                        {review.client?.name || 'Client'}
                                    </Text>
                                    <View style={styles.reviewRating}>
                                        {[...Array(5)].map((_, i) => (
                                            <Ionicons
                                                key={i}
                                                name={i < review.rating ? 'star' : 'star-outline'}
                                                size={14}
                                                color="#FFB800"
                                            />
                                        ))}
                                    </View>
                                </View>
                                {review.comment && (
                                    <Text style={styles.reviewComment}>{review.comment}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Book Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => router.push(`/booking/${id}`)}
                >
                    <Text style={styles.bookButtonText}>Réserver</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    imageContainer: {
        position: 'relative',
    },
    headerImage: {
        width,
        height: 300,
        backgroundColor: Colors.gray[200],
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: Spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: Spacing.lg,
    },
    header: {
        marginBottom: Spacing.md,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    name: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    infoText: {
        fontSize: 15,
        color: Colors.textSecondary,
    },
    section: {
        marginTop: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    gallery: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    galleryImage: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[200],
    },
    reviewCard: {
        padding: Spacing.md,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    reviewName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
    },
    reviewRating: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewComment: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
    },
    bookButton: {
        backgroundColor: Colors.accent,
        height: 56,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    bookButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.white,
    },
});
