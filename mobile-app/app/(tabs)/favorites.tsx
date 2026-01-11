import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { api } from '../../services/api';
import { ProProfile } from '../../types';
import LottieView from 'lottie-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function FavoritesScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<ProProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setIsLoading(true);
        const result = await api.getFavorites();
        if (result.success && result.data) {
            setFavorites(result.data);
        }
        setIsLoading(false);
    };

    const handleToggleFavorite = async (proId: string) => {
        const result = await api.removeFavorite(proId);
        if (result.success) {
            setFavorites((prev: ProProfile[]) => prev.filter((p: ProProfile) => p.id !== proId));
        } else {
            Alert.alert('Erreur', 'Impossible de retirer des favoris');
        }
    };

    const renderPro = ({ item }: { item: ProProfile }) => {
        const avgRating = item.reviews.length > 0
            ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
            : 0;
        const coverImage = item.gallery?.[0]?.imageUrl;

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    onPress={() => router.push(`/pro/${item.id}`)}
                    activeOpacity={0.95}
                >
                    {coverImage ? (
                        <Image source={{ uri: coverImage }} style={styles.cardImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.cardImage, styles.placeholderImage]}>
                            <Ionicons name="person" size={60} color={Colors.gray.medium} />
                        </View>
                    )}
                    {avgRating > 0 && (
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.infoSection}
                    onPress={() => router.push(`/pro/${item.id}`)}
                >
                    <View style={styles.nameRow}>
                        <View>
                            <Text style={styles.proName}>{item.user.name}</Text>
                            <View style={styles.locationBadge}>
                                <Ionicons name="location" size={12} color={Colors.gray.medium} />
                                <Text style={styles.cityText}>{item.city.name}</Text>
                            </View>
                        </View>
                        <Text style={styles.priceTag}>{item.hourlyRate}₪/h</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={styles.footerAction}
                        onPress={() => handleToggleFavorite(item.id)}
                    >
                        <Ionicons name="heart" size={24} color="#FF3B5C" />
                        <Text style={[styles.footerActionText, { color: '#FF3B5C' }]}>Favoris</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.footerAction, styles.bookAction]}
                        onPress={() => router.push(`/pro/${item.id}`)}
                    >
                        <Text style={styles.bookActionText}>Réserver</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
                <View style={styles.emptyAnimationContainer}>
                    <LottieView
                        source={require('../../assets/animations/empty.json')}
                        style={styles.emptyAnimation}
                        autoPlay
                        loop
                    />
                </View>
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
        backgroundColor: '#FAFAFA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.gray.medium,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyAnimationContainer: {
        width: 200,
        height: 200,
        marginBottom: 16,
    },
    emptyAnimation: {
        width: '100%',
        height: '100%',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.secondary,
        marginTop: 16,
    },
    emptyText: {
        fontSize: 15,
        color: Colors.gray.medium,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },
    exploreButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
    },
    exploreButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        paddingVertical: 16,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 24,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    cardImage: {
        width: screenWidth,
        height: screenWidth * 0.75,
        backgroundColor: '#F0F0F0',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    infoSection: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    proName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.secondary,
        marginBottom: 2,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cityText: {
        fontSize: 12,
        color: Colors.gray.medium,
    },
    priceTag: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
    },
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#DBDBDB',
        paddingVertical: 8,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerActionText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.secondary,
    },
    bookAction: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bookActionText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
});
