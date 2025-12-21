import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, Shadows } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import { ProProfile } from '../../types';

const FAVORITES_KEY = 'user_favorites';

export default function FavoritesScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<ProProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setIsLoading(true);
        try {
            // Get saved favorite IDs from local storage
            const savedIds = await AsyncStorage.getItem(FAVORITES_KEY);
            if (savedIds) {
                const ids = JSON.parse(savedIds) as string[];

                // Fetch full pro details for each favorite
                const prosResult = await api.getPros();
                if (prosResult.success && prosResult.data) {
                    const favoritePros = prosResult.data.filter(pro => ids.includes(pro.id));
                    setFavorites(favoritePros);
                }
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavorite = async (proId: string) => {
        try {
            const savedIds = await AsyncStorage.getItem(FAVORITES_KEY);
            if (savedIds) {
                const ids = JSON.parse(savedIds) as string[];
                const newIds = ids.filter(id => id !== proId);
                await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newIds));
                setFavorites(prev => prev.filter(p => p.id !== proId));
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer le favori');
        }
    };

    const renderPro = ({ item }: { item: ProProfile }) => {
        const proName = item.user?.name || 'Pro';
        const proImage = item.user?.image;
        const proCategory = item.serviceCategories?.[0]?.name || 'Service';
        const proCity = item.city?.name;
        const proRating = item.reviews?.length > 0
            ? (item.reviews.reduce((acc, r) => acc + r.rating, 0) / item.reviews.length)
            : 5.0;

        return (
            <TouchableOpacity
                style={styles.proCard}
                onPress={() => router.push(`/pro/${item.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.proImageContainer}>
                    {proImage ? (
                        <Image source={{ uri: proImage }} style={styles.proImage} />
                    ) : (
                        <View style={styles.proImagePlaceholder}>
                            <Text style={styles.proInitial}>{proName[0]}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.proInfo}>
                    <Text style={styles.proName}>{proName}</Text>
                    <Text style={styles.proCategory}>{proCategory}</Text>
                    <View style={styles.proMeta}>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.rating}>{proRating.toFixed(1)}</Text>
                        </View>
                        {proCity && (
                            <View style={styles.locationContainer}>
                                <Ionicons name="location-outline" size={14} color={Colors.gray.medium} />
                                <Text style={styles.location}>{proCity}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFavorite(item.id)}
                >
                    <Ionicons name="heart" size={24} color={Colors.error} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Chargement des favoris...</Text>
            </View>
        );
    }

    if (favorites.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={80} color={Colors.gray.light} />
                <Text style={styles.emptyTitle}>Aucun favori</Text>
                <Text style={styles.emptyText}>
                    Ajoutez des professionnels à vos favoris pour les retrouver facilement
                </Text>
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => router.push('/(tabs)')}
                >
                    <Text style={styles.exploreButtonText}>Explorer les pros</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={favorites}
                renderItem={renderPro}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xl,
    },
    emptyTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.secondary,
        marginTop: Spacing.lg,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: Colors.gray.medium,
        textAlign: 'center',
        marginTop: Spacing.sm,
        lineHeight: 22,
    },
    exploreButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: 12,
        marginTop: Spacing.xl,
    },
    exploreButtonText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    list: {
        padding: Spacing.md,
    },
    proCard: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        alignItems: 'center',
        ...Shadows.medium,
    },
    proImageContainer: {
        marginRight: Spacing.md,
    },
    proImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    proImagePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    proInitial: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    proInfo: {
        flex: 1,
    },
    proName: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.secondary,
    },
    proCategory: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        marginTop: 2,
    },
    proMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
        gap: Spacing.md,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.secondary,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: FontSizes.sm,
        color: Colors.gray.medium,
    },
    removeButton: {
        padding: Spacing.sm,
    },
});
