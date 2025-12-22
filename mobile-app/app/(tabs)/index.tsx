import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { cache } from '../../services/cache';
import { ProProfile, ServiceCategory } from '../../types';
import { Colors, Spacing, FontSizes } from '../../constants';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32;

export default function HomeScreen() {
    const router = useRouter();
    const [pros, setPros] = useState<ProProfile[]>([]);
    const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showCityModal, setShowCityModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [likedPros, setLikedPros] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadData();
        loadFavorites();
    }, []);

    useEffect(() => {
        loadPros();
    }, [selectedCity, selectedCategory]);

    const loadFavorites = async () => {
        const result = await api.getFavorites();
        if (result.success && result.data) {
            setLikedPros(new Set(result.data.map(f => f.id)));
        }
    };

    const loadData = async () => {
        setIsLoading(true);

        // Try to load from cache first
        const cachedPros = await cache.get<ProProfile[]>('pros');
        const cachedCities = await cache.get<{ id: string; name: string }[]>('cities');
        const cachedCategories = await cache.get<ServiceCategory[]>('categories');

        if (cachedPros) setPros(cachedPros);
        if (cachedCities) setCities(cachedCities);
        if (cachedCategories) setCategories(cachedCategories);

        // Try to fetch fresh data
        try {
            const [prosResult, citiesResult, categoriesResult] = await Promise.all([
                api.getPros(),
                api.getCities(),
                api.getCategories(),
            ]);

            if (prosResult.success && prosResult.data) {
                setPros(prosResult.data);
                await cache.set('pros', prosResult.data);
            }
            if (citiesResult.success && citiesResult.data) {
                setCities(citiesResult.data);
                await cache.set('cities', citiesResult.data);
            }
            if (categoriesResult.success && categoriesResult.data) {
                setCategories(categoriesResult.data);
                await cache.set('categories', categoriesResult.data);
            }
            setIsOffline(false);
        } catch (error) {
            setIsOffline(true);
        }

        setIsLoading(false);
    };

    const loadPros = async () => {
        const filters: any = {};
        if (selectedCity) filters.city = selectedCity;
        if (selectedCategory) filters.category = selectedCategory;
        if (searchQuery) filters.q = searchQuery;

        const result = await api.getPros(filters);
        if (result.success && result.data) {
            setPros(result.data);
        }
    };

    const toggleLike = async (proId: string) => {
        const newLiked = new Set(likedPros);
        if (likedPros.has(proId)) {
            newLiked.delete(proId);
            await api.removeFavorite(proId);
        } else {
            newLiked.add(proId);
            await api.addFavorite(proId);
        }
        setLikedPros(newLiked);
    };

    const handleMessage = async (proId: string, userId: string) => {
        const result = await api.createConversation(userId);
        if (result.success && result.data?.id) {
            router.push(`/chat/${result.data.id}`);
        }
    };

    const filteredPros = pros.filter((pro) =>
        pro.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pro.city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Category emoji mapping
    const getCategoryEmoji = (name: string) => {
        const emojiMap: Record<string, string> = {
            'Coiffure': '💇',
            'Massage': '💆',
            'Beauté': '💅',
            'Fitness': '💪',
            'Cuisine': '👨‍🍳',
            'Photo': '📸',
            'Musique': '🎵',
            'Cours': '📚',
        };
        return emojiMap[name] || '✨';
    };

    const renderPro = ({ item }: { item: ProProfile }) => {
        const avgRating = item.reviews.length > 0
            ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
            : 0;
        const isLiked = likedPros.has(item.id);
        const coverImage = item.gallery?.[0]?.imageUrl;

        return (
            <View style={styles.card}>
                {/* Image Section */}
                <TouchableOpacity
                    onPress={() => router.push(`/pro/${item.id}`)}
                    activeOpacity={0.95}
                >
                    {coverImage ? (
                        <Image
                            source={{ uri: coverImage }}
                            style={styles.cardImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.cardImage, styles.placeholderImage]}>
                            <Ionicons name="person" size={60} color={Colors.gray.medium} />
                        </View>
                    )}

                    {/* Rating Badge */}
                    {avgRating > 0 && (
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Action Buttons Row */}
                <View style={styles.actionsRow}>
                    <View style={styles.leftActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => toggleLike(item.id)}
                        >
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={26}
                                color={isLiked ? "#FF3B5C" : Colors.secondary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleMessage(item.id, item.user.id)}
                        >
                            <Ionicons name="chatbubble-outline" size={24} color={Colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push({
                                pathname: '/quick-book',
                                params: {
                                    id: item.id,
                                    name: item.user.name || 'Pro',
                                    rate: String(item.hourlyRate || 100),
                                },
                            })}
                        >
                            <Ionicons name="calendar-outline" size={24} color={Colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.priceTag}>{item.hourlyRate}₪/h</Text>
                </View>

                {/* Info Section */}
                <TouchableOpacity
                    style={styles.infoSection}
                    onPress={() => router.push(`/pro/${item.id}`)}
                >
                    <View style={styles.nameRow}>
                        <Text style={styles.proName}>{item.user.name}</Text>
                        <View style={styles.locationBadge}>
                            <Ionicons name="location" size={12} color={Colors.primary} />
                            <Text style={styles.cityText}>{item.city.name}</Text>
                        </View>
                    </View>

                    {item.serviceCategories.length > 0 && (
                        <View style={styles.categoriesRow}>
                            {item.serviceCategories.slice(0, 3).map((cat) => (
                                <Text key={cat.id} style={styles.categoryPill}>
                                    {getCategoryEmoji(cat.name)} {cat.name}
                                </Text>
                            ))}
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Logo */}
            <View style={styles.header}>
                <Text style={styles.logo}>AniReserve</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/messages')}>
                    <Ionicons name="paper-plane-outline" size={26} color={Colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Offline Banner */}
            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline" size={16} color={Colors.white} />
                    <Text style={styles.offlineText}>Mode hors ligne</Text>
                </View>
            )}

            {/* Category Stories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.storiesContainer}
                contentContainerStyle={styles.storiesContent}
            >
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.storyItem,
                            selectedCategory === cat.id && styles.storyItemActive
                        ]}
                        onPress={() => setSelectedCategory(
                            selectedCategory === cat.id ? '' : cat.id
                        )}
                    >
                        <View style={[
                            styles.storyCircle,
                            selectedCategory === cat.id && styles.storyCircleActive
                        ]}>
                            <Text style={styles.storyEmoji}>{getCategoryEmoji(cat.name)}</Text>
                        </View>
                        <Text style={[
                            styles.storyLabel,
                            selectedCategory === cat.id && styles.storyLabelActive
                        ]} numberOfLines={1}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.gray.medium} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher..."
                    placeholderTextColor={Colors.gray.medium}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={loadPros}
                />
                {selectedCity && (
                    <TouchableOpacity
                        style={styles.cityChip}
                        onPress={() => setShowCityModal(true)}
                    >
                        <Text style={styles.cityChipText}>
                            {cities.find(c => c.id === selectedCity)?.name}
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedCity('')}>
                            <Ionicons name="close-circle" size={16} color={Colors.white} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                {!selectedCity && (
                    <TouchableOpacity onPress={() => setShowCityModal(true)}>
                        <Ionicons name="location-outline" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Feed */}
            <FlatList
                data={filteredPros}
                renderItem={renderPro}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshing={isLoading}
                onRefresh={loadData}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={64} color={Colors.gray.light} />
                        <Text style={styles.emptyText}>Aucun professionnel trouvé</Text>
                        <Text style={styles.emptySubtext}>Essayez une autre recherche</Text>
                    </View>
                }
            />

            {/* City Modal */}
            <Modal visible={showCityModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📍 Choisir une ville</Text>
                            <TouchableOpacity onPress={() => setShowCityModal(false)}>
                                <Ionicons name="close" size={28} color={Colors.secondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {cities.map((city) => (
                                <TouchableOpacity
                                    key={city.id}
                                    style={[
                                        styles.modalItem,
                                        selectedCity === city.id && styles.modalItemActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedCity(city.id);
                                        setShowCityModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedCity === city.id && styles.modalItemTextActive
                                    ]}>
                                        {city.name}
                                    </Text>
                                    {selectedCity === city.id && (
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Category Modal */}
            <Modal visible={showCategoryModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>✨ Catégories</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <Ionicons name="close" size={28} color={Colors.secondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.modalItem,
                                        selectedCategory === category.id && styles.modalItemActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(category.id);
                                        setShowCategoryModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        selectedCategory === category.id && styles.modalItemTextActive
                                    ]}>
                                        {getCategoryEmoji(category.name)} {category.name}
                                    </Text>
                                    {selectedCategory === category.id && (
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    logo: {
        fontSize: 26,
        fontWeight: '700',
        color: Colors.secondary,
        letterSpacing: -0.5,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warning,
        padding: 8,
        gap: 6,
        justifyContent: 'center',
    },
    offlineText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    // Category Stories
    storiesContainer: {
        backgroundColor: '#fff',
        maxHeight: 100,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    storiesContent: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 16,
    },
    storyItem: {
        alignItems: 'center',
        width: 72,
    },
    storyItemActive: {},
    storyCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#DBDBDB',
    },
    storyCircleActive: {
        borderColor: Colors.primary,
        borderWidth: 3,
    },
    storyEmoji: {
        fontSize: 28,
    },
    storyLabel: {
        fontSize: 11,
        color: Colors.gray.dark,
        marginTop: 4,
        textAlign: 'center',
    },
    storyLabelActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFEFEF',
        margin: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.secondary,
    },
    cityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        gap: 4,
    },
    cityChipText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    // Feed Cards
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 0,
        marginBottom: 24,
        borderTopWidth: 0.5,
        borderTopColor: '#DBDBDB',
    },
    cardImage: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 0.75,
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
    // Actions
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 8,
    },
    leftActions: {
        flexDirection: 'row',
        gap: 4,
    },
    actionButton: {
        padding: 8,
    },
    priceTag: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
        paddingRight: 8,
    },
    // Info Section
    infoSection: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    proName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.secondary,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    cityText: {
        fontSize: 12,
        color: Colors.primary,
    },
    categoriesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    categoryPill: {
        fontSize: 12,
        color: Colors.gray.dark,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.gray.dark,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.gray.medium,
        marginTop: 4,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.secondary,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: '#EFEFEF',
    },
    modalItemActive: {
        backgroundColor: Colors.primary + '10',
    },
    modalItemText: {
        fontSize: 16,
        color: Colors.secondary,
    },
    modalItemTextActive: {
        fontWeight: '600',
        color: Colors.primary,
    },
});
